import type { BishopSources } from "./Bishop";
import towwData from "../toww-data.json";

export type TOWW_DataJSON = Record<TOWW_Id, TOWW_Data>;
export interface TOWW_Data {
    name: string;
    src: BishopSources;

    animation: string;
    attributes: Partial<TOWW_Attributes>;
}

export interface TOWW_Attributes {
    hasCrown: boolean;
    hasChains: boolean;
    
    eyeState: number;
    isInjured: boolean;
}

export const TOWW_IDS: (keyof typeof towwData)[] = ["Bishop", "Boss", "Mega_Boss", "Eyeball"] as const;
export type TOWW_Id = typeof TOWW_IDS[number];