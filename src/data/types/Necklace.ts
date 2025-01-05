import necklaceData from "../necklace-data.json";

export type NecklaceDataJSON = Record<NecklaceId, NecklaceData>;
export interface NecklaceData {
    name: string;
    category: NecklaceCategory;

    variant: string;
}

export const NECKLACE_IDS = ["Flower", "Feather", "Skull", "Nature", "Moon", "Missionary", "Loyalty", "Demonic", "Gold_Skull", "Bell", "Light", "Dark"] as const;
export type NecklaceId = typeof NECKLACE_IDS[number];

export enum NecklaceCategory {
    Crusade,
    Mythic,
    Special
}

export const NECKLACE_CATEGORIES = ["Crusade", "Mythic", "Special"] as const;
export const NECKLACE_CATEGORY_LENGTH: number = Object.keys(NecklaceCategory).length / 2;

export type NecklaceCategoryName = typeof NECKLACE_CATEGORIES[number];
export const necklaceIdsByCategory = Object.fromEntries(NECKLACE_CATEGORIES.map<[NecklaceCategoryName, NecklaceId[]]>((name, i) => [name, NECKLACE_IDS.map<[NecklaceId, NecklaceCategory]>((id) => [id, necklaceData[id].category]).filter(([_, category]) => category === i).map(([id]) => id)])) as Record<NecklaceCategoryName, NecklaceId[]>;