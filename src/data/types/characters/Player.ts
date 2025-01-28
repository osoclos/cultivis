import playerData from "../../files/characters/player-data.json";

export interface PlayerDataJSON {
    creature: Record<PlayerCreatureId, PlayerCreatureData>;
    fleece: Record<PlayerFleeceId, PlayerFleeceData>;
}

export const PLAYER_CREATURE_IDS: (keyof typeof playerData.creature)[] = ["Lamb", "Goat"] as const;
export type PlayerCreatureId = typeof PLAYER_CREATURE_IDS[number];

export interface PlayerCreatureData {
    name: string;
    variant: string;
}

export const PLAYER_FLEECE_IDS: (keyof typeof playerData.fleece)[] = ["Lamb", "Goat", "Golden", "Glass", "Diseased", "Fates", "Fragile", "Cursed", "Berserker", "Fervor", "Hobbled", "Heretic", "Natural", "Silk", "God", "Cowboy", "Rags"] as const;
export type PlayerFleeceId = typeof PLAYER_FLEECE_IDS[number];

export interface PlayerFleeceData {
    name: string;
    category: PlayerFleeceCategory;

    variant: string;
}

export enum PlayerFleeceCategory {
    General,
    PostGame,
    DLC
}

export const PLAYER_FLEECE_CATEGORIES = ["General", "Post Game", "DLC"] as const;
export const PLAYER_FLEECE_CATEGORY_LENGTH: number = Object.keys(PlayerFleeceCategory).length / 2;

export type PlayerFleeceCategoryName = typeof PLAYER_FLEECE_CATEGORIES[number];