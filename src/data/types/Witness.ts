import witnessData from "../witness-data.json";

export type WitnessDataJSON = Record<WitnessId, WitnessData>;
export interface WitnessData { name: string; }

export const WITNESS_IDS: (keyof typeof witnessData)[] = ["Darkwood", "Anura", "Anchordeep", "Silk_Cradle"] as const;
export type WitnessId = typeof WITNESS_IDS[number];