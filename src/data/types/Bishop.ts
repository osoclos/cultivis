
export type BishopDataJSON = Record<BishopId, BishopData>;
export interface BishopData {
    name: string;

    src: BishopSources;
    bossSrc?: BishopSources;
}

export interface BishopSources {
    textures: Record<string, string> | string[];
    atlas: string;

    skeleton: string;
}

export const BISHOP_IDS = ["Worm", "Frog", "Jelly", "Spider"] as const;
export type BishopId = typeof BISHOP_IDS[number];