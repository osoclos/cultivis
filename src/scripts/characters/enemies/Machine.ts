import { machineData } from "../../../data/files";
import type { MachineId } from "../../../data/types";

import { MoreMath } from "../../../utils";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "machine";

export class Machine extends Actor implements MachineObject {
    #stage: number;
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = machineData.Howler.name, readonly machine: MachineId = "Howler") {
        super(skeleton, animationState, id, label);
        this.#stage = 0;
        
        this.update();
    }

    get stage(): number {
        return this.#stage;
    }

    set stage(stage: number) {
        const { machine } = this;
        const { skins } = machineData[machine];

        this.#stage = MoreMath.clamp(stage, 0, skins.length - 1);
        this.update();
    }

    clone(id?: string, label?: string) {
        const { skeleton, animationState, machine: machineId } = this;

        const machine = new Machine(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, machineId);
        machine.copyFromObj(this.toObj());

        return machine;
    }

    update() {
        const { machine, stage } = this;
        const { skins } = machineData[machine];

        this.setSkin(skins[stage]);
        this.tick();
    }

    copyFromObj(obj: MachineObject) {
        const { stage } = obj;
        this.stage = stage;

        super.copyFromObj(obj);
    }

    toObj(): MachineObject {
        const { machine, stage } = this;
        return { ...super.toObj(), type: TYPE, machine, stage };
    }
}

export interface MachineObject extends ActorObject {
    machine: MachineId;
    stage: number;
}

export function isMachineObj(obj: ActorObject): obj is MachineObject {
    return obj instanceof Machine || obj.type === TYPE;
}