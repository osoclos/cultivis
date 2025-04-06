import { questGiverData } from "../../../data/files";
import type { QuestGiverId } from "../../../data/types";

import { MoreMath } from "../../../utils";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "quest-giver";

export class QuestGiver extends Actor implements QuestGiverObject {
    #stage: number;
    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label: string = questGiverData.Fish_Man.name, readonly giver: QuestGiverId = "Fish_Man") {
        super(skeletonData, atlas, id, label);
        this.#stage = 0;
        
        this.update();
    }

    get stage(): number {
        return this.#stage;
    }

    set stage(stage: number) {
        const { giver } = this;
        const { skins } = questGiverData[giver];

        this.#stage = MoreMath.clamp(stage, 0, skins.length - 1);
        this.update();
    }

    clone(id?: string, label?: string) {
        const { skeleton, atlas, giver } = this;

        const questGiver = new QuestGiver(skeleton.data, atlas, id, label, giver);
        questGiver.copyFromObj(this.toObj());

        return questGiver;
    }

    update() {
        const { giver, stage } = this;
        const { skins } = questGiverData[giver];

        this.setSkin(skins[stage]);
        this.tick();
    }

    copyFromObj(obj: QuestGiverObject) {
        const { stage } = obj;
        this.stage = stage;

        super.copyFromObj(obj);
    }

    toObj(): QuestGiverObject {
        const { giver, stage } = this;
        return { ...super.toObj(), type: TYPE, giver, stage };
    }
}

export interface QuestGiverObject extends ActorObject {
    giver: QuestGiverId;
    stage: number;
}

export function isQuestGiverObj(obj: ActorObject): obj is QuestGiverObject {
    return obj instanceof QuestGiver || obj.type === TYPE;
}