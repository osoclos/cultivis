import occultistData from "../../../files/characters/enemies/occultist-data.json";

export type OccultistDataJSON = Record<OccultistId, OccultistData>;
export interface OccultistData {
    name: string;
    skin: string;
}

export const OCCULTIST_IDS: (keyof typeof occultistData)[] = ["Summoner", "Healer", "Protector"] as const;
export type OccultistId = typeof OCCULTIST_IDS[number];