import type { BishopSources } from "./Bishop";
import towwData from "../toww-data.json";

export type TOWW_DataJSON = Record<TOWW_Id, TOWW_Data>;
export interface TOWW_Data {
    name: string;
    src: BishopSources;
}

export const TOWW_IDS: (keyof typeof towwData)[] = ["Bishop", "Boss", "Mega_Boss", "Eyeball"] as const;
export type TOWW_Id = typeof TOWW_IDS[number];