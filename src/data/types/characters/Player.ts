import playerData from "../../files/characters/player-data.json";

export interface PlayerDataJSON {
    creatures: Record<PlayerCreatureId, PlayerCreatureData>;
    crowns: Record<PlayerCrownId, PlayerCrownData>;

    fleeces: Record<PlayerFleeceId, PlayerFleeceData>;
    bells: Record<PlayerBellId, PlayerBellData>;
}

export const PLAYER_CREATURE_IDS: (keyof typeof playerData.creatures)[] = ["Lamb", "Goat"] as const;
export type PlayerCreatureId = typeof PLAYER_CREATURE_IDS[number];

export interface PlayerCreatureData {
    name: string;
    variant: string;
}

export const PLAYER_CROWN_IDS: (keyof typeof playerData.crowns)[] = ["Red", "Purple"] as const;
export type PlayerCrownId = typeof PLAYER_CROWN_IDS[number];

export interface PlayerCrownData {
    name: string;
    variant: string;
}

export const PLAYER_FLEECE_IDS: (keyof typeof playerData.fleeces)[] = ["Lamb", "Goat", "Golden", "Glass", "Diseased", "Fates", "Fragile", "Cowboy", "Cursed", "Berserker", "Fervor", "Hobbled", "God", "Heretic", "Natural", "Silk", "Rags"] as const;
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

export const PLAYER_FLEECE_CATEGORIES = ["General", "Post-Game", "DLC"] as const;
export const PLAYER_FLEECE_CATEGORY_LENGTH: number = Object.keys(PlayerFleeceCategory).length / 2;

export type PlayerFleeceCategoryName = typeof PLAYER_FLEECE_CATEGORIES[number];
export const playerFleeceIdsByCategory = Object.fromEntries(PLAYER_FLEECE_CATEGORIES.map<[PlayerFleeceCategoryName, PlayerFleeceId[]]>((name, i) => [name, PLAYER_FLEECE_IDS.map<[PlayerFleeceId, PlayerFleeceCategory]>((id) => [id, playerData.fleeces[id].category]).filter(([_, category]) => category === i).map(([id]) => id)])) as Record<PlayerFleeceCategoryName, PlayerFleeceId[]>;

export const PLAYER_BELL_IDS: (keyof typeof playerData.bells)[] = ["Lamb", "Goat", "Golden", "Glass", "Diseased", "Fates", "Fragile", "Cowboy", "Cursed", "Berserker", "Fervor", "Hobbled", "God"] as const;
export type PlayerBellId = typeof PLAYER_BELL_IDS[number];

export interface PlayerBellData {
    name: string;
    category: PlayerBellCategory;

    variant: string;
}

export enum PlayerBellCategory {
    General,
    PostGame
}

export const PLAYER_BELL_CATEGORIES = ["General", "Post-Game"] as const;
export const PLAYER_BELL_CATEGORY_LENGTH: number = Object.keys(PlayerBellCategory).length / 2;

export type PlayerBellCategoryName = typeof PLAYER_BELL_CATEGORIES[number];
export const playerBellIdsByCategory = Object.fromEntries(PLAYER_BELL_CATEGORIES.map<[PlayerBellCategoryName, PlayerBellId[]]>((name, i) => [name, PLAYER_BELL_IDS.map<[PlayerBellId, PlayerBellCategory]>((id) => [id, playerData.bells[id].category]).filter(([_, category]) => category === i).map(([id]) => id)])) as Record<PlayerBellCategoryName, PlayerBellId[]>;
