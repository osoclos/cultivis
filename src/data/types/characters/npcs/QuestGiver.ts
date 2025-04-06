import type { Sources } from "../../Globals";
import questGiverData from "../../../files/characters/npcs/quest-giver-data.json";

export type QuestGiverDataJSON = Record<QuestGiverId, QuestGiverData>;
export interface QuestGiverData {
    name: string;
    src: Sources;

    skins: string[];
    animation: string;
}

export const QUEST_GIVER_IDS: (keyof typeof questGiverData)[] = ["Fish_Man", "Lighthouse_Keeper", "Lighthouse_Follower", "Sozo", "Mushroom_Follower", "Plimbo", "Midas"] as const;
export type QuestGiverId = typeof QUEST_GIVER_IDS[number];