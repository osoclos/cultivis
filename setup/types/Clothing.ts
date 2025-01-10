import { ClothingCategory, ClothingId, ColorSet } from "../../src/data/types";

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