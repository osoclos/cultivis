import type { Sources } from "../../Globals";
import miniBossData from "../../../files/characters/bosses/mini-boss-data.json";

export type MiniBossDataJSON = Record<MiniBossId, MiniBossData>;
export interface MiniBossData {
    name: string;
    category: MiniBossCategory;

    src: Sources;

    skins: string[][];
    backSkins?: string[][];

    upgradedSkins: string[][];
    backUpgradedSkins?: string[][];

    animation: string;
}

export const MINI_BOSS_IDS: (keyof typeof miniBossData)[] = ["Mama Worm", "Mama Maggot", "Burrow Worm", "Egg Hopper", "Flying Burp Frog", "Mortar Hopper", "Spiker", "Charger", "Scuttle Turret", "Spider Jump", "Millipede Poisoner", "Scorpion"] as const;
export type MiniBossId = typeof MINI_BOSS_IDS[number];

export enum MiniBossCategory {
    Darkwood,
    Anura,
    Anchordeep,
    SilkCradle
}

export const MINI_BOSS_CATEGORIES = ["Darkwood", "Anura", "Anchordeep", "Silk Cradle"] as const;
export const MINI_BOSS_CATEGORY_LENGTH = MINI_BOSS_CATEGORIES.length;

export type MiniBossCategoryName = typeof MINI_BOSS_CATEGORIES[number];

let tempArr: any[];

tempArr = Array(MINI_BOSS_CATEGORY_LENGTH);
for (const id of MINI_BOSS_IDS) {
    const { category = 0 } = miniBossData[id] ?? {};
    tempArr[category] ? tempArr[category].push(id) : tempArr[category] = [id];
}

const miniBossIdsByCategory = <Record<MiniBossCategoryName, MiniBossId[]>>{};
for (const [i, ids] of tempArr.entries()) miniBossIdsByCategory[MINI_BOSS_CATEGORIES[i]] = ids;

export { miniBossIdsByCategory };