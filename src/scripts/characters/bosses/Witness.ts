import { witnessData } from "../../../data";
import { Random } from "../../../utils";

import { Actor, type ActorObject } from "../../Actor";

export class Witness extends Actor {
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id: string = Random.id(), label: string = witnessData.Darkwood.name) {
        super(skeleton, animationState, id, label);
    }
}

export interface WitnessObject extends ActorObject {

}

export function isMiniBossObj(obj: ActorObject): obj is WitnessObject {
    return obj instanceof Witness || obj.type === "witness";
}