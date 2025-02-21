import { Actor, type ActorObject } from "../../Actor";

import { humanoidData } from "../../../data/files";
import type { HumanoidId } from "../../../data/types";

export class Humanoid extends Actor implements HumanoidObject {
    static readonly TEXTURE_FILENAME: string = "Human.png";
    static readonly ATLAS_FILENAME: string = "Human.atlas";
    static readonly SKELETON_FILENAME: string = "Human.skel";

    static readonly HOLD_SHIELD_SUFFIX: string = "_Shield";

    #humanoid: HumanoidId;
    #isHoldingShield: boolean | null;

    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = humanoidData.Swordsman.name, humanoid: HumanoidId = "Swordsman") {
        super(skeleton, animationState, id, label);

        this.#humanoid = humanoid;
        this.#isHoldingShield = humanoidData[humanoid].canHoldShield ? false : null;
    }

    get humanoid(): HumanoidId {
        return this.#humanoid;
    }

    set humanoid(humanoid: HumanoidId) {
        this.#humanoid = humanoid;
        this.update();
    }

    get isHoldingShield(): boolean | null {
        return this.#isHoldingShield;
    }

    set isHoldingShield(isHoldingShield: boolean | null) {
        this.#isHoldingShield = humanoidData[this.humanoid].canHoldShield ? isHoldingShield : null;
        this.update();
    }

    clone(id?: string, label?: string, humanoidId: HumanoidId = this.humanoid) {
        const { skeleton, animationState } = this;

        const humanoid = new Humanoid(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, humanoidId);
        humanoid.copyFromObj(this.toObj());

        humanoid.humanoid = humanoidId;

        return humanoid;
    }

    update() {
        const { humanoid, isHoldingShield } = this;

        const { skin, canHoldShield } = humanoidData[humanoid];
        this.setSkin(`${skin}${isHoldingShield && canHoldShield ? Humanoid.HOLD_SHIELD_SUFFIX : ""}`);

        this.tick();
    }

    copyFromObj(obj: HumanoidObject) {
        const { humanoid, isHoldingShield } = obj;

        this.humanoid = humanoid;
        this.isHoldingShield = isHoldingShield;

        super.copyFromObj(obj);
    }
    
    toObj(): HumanoidObject {
        const { humanoid, isHoldingShield } = this;
        return { ...super.toObj(), type: "humanoid", humanoid, isHoldingShield };
    }
}

export interface HumanoidObject extends ActorObject {
    humanoid: HumanoidId;
    isHoldingShield: boolean | null;
}

export function isHumanoidObj(obj: ActorObject): obj is HumanoidObject {
    return obj instanceof Humanoid || obj.type === "humanoid";
}