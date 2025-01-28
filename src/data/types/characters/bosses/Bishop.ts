import type { Sources } from "../../Globals";
import bishopData from "../../../files/characters/bosses/bishop-data.json";

export type BishopDataJSON = Record<BishopId, BishopData>;
export interface BishopData {
    name: string;

    src: Sources;
    bossSrc?: Sources;

    animation: string;
    bossAnimation?: string;
}

export const BISHOP_IDS: (keyof typeof bishopData)[] = ["Worm", "Frog", "Jelly", "Spider"] as const;
export type BishopId = typeof BISHOP_IDS[number];