import { miniBossData } from "../../../data";
import { Random } from "../../../utils";

import { Actor, type ActorObject } from "../../Actor";

export class MiniBoss extends Actor {
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id: string = Random.id(), label: string = miniBossData["Mama Worm"].name) {
        super(skeleton, animationState, id, label);
    }
}

export interface MiniBossObject extends ActorObject {

}

export function isMiniBossObj(obj: ActorObject): obj is MiniBossObject {
    return obj instanceof MiniBoss || obj.type === "mini-boss";
}