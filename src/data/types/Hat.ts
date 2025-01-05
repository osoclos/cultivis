export type HatDataJSON = Record<HatId, HatData>;
export interface HatData {
    name: string;
    variant: string;
}

export const HATS_ID = ["Bartender", "Chef", "Tax_Enforcer", "Faith_Enforcer", "Farmer", "Lumberjack", "Miner", "Nudist", "Refiner"] as const;
export type HatId = typeof HATS_ID[number];