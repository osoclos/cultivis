import type { Sources } from "../../Globals";
import hereticData from "../../../files/characters/enemies/heretic-data.json";

export type HereticDataJSON = Record<HereticId, HereticData>;
export interface HereticData {
    name: string;
    category: HereticCategory;

    src: Sources;

    skins: string[][];
    backSkins?: string[][];

    animation: string;
}

export const HERETIC_IDS: (keyof typeof hereticData)[] = ["Green_Bagworm", "Mega_Green_Bagworm", "Red_Bagworm", "Bobbitworm", "Poisonous_Bobbitworm", "Moss_Shooter", "Cannon_Shooter", "Turret_Shooter", "Moss_Bat", "Green_Frog", "Poisonous_Green_Frog", "Red_Frog", "Mega_Red_Frog", "Mortar_Frog", "Frog_Bat", "Fly", "Devil_Fly", "Charger", "Explosive_Charger", "Bomber_Jellyfish", "Immature_Bomber_Jellyfish", "Fertile_Bomber_Jellyfish", "Fertile_Poisonous_Bomber_Jellyfish", "Cannon_Octopus", "Turret_Octopus", "Green_Spikefish", "Blue_Spikefish", "Horned_Spikefish", "Pouncer_Crab", "Spiked_Burrowfish", "Landmine_Burrowfish", "Blue_Spider", "Mini_Blue_Spider", "Mega_Blue_Spider", "Red_Spider", "Mini_Red_Spider", "Mega_Red_Spider", "Poisonous_Spider", "Scorpion", "Poisonous_Scorpion", "Mega_Scorpion", "Millipede", "Poisonous_Millipede"] as const;
export type HereticId = typeof HERETIC_IDS[number];

export enum HereticCategory {
    General,
    Darkwood,
    Anura,
    Anchordeep,
    SilkCradle
}

export const HERETIC_CATEGORIES = ["General", "Darkwood", "Anura", "Anchordeep", "Silk Cradle"] as const;
export const HERETIC_CATEGORY_LENGTH = HERETIC_CATEGORIES.length;

export type HereticCategoryName = typeof HERETIC_CATEGORIES[number];

let tempArr: any[];

tempArr = Array(HERETIC_CATEGORY_LENGTH);
for (const id of HERETIC_IDS) {
    const { category = 0 } = hereticData[id] ?? {};
    tempArr[category] ? tempArr[category].push(id) : tempArr[category] = [id];
}

const hereticIdsByCategory = <Record<HereticCategoryName, HereticId[]>>{};
for (const [i, ids] of tempArr.entries()) hereticIdsByCategory[HERETIC_CATEGORIES[i]] = ids;

export { hereticIdsByCategory };