import { playerData } from "../../data/files";
import { PLAYER_BELL_IDS, type PlayerBellData, type PlayerBellId, type PlayerCreatureData, type PlayerCreatureId, type PlayerCrownData, type PlayerCrownId, type PlayerFleeceData, type PlayerFleeceId } from "../../data/types";

import { Actor, type ActorObject } from "../Actor";

const TYPE: string = "player";

export class Player extends Actor implements PlayerObject {
    static readonly TEXTURE_FILENAME: string = "player-main.png";
    static readonly ATLAS_FILENAME: string = "player-main.atlas";
    static readonly SKELETON_FILENAME: string = "player-main.skel";

    static readonly TEXTURE_FILE_PATH: string = "compressed/player-main.png";

    static readonly CREATURE_SKIN_NAME: string = "Creature";
    static readonly CROWN_SKIN_NAME: string = "Crown";

    static readonly FLEECE_SKIN_NAME: string = "Fleece";
    static readonly BELL_SKIN_NAME: string = "Bell";

    static readonly CROWN_ATTACHMENT_NAME: string = "CROWN";
    static readonly CROWN_EYE_ATTACHMENT_NAME: string = "CROWN_EYE";
    static readonly BELL_ATTACHMENT_NAMES: string[] = ["Bell", "Rope"];

    static readonly FLEECE_ATTACHMENT_NAME: string = "Poncho";
    static readonly BODY_ATTACHMENT_NAMES: string[] = ["Body", "Leaf"]; 

    static readonly HURT_LAMB_PREFIX: string = "Hurt";
    static readonly HURT_GOAT_PREFIX: string = "Goat_Hurt";

    static readonly LAMB_HEAD_SKIN_NAME: string = "JustHead";
    static readonly GOAT_HEAD_SKIN_NAME: string = "Goat_JustHead";
    
    #creature: PlayerCreatureId;
    #crown: PlayerCrownId | null;

    #fleece: PlayerFleeceId;
    #bell: PlayerBellId | null;

    #hurtState: PlayerHurtState;
    #isOnlyHead: boolean;

    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label: string = playerData.creatures.Lamb.name, creature: PlayerCreatureId = "Lamb", fleece: PlayerFleeceId = "Lamb") {
        super(skeletonData, atlas, id, label);

        this.#creature = creature;
        this.#crown = creature === "Lamb" ? "Red" : "Purple";

        this.#fleece = fleece;
        this.#bell = 
            PLAYER_BELL_IDS.includes(<PlayerBellId>fleece)
                ? <PlayerBellId>fleece :
            creature === "Lamb"
                ? "Lamb"
                : "Goat";

        this.#hurtState = PlayerHurtState.Normal;
        this.#isOnlyHead = false;

        this.update();
    }

    get creature(): PlayerCreatureId {
        return this.#creature;
    }

    set creature(creature: PlayerCreatureId) {
        this.#creature = creature;
        this.update();
    }

    get crown(): PlayerCrownId | null {
        return this.#crown;
    }

    set crown(crown: PlayerCrownId | null) {
        this.#crown = crown;
        this.update();
    }

    get fleece(): PlayerFleeceId {
        return this.#fleece;
    }

    set fleece(fleece: PlayerFleeceId) {
        this.#fleece = fleece;
        this.update();
    }

    get bell(): PlayerBellId | null {
        return this.#bell;
    }

    set bell(bell: PlayerBellId | null) {
        this.#bell = bell;
        this.update();
    }

    get hurtState(): PlayerHurtState {
        return this.#hurtState;
    }

    set hurtState(hurtState: PlayerHurtState) {
        this.#hurtState = hurtState;
        this.update();
    }

    get isOnlyHead(): boolean {
        return this.#isOnlyHead;
    }

    set isOnlyHead(isOnlyHead: boolean) {
        this.#isOnlyHead = isOnlyHead;
        this.update();
    }

    get creatureData(): PlayerCreatureData {
        return playerData.creatures[this.creature];
    }

    get crownData(): PlayerCrownData | null {
        return this.crown ? playerData.crowns[this.crown] : null;
    }

    get fleeceData(): PlayerFleeceData {
        return playerData.fleeces[this.fleece];
    }

    get bellData(): PlayerBellData | null {
        return this.bell ? playerData.bells[this.bell] : null;
    }

    clone(id?: string, label?: string, creature: PlayerCreatureId = this.creature, fleece: PlayerFleeceId = this.fleece) {
        const { skeleton, atlas } = this;
        
        const player = new Player(skeleton.data, atlas, id, label, creature, fleece);
        player.copyFromObj(this.toObj());

        player.creature = creature;
        player.fleece = fleece;

        return player;
    }

    update() {
        const { creature, creatureData, crown, crownData, fleeceData, bell, bellData, hurtState, isOnlyHead } = this;
        
        const creatureVariant = creatureData.variant;
        const creatureSkin = new spine.Skin(Player.CREATURE_SKIN_NAME);

        creatureSkin.copySkin(this.skeleton.data.findSkin(isOnlyHead ? Player[creature === "Goat" ? "GOAT_HEAD_SKIN_NAME" : "LAMB_HEAD_SKIN_NAME"] : creatureVariant));
        creatureSkin.getAttachments().filter(({ name }) => [Player.FLEECE_ATTACHMENT_NAME, Player.CROWN_ATTACHMENT_NAME, Player.CROWN_EYE_ATTACHMENT_NAME, ...Player.BELL_ATTACHMENT_NAMES].some((str) => name.includes(str))).forEach(({ name, slotIndex }) => creatureSkin.removeAttachment(slotIndex, name));

        this.setCustomSkin(creatureSkin);

        if (crown) {
            const crownSkin = new spine.Skin(Player.CROWN_SKIN_NAME);

            this.skeleton.data.findSkin(crownData!.variant).getAttachments().filter(({ name }) => name.includes(Player.CROWN_ATTACHMENT_NAME)).forEach(({ name, attachment, slotIndex }) => crownSkin.setAttachment(slotIndex, name, attachment));
            if ("addonVariant" in crownData!) this.skeleton.data.findSkin(crownData!.addonVariant!).getAttachments().filter(({ name }) => name.includes(Player.CROWN_EYE_ATTACHMENT_NAME)).forEach(({ name, attachment, slotIndex }) => crownSkin.setAttachment(slotIndex, name, attachment));

            this.addCustomSkin(crownSkin);
        }

        if (!isOnlyHead) {
            const fleeceSkin = new spine.Skin(Player.FLEECE_SKIN_NAME);
        
            this.skeleton.data.findSkin(fleeceData.variant).getAttachments().filter(({ name }) => [Player.FLEECE_ATTACHMENT_NAME, ...Player.BODY_ATTACHMENT_NAMES.slice(+(creature !== "Lamb") * (Player.BODY_ATTACHMENT_NAMES.length - 1))].some((str) => name.includes(str))).forEach(({ name, attachment, slotIndex }) => fleeceSkin.setAttachment(slotIndex, name, attachment));
            this.addCustomSkin(fleeceSkin);
    
            if (bell) {
                const bellSkin = new spine.Skin(Player.BELL_SKIN_NAME);
                this.skeleton.data.findSkin(bellData!.variant).getAttachments().filter(({ name }) => Player.BELL_ATTACHMENT_NAMES.some((str) => name.includes(str))).forEach(({ name, attachment, slotIndex }) => bellSkin.setAttachment(slotIndex, name, attachment));
                
                this.addCustomSkin(bellSkin);
            }
        }

        hurtState !== PlayerHurtState.Normal && this.addSkins(`${creature === "Goat" ? Player.HURT_GOAT_PREFIX : Player.HURT_LAMB_PREFIX}${hurtState}`);

        this.tick();
    }

    copyFromObj(obj: PlayerObject) {
        const { creature, crown, fleece, bell, hurtState, isOnlyHead } = obj;
        
        this.creature = creature;
        this.crown = crown;

        this.fleece = fleece;
        this.bell = bell;

        this.hurtState = hurtState;
        this.isOnlyHead = isOnlyHead;

        super.copyFromObj(obj);
    }

    toObj(): PlayerObject {
        const { creature, crown, fleece, bell, hurtState, isOnlyHead } = this;
        return { ...super.toObj(), type: TYPE, creature, crown, fleece, bell, hurtState, isOnlyHead };
    }
}

export interface PlayerObject extends ActorObject {
    creature: PlayerCreatureId; 
    crown: PlayerCrownId | null;

    fleece: PlayerFleeceId;
    bell: PlayerBellId | null;

    hurtState: PlayerHurtState;
    isOnlyHead: boolean;
}

export const enum PlayerHurtState {
    Normal,
    Bruised,
    Injured
}

export function isPlayerObj(obj: ActorObject): obj is PlayerObject {
    return obj instanceof Player || obj.type === TYPE;
} 