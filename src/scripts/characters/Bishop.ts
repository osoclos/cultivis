import { bishopData } from "../../data";
import type { BishopId } from "../../data/types";

import { Random } from "../../utils";

import { Actor, type ActorObject } from "../Actor";
import type { Factory } from "../Factory";

export class Bishop extends Actor implements BishopObject {
    static readonly NORMAL_SKIN_NAME: string = "Normal";
    static readonly PURGED_SKIN_NAME: string = "Beaten";

    #bishop: BishopId;
    #isBoss: boolean;

    #isPurged: boolean;

    private lastBishop!: BishopId;
    private lastIsBoss!: boolean;

    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, private factory: Factory, bishop: BishopId, isBoss: boolean, id: string = Random.id(), label: string = "Player") {
        super(skeleton, animationState, id, label);

        this.#bishop = bishop;
        this.#isBoss = isBoss;

        this.lastBishop = bishop;
        this.lastIsBoss = isBoss;

        this.#isPurged = false;
    }

    get bishop(): BishopId {
        return this.#bishop;
    }

    async setBishop(bishop: BishopId) {
        this.#bishop = bishop;
        await this.update();
    }

    get isBoss(): boolean {
        return this.#isBoss;
    }

    async setIsBoss(isBoss: boolean) {
        this.#isBoss = isBoss;
        await this.update();
    }

    get isPurged(): boolean {
        return this.#isPurged;
    }

    async setIsPurged(isPurged: boolean) {
        this.#isPurged = isPurged;
        await this.update();
    }

    clone(id: string = Random.id(), label: string = `${this.label} (Copy)`, bishopId: BishopId = this.bishop, isBoss: boolean = this.isBoss) {
        const { skeleton, animationState, factory } = this;
        const bishop = new Bishop(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), factory, bishopId, isBoss, id, label);
        
        return bishop;
    }

    async update() {
        const { bishop, isBoss, isPurged, lastBishop, lastIsBoss, factory } = this;
        if (bishop !== lastBishop || isBoss !== lastIsBoss && "bossSrc" in bishopData[bishop]) {
            this.lastBishop = bishop;
            this.lastIsBoss = isBoss;

            !factory.getLoadedBishop(bishop, isBoss) && await factory.loadBishop(bishop, isBoss);
            
            const { skeleton, animationState } = await factory.bishop(bishop, isBoss);
            this.skeleton = skeleton;
            this.animationState = animationState;
        }

        this.setSkin(isPurged ? Bishop.PURGED_SKIN_NAME : Bishop.NORMAL_SKIN_NAME);
        this.tick();
    }

    async copyFromObj(obj: BishopObject) {
        const { bishop, isBoss, isPurged } = obj;
        
        await this.setBishop(bishop);
        await this.setIsBoss(isBoss);
        
        await this.setIsPurged(isPurged);

        super.copyFromObj(obj);
    }
    
    toObj(): BishopObject {
        const { bishop, isBoss, isPurged } = this;
        return { ...super.toObj(), type: "bishop", bishop, isBoss, isPurged };
    }
}

export interface BishopObject extends ActorObject {
    bishop: BishopId; 
    isBoss: boolean;

    isPurged: boolean;
}

export function isBishopObj(obj: ActorObject): obj is BishopObject {
    return obj instanceof Bishop || obj.type === "bishop";
} 