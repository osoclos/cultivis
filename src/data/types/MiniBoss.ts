import type { Sources } from "./Globals";
import miniBossData from "../mini-boss-data.json";

export type MiniBossDataJSON = Record<MiniBossId, MiniBossData>;
export interface MiniBossData {
    name: string;
    src: Sources;

    skins: string[];
    backSkins?: string[];

    upgradedSkins: string[];
    backUpgradedSkins?: string[];

    animation: string;
}

export const MINI_BOSS_IDS: (keyof typeof miniBossData)[] = ["Mama Worm", "Mama Maggot", "Burrow Worm", "Flying Burp Frog", "Egg Hopper", "Mortar Hopper", "Spiker", "Charger", "Scuttle Turret", "Spider Jump", "Millipede Poisoner", "Scorpion"] as const;
export type MiniBossId = typeof MINI_BOSS_IDS[number];