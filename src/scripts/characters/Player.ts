import { Actor, type ActorObject } from "..";

import { playerData } from "../../data/files";
import type { PlayerCreatureData, PlayerCreatureId, PlayerFleeceData, PlayerFleeceId } from "../../data/types";

export class Player extends Actor implements PlayerObject {
    static readonly TEXTURE_FILENAME: string = "player-main.png";
    static readonly ATLAS_FILENAME: string = "player-main.atlas";
    static readonly SKELETON_FILENAME: string = "player-main.skel";

    static readonly CREATURE_SKIN_PREFIX: string = "Creature";
    static readonly FLEECE_SKIN_PREFIX: string = "Fleece";

    static readonly FLEECE_ATTACHMENT_NAME: string = "Poncho";
    static readonly BODY_ATTACHMENT_NAMES: string[] = ["Body", "Bell", "Leaf"];

    static readonly HURT_LAMB_PREFIX: string = "Hurt";
    static readonly HURT_GOAT_PREFIX: string = "Goat_Hurt";

    #creature: PlayerCreatureId;
    #fleece: PlayerFleeceId;

    #hurtState: PlayerHurtState;

    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = playerData.creature.Lamb.name, creature: PlayerCreatureId = "Lamb", fleece: PlayerFleeceId = "Lamb") {
        super(skeleton, animationState, id, label);

        this.#creature = creature;
        this.#fleece = fleece;

        this.#hurtState = PlayerHurtState.Normal;

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

    get hurtState(): PlayerHurtState {
        return this.#hurtState;
    }

    set hurtState(hurtState: PlayerHurtState) {
        this.#hurtState = hurtState;
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
        player.copyFromObj(this.toObj());

        player.creature = creature;
        player.fleece = fleece;

        return player;
    }

    update() {
        const { creature, creatureData, fleece, fleeceData, hurtState } = this;
        
        const creatureVariant = creatureData.variant;
        const creatureSkin = new spine.Skin(`${Player.CREATURE_SKIN_PREFIX} ${creatureVariant}`);

        creatureSkin.copySkin(this.skeleton.data.findSkin(creatureVariant));
        creatureSkin.getAttachments().filter(({ name }) => name.includes(Player.FLEECE_ATTACHMENT_NAME)).forEach(({ name, slotIndex }) => creatureSkin.removeAttachment(slotIndex, name));

        this.setCustomSkin(creatureSkin);

        const fleeceVariant = fleeceData.variant;
        const fleeceSkin = new spine.Skin(`${Player.FLEECE_SKIN_PREFIX} ${fleeceVariant}`);

        this.skeleton.data.findSkin(fleeceVariant).getAttachments().filter(({ name }) => [Player.FLEECE_ATTACHMENT_NAME, ...Player.BODY_ATTACHMENT_NAMES.slice(+(fleece === "Natural" && creature !== "Lamb") * (Player.BODY_ATTACHMENT_NAMES.length - 1))].some((str) => name.includes(str))).forEach(({ name, attachment, slotIndex }) => fleeceSkin.setAttachment(slotIndex, name, attachment));
        this.addCustomSkin(fleeceSkin);

        hurtState !== PlayerHurtState.Normal && this.addSkins(`${creature === "Goat" ? Player.HURT_GOAT_PREFIX : Player.HURT_LAMB_PREFIX}${hurtState}`);

        this.tick();
    }

    copyFromObj(obj: PlayerObject) {
        const { creature, fleece, hurtState } = obj;
        
        this.creature = creature;
        this.fleece = fleece;

        this.hurtState = hurtState;

        super.copyFromObj(obj);
    }

    toObj(): PlayerObject {
        const { creature, fleece, hurtState } = this;
        return { ...super.toObj(), type: "player", creature, fleece, hurtState };
    }
}

export interface PlayerObject extends ActorObject {
    creature: PlayerCreatureId; 
    fleece: PlayerFleeceId;

    hurtState: PlayerHurtState;
}

export enum PlayerHurtState {
    Normal,
    Bruised,
    Injured
}

export function isPlayerObj(obj: ActorObject): obj is PlayerObject {
    return obj instanceof Player || obj.type === "player";
} 