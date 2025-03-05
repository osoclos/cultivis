import { bishopData } from "../../../data/files";
import type { BishopId } from "../../../data/types";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "bishop";
export class Bishop extends Actor implements BishopObject {
    static readonly NORMAL_SKIN_NAME: string = "Normal";
    static readonly PURGED_SKIN_NAME: string = "Beaten";

    static readonly SHAMURA_BANDAGED_SKIN_NAME: string = "Mask";
    static readonly SHAMURA_WOUNDED_SKIN_NAME: string = "NoMask";

    #isPurged: boolean;
    #isBandaged: boolean | null;

    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = bishopData.Worm.name, readonly bishop: BishopId = "Worm", readonly isBoss: boolean = false) {
        super(skeleton, animationState, id, label);

        this.#isPurged = false;
        this.#isBandaged = bishop === "Spider" ? true : null;
        
        this.update();
    }

    get isPurged(): boolean {
        return this.#isPurged;
    }

    set isPurged(isPurged: boolean) {
        this.#isPurged = isPurged;
        this.update();
    }

    get isBandaged(): boolean | null {
        return this.#isBandaged;
    }

    set isBandaged(isBandaged: boolean | null) {
        this.#isBandaged = this.bishop === "Spider" ? isBandaged ?? true : null;
        this.update();
    }

    clone(id?: string, label?: string) {
        const { skeleton, animationState, bishop: bishopId, isBoss } = this;

        const bishop = new Bishop(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, bishopId, isBoss);
        bishop.copyFromObj(this.toObj());

        return bishop;
    }

    update() {
        const { bishop, isPurged, isBandaged } = this;
        this.setSkin(
            isPurged
                ? Bishop.PURGED_SKIN_NAME
                : bishop === "Spider"
                    ? isBandaged
                        ? Bishop.SHAMURA_BANDAGED_SKIN_NAME
                        : Bishop.SHAMURA_WOUNDED_SKIN_NAME
                : Bishop.NORMAL_SKIN_NAME
        );

        this.tick();
    }

    copyFromObj(obj: BishopObject) {
        const { isPurged, isBandaged } = obj;

        this.isPurged = isPurged;
        this.isBandaged = isBandaged;

        super.copyFromObj(obj);
    }
    
    toObj(): BishopObject {
        const { bishop, isBoss, isPurged, isBandaged } = this;
        return { ...super.toObj(), type: TYPE, bishop, isBoss, isPurged, isBandaged };
    }
}

export interface BishopObject extends ActorObject {
    bishop: BishopId; 
    isBoss: boolean;

    isPurged: boolean;
    isBandaged: boolean | null;
}

export function isBishopObj(obj: ActorObject): obj is BishopObject {
    return obj instanceof Bishop || obj.type === TYPE;
}