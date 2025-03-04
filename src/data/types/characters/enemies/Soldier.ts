import soldierData from "../../../files/characters/enemies/soldier-data.json";

export type SoldierDataJSON = Record<SoldierId, SoldierData>;
export interface SoldierData {
    name: string;

    skin: string;
    canHoldShield: boolean;
}

export const SOLDIER_IDS: (keyof typeof soldierData)[] = ["Swordsman", "Scytheman", "Bomber", "Archer", "Sharpshooter", "Scamp", "Juggernaut"] as const;
export type SoldierId = typeof SOLDIER_IDS[number];