import humanoidData from "../../../files/characters/enemies/humanoid-data.json";

export type HumanoidDataJSON = Record<HumanoidId, HumanoidData>;
export interface HumanoidData {
    name: string;

    skin: string;
    canHoldShield: boolean;
}

export const HUMANOID_IDS: (keyof typeof humanoidData)[] = ["Swordsman", "Scytheman", "Bomber", "Archer", "Sharpshooter", "Scamp", "Juggernaut"] as const;
export type HumanoidId = typeof HUMANOID_IDS[number];