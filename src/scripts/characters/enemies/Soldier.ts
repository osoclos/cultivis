import { soldierData } from "../../../data/files";
import type { SoldierId } from "../../../data/types";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "soldier";

export class Soldier extends Actor implements SoldierObject {
    static readonly TEXTURE_FILENAME: string = "Human.png";
    static readonly ATLAS_FILENAME: string = "Human.atlas";
    static readonly SKELETON_FILENAME: string = "Human.skel";

    static readonly HOLD_SHIELD_SUFFIX: string = "_Shield";

    #soldier: SoldierId;
    #isHoldingShield: boolean | null;

    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label: string = soldierData.Swordsman.name, soldier: SoldierId = "Swordsman") {
        super(skeletonData, atlas, id, label);

        this.#soldier = soldier;
        this.#isHoldingShield = soldierData[soldier].canHoldShield ? false : null;

        this.update();
    }

    get soldier(): SoldierId {
        return this.#soldier;
    }

    set soldier(soldier: SoldierId) {
        this.#soldier = soldier;
        this.update();
    }

    get isHoldingShield(): boolean | null {
        return this.#isHoldingShield;
    }

    set isHoldingShield(isHoldingShield: boolean | null) {
        this.#isHoldingShield = soldierData[this.soldier].canHoldShield ? isHoldingShield : null;
        this.update();
    }

    clone(id?: string, label?: string, soldierId: SoldierId = this.soldier) {
        const { skeleton, atlas } = this;

        const soldier = new Soldier(skeleton.data, atlas, id, label, soldierId);
        soldier.copyFromObj(this.toObj());

        soldier.soldier = soldierId;

        return soldier;
    }

    update() {
        const { soldier, isHoldingShield } = this;

        const { skin, canHoldShield } = soldierData[soldier];
        this.setSkin(`${skin}${isHoldingShield && canHoldShield ? Soldier.HOLD_SHIELD_SUFFIX : ""}`);

        this.tick();
    }

    copyFromObj(obj: SoldierObject) {
        const { soldier, isHoldingShield } = obj;

        this.soldier = soldier;
        this.isHoldingShield = isHoldingShield;

        super.copyFromObj(obj);
    }
    
    toObj(): SoldierObject {
        const { soldier, isHoldingShield } = this;
        return { ...super.toObj(), type: TYPE, soldier, isHoldingShield };
    }
}

export interface SoldierObject extends ActorObject {
    soldier: SoldierId;
    isHoldingShield: boolean | null;
}

export function isSoldierObj(obj: ActorObject): obj is SoldierObject {
    return obj instanceof Soldier || obj.type === TYPE;
}