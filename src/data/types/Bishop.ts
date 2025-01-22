import bishopData from "../bishop-data.json";

export type BishopDataJSON = Record<BishopId, BishopData>;
export interface BishopData {
    name: string;

    src: BishopSources;
    bossSrc?: BishopSources;

    animation: string;
    bossAnimation?: string;
}

export interface BishopSources {
    textures: Record<string, string> | string[];
    atlas: string;

    skeleton: string;
}

export const BISHOP_IDS: (keyof typeof bishopData)[] = ["Worm", "Frog", "Jelly", "Spider"] as const;
export type BishopId = typeof BISHOP_IDS[number];