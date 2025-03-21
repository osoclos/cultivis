import { miniBossData } from "../../../data/files";
import type { MiniBossId } from "../../../data/types";

import { MoreMath } from "../../../utils";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "mini-boss";

export class MiniBoss extends Actor implements MiniBossObject {
    #stage: number;

    #isUpgraded: boolean;
    #isBackFacing: boolean | null;

    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = miniBossData["Mama Worm"].name, readonly miniBoss: MiniBossId = "Mama Worm", isUpgraded: boolean = false) {
        super(skeleton, animationState, id, label);

        this.#stage = 0;

        this.#isUpgraded = isUpgraded;
        this.#isBackFacing = ["backSkins", "backUpgradedSkins"].every((key) => key in miniBossData[miniBoss]) ? false : null;

        this.update();
    }

    get stage(): number {
        return this.#stage;
    }

    set stage(stage: number) {
        const { miniBoss, isUpgraded, isBackFacing } = this;
        const {
            skins,
            backSkins = skins,
            
            upgradedSkins,
            backUpgradedSkins = upgradedSkins,
        } = miniBossData[miniBoss];

        const selectedSkins = 
            (isBackFacing
                ? isUpgraded
                    ? backUpgradedSkins
                    : backSkins
                : isUpgraded
                    ? upgradedSkins
                    : skins);

        this.#stage = MoreMath.clamp(stage, 0, selectedSkins.length - 1);
        this.update();
    }

    get isUpgraded(): boolean {
        return this.#isUpgraded;
    }

    set isUpgraded(isUpgraded: boolean) {
        this.#isUpgraded = isUpgraded;
        this.update();
    }

    get isBackFacing(): boolean | null {
        return this.#isBackFacing;
    }

    set isBackFacing(isBackFacing: boolean | null) {
        this.#isBackFacing = ["backSkins", "backUpgradedSkins"].every((key) => key in miniBossData[this.miniBoss]) ? isBackFacing ?? false : null;
        this.update();
    }

    clone(id?: string, label?: string, isUpgraded: boolean = this.isUpgraded) {
        const { skeleton, animationState, miniBoss: miniBossId } = this;

        const miniBoss = new MiniBoss(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, miniBossId, isUpgraded);
        miniBoss.copyFromObj(this.toObj());

        return miniBoss;
    }

    update() {
        const { miniBoss, stage, isUpgraded, isBackFacing } = this;
        const {
            skins,
            backSkins = skins,
            
            upgradedSkins,
            backUpgradedSkins = upgradedSkins,
        } = miniBossData[miniBoss];

        const [firstSkin, ...additionalSkins] = 
            (isBackFacing
                ? isUpgraded
                    ? backUpgradedSkins
                    : backSkins
                : isUpgraded
                    ? upgradedSkins
                    : skins)[stage];

        this.setSkin(firstSkin);
        this.addSkins(...additionalSkins);

        this.tick();
    }

    copyFromObj(obj: MiniBossObject) {
        const { stage, isUpgraded, isBackFacing } = obj;
        
        this.stage = stage;

        this.isUpgraded = isUpgraded;
        this.isBackFacing = isBackFacing;

        super.copyFromObj(obj);
    }

    toObj(): MiniBossObject {
        const { miniBoss, stage, isUpgraded, isBackFacing } = this;
        return { ...super.toObj(), type: TYPE, miniBoss, stage, isUpgraded, isBackFacing };
    }
}

export interface MiniBossObject extends ActorObject {
    miniBoss: MiniBossId;

    stage: number;

    isUpgraded: boolean;
    isBackFacing: boolean | null;
}

export function isMiniBossObj(obj: ActorObject): obj is MiniBossObject {
    return obj instanceof MiniBoss || obj.type === TYPE;
}