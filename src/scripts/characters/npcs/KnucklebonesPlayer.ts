import { knucklebonesPlayerData } from "../../../data/files";
import type { KnucklebonesPlayerId } from "../../../data/types";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "knucklebones-player";

export class KnucklebonesPlayer extends Actor implements KnucklebonesPlayerObject {
    #isOnlyHead: boolean;
    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label: string = knucklebonesPlayerData.Ratau.name, readonly player: KnucklebonesPlayerId = "Ratau") {
        super(skeletonData, atlas, id, label);
        this.#isOnlyHead = false;

        this.update();
    }

    get isOnlyHead(): boolean {
        return this.#isOnlyHead;
    }

    set isOnlyHead(isOnlyHead: boolean) {
        this.#isOnlyHead = isOnlyHead;
        this.update();
    }

    clone(id?: string, label?: string) {
        const { skeleton, atlas, player } = this;

        const knucklebonesPlayer = new KnucklebonesPlayer(skeleton.data, atlas, id, label, player);
        knucklebonesPlayer.copyFromObj(this.toObj());

        return knucklebonesPlayer;
    }

    update() {
        const { player, isOnlyHead } = this;

        const { skin, headSkin } = knucklebonesPlayerData[player];
        this.setSkin(isOnlyHead ? headSkin : skin);

        this.tick();
    }

    copyFromObj(obj: KnucklebonesPlayerObject) {
        const { isOnlyHead } = obj;
        this.isOnlyHead = isOnlyHead;

        super.copyFromObj(obj);
    }

    toObj(): KnucklebonesPlayerObject {
        const { player, isOnlyHead } = this;
        return { ...super.toObj(), type: TYPE, player, isOnlyHead };
    }
}

export interface KnucklebonesPlayerObject extends ActorObject {
    player: KnucklebonesPlayerId;
    isOnlyHead: boolean;
}

export function isKnucklebonesPlayerObj(obj: ActorObject): obj is KnucklebonesPlayerObject {
    return obj instanceof KnucklebonesPlayer || obj.type === TYPE;
}