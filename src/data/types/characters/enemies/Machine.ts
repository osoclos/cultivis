import type { Sources } from "../../Globals";
import machineData from "../../../files/characters/enemies/machine-data.json";

export type MachineDataJSON = Record<MachineId, MachineData>;
export interface MachineData {
    name: string;
    category: MachineCategory;

    src: Sources;

    skins: string[];
    animation: string;
}

export const MACHINE_IDS: (keyof typeof machineData)[] = ["Howler", "Eye", "Eye_Brute", "Frog_Egg", "Spider_Egg"] as const;
export type MachineId = typeof MACHINE_IDS[number];

export enum MachineCategory {
    Artificial,
    Eggs
}

export const MACHINE_CATEGORIES = ["Artificial", "Eggs"] as const;
export const MACHINE_CATEGORY_LENGTH = MACHINE_CATEGORIES.length;

export type MachineCategoryName = typeof MACHINE_CATEGORIES[number];

let tempArr: any[];

tempArr = Array(MACHINE_CATEGORY_LENGTH);
for (const id of MACHINE_IDS) {
    const { category = 0 } = machineData[id] ?? {};
    tempArr[category] ? tempArr[category].push(id) : tempArr[category] = [id];
}

const machineIdsByCategory = <Record<MachineCategoryName, MachineId[]>>{};
for (const [i, ids] of tempArr.entries()) machineIdsByCategory[MACHINE_CATEGORIES[i]] = ids;

export { machineIdsByCategory };