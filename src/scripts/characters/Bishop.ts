import { bishopData } from "../../data";
import type { BishopId } from "../../data/types";

import { Random } from "../../utils";

import { Actor, type ActorObject } from "../Actor";

export class Bishop extends Actor implements BishopObject {
    static readonly NORMAL_SKIN_NAME: string = "Normal";
    static readonly PURGED_SKIN_NAME: string = "Beaten";

    #isPurged: boolean;
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id: string = Random.id(), label: string = bishopData.Worm.name, readonly bishop: BishopId = "Worm", readonly isBoss: boolean = false) {
        super(skeleton, animationState, id, label);
        this.#isPurged = false;
        
        this.update();
    }

    get isPurged(): boolean {
        return this.#isPurged;
    }

    set isPurged(isPurged: boolean) {
        this.#isPurged = isPurged;
        this.update();
    }

    clone(id: string = Random.id(), label: string = `${this.label} (Copy)`) {
        const { skeleton, animationState, bishop: bishopId, isBoss } = this;

        const bishop = new Bishop(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, bishopId, isBoss);
        bishop.copyFromObj(this.toObj());

        return bishop;
    }

    update() {
        const { isPurged } = this;

        this.setSkin(isPurged ? Bishop.PURGED_SKIN_NAME : Bishop.NORMAL_SKIN_NAME);
        this.tick();
    }

    copyFromObj(obj: BishopObject) {
        const { isPurged } = obj;
        this.isPurged = isPurged;

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