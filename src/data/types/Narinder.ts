import type { BishopSources } from "./Bishop";
import narinderData from "../narinder-data.json";

export type NarinderDataJSON = Record<NarinderId, NarinderData>;
export interface NarinderData {
    name: string;
    src: BishopSources;
}

export const NARINDER_IDS: (keyof typeof narinderData)[] = ["Bishop", "Boss", "Mega_Boss", "Eyeball"] as const;
export type NarinderId = typeof NARINDER_IDS[number];