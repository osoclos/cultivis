import type { ColorSet } from "./ColorSet";
import clothingData from "../clothing-data.json";

export type ClothingDataJSON = Record<ClothingId, ClothingData>;
export interface ClothingData {
    name: string;
    category: ClothingCategory;
    attributes?: ClothingAttributes;
    useFromSource: boolean;

    variants: string[];
    sets?: ColorSet[];
}

export type ClothingExtrasJSON = Partial<Record<ClothingId, Pick<ClothingExtras, "category"> & Partial<ClothingExtras>>>;
export interface ClothingExtras {
    name: string;
    category: ClothingCategory;

    variants: string[];
}

export type ClothingMetadataJSON = Record<string, Omit<ClothingMetadata, "id">>;
export interface ClothingMetadata {
    id: string;
    variants: string[];
    attributes?: ClothingAttributes;

    sets: ColorSet[];
}

export interface ClothingAttributes {
    isUnlockable: boolean;
    isUnique: boolean;
    isFromRitual: boolean;

    dlc?: ClothingDLC;
}

export const CLOTHING_DLCS = ["Heretic", "Cultist", "Sinful", "Pilgrim"] as const;
export type ClothingDLC = typeof CLOTHING_DLCS[number];

export const CLOTHING_IDS: (keyof typeof clothingData | ClothingIdExtras)[] = ["Default_Clothing", "Normal9_Clothing", "Normal8_Clothing", "Normal7_Clothing", "Normal6_Clothing", "Normal5_Clothing", "Normal4_Clothing", "Normal3_Clothing", "Normal2_Clothing", "Normal1_Clothing", "Normal12_Clothing", "Normal11_Clothing", "Normal10_Clothing", "Naked_Clothing", "Rags", "Missionary", "Undertaker", "Holiday", "Old", "Baby", "Warrior_Clothing", "Special_7_Clothing", "Special_6_Clothing", "Special_5_Clothing", "Special_4_Clothing", "Special_3_Clothing", "Special_2_Clothing", "Special_1_Clothing", "Fancy_Suit_Clothing", "Fancy_Clothing", "Baal_Robes", "Aym_Robes", "Sozo_Backpack", "Heretic_DLC_Clothing", "Heretic_DLC_Clothing2", "DLC_6", "DLC_5", "DLC_4", "DLC_3", "DLC_2", "DLC_1", "Cultist_DLC_Clothing", "Cultist_DLC_Clothing2", "Pilgrim_DLC_Clothing", "Pilgrim_DLC_Clothing2"];
export type ClothingId = typeof CLOTHING_IDS[number];
export type ClothingIdExtras = "Rags" | "Old" | "Baby" | "Missionary" | "Undertaker" | "Holiday" | "Baal_Robes" | "Aym_Robes" | "Sozo_Backpack";

export enum ClothingCategory {
    General,
    Special,
    DLC
}

export const CLOTHING_CATEGORIES = ["General", "Special", "DLC"] as const;
export const CLOTHING_CATEGORY_LENGTH: number = Object.keys(ClothingCategory).length / 2;

export type ClothingCategoryName = typeof CLOTHING_CATEGORIES[number];
export const clothingIdsByCategory = Object.fromEntries(CLOTHING_CATEGORIES.map<[ClothingCategoryName, ClothingId[]]>((name, i) => [name, CLOTHING_IDS.map<[ClothingId, ClothingCategory]>((id) => [id, clothingData[id].category]).filter(([_, category]) => category === i).map(([id]) => id)])) as Record<ClothingCategoryName, ClothingId[]>;