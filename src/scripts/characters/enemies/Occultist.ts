import { occultistData } from "../../../data/files";
import type { OccultistId } from "../../../data/types";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "occultist";

export class Occultist extends Actor implements OccultistObject {
    static readonly TEXTURE_FILENAME: string = "Sorcerer.png";
    static readonly ATLAS_FILENAME: string = "Sorcerer.atlas";
    static readonly SKELETON_FILENAME: string = "Sorcerer.skel";

    #occultist: OccultistId;
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = occultistData.Summoner.name, occultist: OccultistId = "Summoner") {
        super(skeleton, animationState, id, label);
        this.#occultist = occultist;

        this.update();
    }

    get occultist(): OccultistId {
        return this.#occultist;
    }

    set occultist(occultist: OccultistId) {
        this.#occultist = occultist;
        this.update();
    }

    clone(id?: string, label?: string, occultistId: OccultistId = this.occultist) {
        const { skeleton, animationState } = this;

        const occultist = new Occultist(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, occultistId);
        occultist.copyFromObj(this.toObj());

        occultist.occultist = occultistId;

        return occultist;
    }

    update() {
        const { occultist } = this;

        const { skin } = occultistData[occultist];
        this.setSkin(skin);

        this.tick();
    }

    copyFromObj(obj: OccultistObject) {
        const { occultist } = obj;
        this.occultist = occultist;

        super.copyFromObj(obj);
    }
    
    toObj(): OccultistObject {
        const { occultist } = this;
        return { ...super.toObj(), type: TYPE, occultist };
    }
}

export interface OccultistObject extends ActorObject { occultist: OccultistId; }
export function isOccultistObj(obj: ActorObject): obj is OccultistObject {
    return obj instanceof Occultist || obj.type === TYPE;
}