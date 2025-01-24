import { Actor, type ActorObject } from "..";

import { playerData } from "../../data";
import type { PlayerCreatureData, PlayerCreatureId, PlayerFleeceData, PlayerFleeceId } from "../../data/types";

export class Player extends Actor implements PlayerObject {
    static readonly TEXTURE_FILENAME: string = "player-main.png";
    static readonly ATLAS_FILENAME: string = "player-main.atlas";
    static readonly SKELETON_FILENAME: string = "player-main.skel";

    #creature: PlayerCreatureId;
    #fleece: PlayerFleeceId;

    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = playerData.creature.Lamb.name, creature: PlayerCreatureId = "Lamb", fleece: PlayerFleeceId = "Lamb") {
        super(skeleton, animationState, id, label);

        this.#creature = creature;
        this.#fleece = fleece;

        this.update();
    }

    get creature(): PlayerCreatureId {
        return this.#creature;
    }

    set creature(creature: PlayerCreatureId) {
        this.#creature = creature;
        this.update();
    }

    get fleece(): PlayerFleeceId {
        return this.#fleece;
    }

    set fleece(fleece: PlayerFleeceId) {
        this.#fleece = fleece;
        this.update();
    }

    get creatureData(): PlayerCreatureData {
        return playerData.creature[this.creature];
    }

    get fleeceData(): PlayerFleeceData {
        return playerData.fleece[this.fleece];
    }

    clone(id?: string, label?: string, creature: PlayerCreatureId = this.creature, fleece: PlayerFleeceId = this.fleece) {
        const { skeleton, animationState } = this;
        const player = new Player(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, creature, fleece);
        
        return player;
    }

    update() {
        const { creature, creatureData, fleece, fleeceData } = this;

        const creatureVariant = creatureData.variant;
        const creatureSkin = new spine.Skin(`Creature ${creatureVariant}`);

        creatureSkin.copySkin(this.skeleton.data.findSkin(creatureVariant));
        creatureSkin.getAttachments().filter(({ name }) => name.includes("Poncho")).forEach(({ name, slotIndex }) => creatureSkin.removeAttachment(slotIndex, name));

        this.setCustomSkin(creatureSkin);

        const fleeceVariant = fleeceData.variant;
        const fleeceSkin = new spine.Skin(`Fleece ${fleeceVariant}`);

        this.skeleton.data.findSkin(fleeceVariant).getAttachments().filter(({ name }) => ["Poncho", "Leaf"].concat(fleece !== "Natural" || creature === "Lamb" ? ["Bell", "Body"] : []).some((str) => name.includes(str))).forEach(({ name, attachment, slotIndex }) => fleeceSkin.setAttachment(slotIndex, name, attachment));
        this.addCustomSkin(fleeceSkin);

        this.tick();
    }

    copyFromObj(obj: PlayerObject) {
        const { creature, fleece } = obj;
        
        this.creature = creature;
        this.fleece = fleece;

        super.copyFromObj(obj);
    }

    toObj(): PlayerObject {
        const { creature, fleece } = this;
        return { ...super.toObj(), type: "player", creature, fleece };
    }
}

export interface PlayerObject extends ActorObject {
    creature: PlayerCreatureId; 
    fleece: PlayerFleeceId;
}

export function isPlayerObj(obj: ActorObject): obj is PlayerObject {
    return obj instanceof Player || obj.type === "player";
} 