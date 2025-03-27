import { hereticData } from "../../../data/files";
import type { HereticId } from "../../../data/types";

import { MoreMath } from "../../../utils";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "heretic";

export class Heretic extends Actor implements HereticObject {
    #stage: number;
    #isBackFacing: boolean | null;

    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label: string = hereticData.Green_Bagworm.name, readonly heretic: HereticId = "Green_Bagworm") {
        super(skeletonData, atlas, id, label);

        this.#stage = 0;
        this.#isBackFacing = "backSkins" in hereticData[heretic] ? false : null;

        this.update();
    }

    get stage(): number {
        return this.#stage;
    }

    set stage(stage: number) {
        const { heretic, isBackFacing } = this;
        const { skins, backSkins = skins } = hereticData[heretic];

        const selectedSkins = isBackFacing ? backSkins : skins;
        this.#stage = MoreMath.clamp(stage, 0, selectedSkins.length - 1);

        this.update();
    }

    get isBackFacing(): boolean | null {
        return this.#isBackFacing;
    }

    set isBackFacing(isBackFacing: boolean | null) {
        this.#isBackFacing = "backSkins" in hereticData[this.heretic] ? isBackFacing ?? false : null;
        this.update();
    }

    clone(id?: string, label?: string) {
        const { skeleton, atlas, heretic: hereticId } = this;

        const heretic = new Heretic(skeleton.data, atlas, id, label, hereticId);
        heretic.copyFromObj(this.toObj());

        return heretic;
    }

    update() {
        const { heretic, stage, isBackFacing } = this;
        const { skins, backSkins = skins } = hereticData[heretic];

        const [firstSkin, ...additionalSkins] = (isBackFacing ? backSkins : skins)[stage];

        this.setSkin(firstSkin);
        this.addSkins(...additionalSkins);

        this.tick();
    }

    copyFromObj(obj: HereticObject) {
        const { stage, isBackFacing } = obj;
        
        this.stage = stage;
        this.isBackFacing = isBackFacing;

        super.copyFromObj(obj);
    }

    toObj(): HereticObject {
        const { heretic, stage, isBackFacing } = this;
        return { ...super.toObj(), type: TYPE, heretic, stage, isBackFacing };
    }
}

export interface HereticObject extends ActorObject {
    heretic: HereticId;

    stage: number;
    isBackFacing: boolean | null;
}

export function isHereticObj(obj: ActorObject): obj is HereticObject {
    return obj instanceof Heretic || obj.type === TYPE;
}