import { guardData } from "../../../data/files";
import type { GuardId } from "../../../data/types";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "guard";

export class Guard extends Actor implements GuardObject {
    static readonly TEXTURE_FILENAME: string = "DoorGuardians_2.png";
    static readonly ATLAS_FILENAME: string = "DoorGuardians_2.atlas";
    static readonly SKELETON_FILENAME: string = "DoorGuardians_2.skel";

    #guard: GuardId;
    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label: string = guardData.Guardian.name, guard: GuardId = "Guardian") {
        super(skeletonData, atlas, id, label);
        this.#guard = guard;

        this.update();
    }

    get guard(): GuardId {
        return this.#guard;
    }

    set guard(guard: GuardId) {
        this.#guard = guard;
        this.update();
    }

    clone(id?: string, label?: string, guardId: GuardId = this.guard) {
        const { skeleton, atlas } = this;

        const guard = new Guard(skeleton.data, atlas, id, label, guardId);
        guard.copyFromObj(this.toObj());

        guard.guard = guardId;

        return guard;
    }

    update() {
        const { guard } = this;

        const { skin } = guardData[guard];
        this.setSkin(skin);

        this.tick();
    }

    copyFromObj(obj: GuardObject) {
        const { guard } = obj;
        this.guard = guard;

        super.copyFromObj(obj);
    }
    
    toObj(): GuardObject {
        const { guard } = this;
        return { ...super.toObj(), type: TYPE, guard };
    }
}

export interface GuardObject extends ActorObject { guard: GuardId; }
export function isGuardObj(obj: ActorObject): obj is GuardObject {
    return obj instanceof Guard || obj.type === TYPE;
}