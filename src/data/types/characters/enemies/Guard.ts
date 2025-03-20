import guardData from "../../../files/characters/enemies/guard-data.json";

export type GuardDataJSON = Record<GuardId, GuardData>;
export interface GuardData {
    name: string;
    category: GuardCategory;

    skin: string;
}

export const GUARD_IDS: (keyof typeof guardData)[] = ["Guardian", "Velvet_Guardian", "Aym", "Baal"] as const;
export type GuardId = typeof GUARD_IDS[number];

export enum GuardCategory {
    General,
    Death
}

export const GUARD_CATEGORIES = ["General", "Death Protectors"] as const;
export const GUARD_CATEGORY_LENGTH = GUARD_CATEGORIES.length;

export type GuardCategoryName = typeof GUARD_CATEGORIES[number];

let tempArr: any[];

tempArr = Array(GUARD_CATEGORY_LENGTH);
for (const id of GUARD_IDS) {
    const { category = 0 } = guardData[id] ?? {};
    tempArr[category] ? tempArr[category].push(id) : tempArr[category] = [id];
}

const guardIdsByCategory = <Record<GuardCategoryName, GuardId[]>>{};
for (const [i, ids] of tempArr.entries()) guardIdsByCategory[GUARD_CATEGORIES[i]] = ids;

export { guardIdsByCategory };