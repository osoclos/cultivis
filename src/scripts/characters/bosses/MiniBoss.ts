import { miniBossData } from "../../../data/files";
import type { MiniBossId } from "../../../data/types";

import { Actor, type ActorObject } from "../../Actor";

export class MiniBoss extends Actor implements MiniBossObject {
    #isUpgraded: boolean;
    #isBackFacing: boolean | null;

    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = miniBossData["Mama Worm"].name, readonly miniBoss: MiniBossId = "Mama Worm", isUpgraded: boolean = false) {
        super(skeleton, animationState, id, label);

        this.#isUpgraded = isUpgraded;
        this.#isBackFacing = ["backSkins", "backUpgradedSkins"].every((key) => key in miniBossData[this.miniBoss]) ? false : null;

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
        if (!["backSkins", "backUpgradedSkins"].every((key) => key in miniBossData[this.miniBoss])) return;

        this.#isBackFacing = isBackFacing;
        this.update();
    }

    clone(id?: string, label?: string, isUpgraded: boolean = this.isUpgraded) {
        const { skeleton, animationState, miniBoss } = this;

        const boss = new MiniBoss(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, miniBoss, isUpgraded);
        boss.copyFromObj(this.toObj());

        return boss;
    }

    update() {
        const { miniBoss, isUpgraded, isBackFacing } = this;
        const {
            skins,
            backSkins = skins,
            
            upgradedSkins,
            backUpgradedSkins = upgradedSkins,
        } = miniBossData[miniBoss];

        const [firstSkin, ...additionalSkins] = 
            isBackFacing
                ? [...(isUpgraded
                    ? backUpgradedSkins
                    : backSkins)].reverse()
                : isUpgraded
                    ? upgradedSkins
                    : skins;

        this.setSkin(firstSkin);
        this.addSkins(...additionalSkins);

        this.tick();
    }

    copyFromObj(obj: MiniBossObject) {
        const { isUpgraded, isBackFacing } = obj;

        this.isUpgraded = isUpgraded;
        this.isBackFacing = isBackFacing;

        super.copyFromObj(obj);
    }

    toObj(): MiniBossObject {
        const { miniBoss, isUpgraded, isBackFacing } = this;
        return { ...super.toObj(), type: "mini-boss", miniBoss, isUpgraded, isBackFacing };
    }
}

export interface MiniBossObject extends ActorObject {
    miniBoss: MiniBossId;

    isUpgraded: boolean;
    isBackFacing: boolean | null;
}

export function isMiniBossObj(obj: ActorObject): obj is MiniBossObject {
    return obj instanceof MiniBoss || obj.type === "mini-boss";
}