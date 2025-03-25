import { knucklebonesPlayerData } from "../../../data/files";
import type { KnucklebonesPlayerId } from "../../../data/types";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "knucklebones-player";

export class KnucklebonesPlayer extends Actor implements KnucklebonesPlayerObject {
    #isOnlyHead: boolean;
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = knucklebonesPlayerData.Ratau.name, readonly player: KnucklebonesPlayerId = "Ratau") {
        super(skeleton, animationState, id, label);
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
        const { skeleton, animationState, player } = this;

        const knucklebonesPlayer = new KnucklebonesPlayer(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, player);
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