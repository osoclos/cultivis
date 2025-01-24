import { witnessData } from "../../../data";
import { Actor, type ActorObject } from "../../Actor";
import { WITNESS_IDS, type WitnessId } from "/src/data/types";

export class Witness extends Actor implements WitnessObject {
    static readonly TEXTURE_FILENAME: string = "Beholder.png";
    static readonly ATLAS_FILENAME: string = "Beholder.atlas";
    static readonly SKELETON_FILENAME: string = "Beholder.skel";
    
    static readonly TEMPLATE_SKIN_NAME: string = "Dungeon";
    static readonly SKIN_INDEX_OFFSET: number = 1;

    static readonly UPGRADED_SKIN_SUFFIX: string = "_2";
    static readonly PURGED_SKIN_SUFFIX: string = "_Beaten";

    #witness: WitnessId;

    #isUpgraded: boolean;
    #isPurged: boolean;

    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = witnessData.Darkwood.name, witness: WitnessId = "Darkwood", isUpgraded: boolean = false) {
        super(skeleton, animationState, id, label);
        this.#witness = witness;

        this.#isUpgraded = isUpgraded;
        this.#isPurged = false;

        this.update();
    }

    get witness(): WitnessId {
        return this.#witness;
    }

    set witness(witness: WitnessId) {
        this.#witness = witness;
        this.update();
    }

    get isUpgraded(): boolean {
        return this.#isUpgraded;
    }

    set isUpgraded(isUpgraded: boolean) {
        this.#isUpgraded = isUpgraded;
        this.update();
    }

    get isPurged(): boolean {
        return this.#isPurged;
    }

    set isPurged(isPurged: boolean) {
        this.#isPurged = isPurged;
        this.update();
    }

    clone(id?: string, label?: string, witnessId: WitnessId = this.witness, isUpgraded: boolean = this.isUpgraded) {
        const { skeleton, animationState } = this;

        const witness = new Witness(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, witnessId, isUpgraded);
        witness.copyFromObj(this.toObj());

        return witness;
    }

    update() {
        const { witness, isUpgraded, isPurged } = this;
        this.setSkin(`${Witness.TEMPLATE_SKIN_NAME}${WITNESS_IDS.indexOf(witness) + Witness.SKIN_INDEX_OFFSET}${isUpgraded ? Witness.UPGRADED_SKIN_SUFFIX : ""}${isPurged ? Witness.PURGED_SKIN_SUFFIX : ""}`);

        this.tick();
    }

    copyFromObj(obj: WitnessObject) {
        const { witness, isUpgraded, isPurged } = obj;
        this.witness = witness;

        this.isUpgraded = isUpgraded;
        this.isPurged = isPurged;

        super.copyFromObj(obj);
    }

    toObj(): WitnessObject {
        const { witness, isUpgraded, isPurged } = this;
        return { ...super.toObj(), type: "witness", witness, isUpgraded, isPurged };
    }
}

export interface WitnessObject extends ActorObject {
    witness: WitnessId;

    isUpgraded: boolean;
    isPurged: boolean;
}

export function isMiniBossObj(obj: ActorObject): obj is WitnessObject {
    return obj instanceof Witness || obj.type === "witness";
}