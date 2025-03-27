import { occultistData } from "../../../data/files";
import type { OccultistId } from "../../../data/types";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "occultist";

export class Occultist extends Actor implements OccultistObject {
    static readonly TEXTURE_FILENAME: string = "Sorcerer.png";
    static readonly ATLAS_FILENAME: string = "Sorcerer.atlas";
    static readonly SKELETON_FILENAME: string = "Sorcerer.skel";

    #occultist: OccultistId;
    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label: string = occultistData.Summoner.name, occultist: OccultistId = "Summoner") {
        super(skeletonData, atlas, id, label);
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
        const { skeleton, atlas } = this;

        const occultist = new Occultist(skeleton.data, atlas, id, label, occultistId);
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