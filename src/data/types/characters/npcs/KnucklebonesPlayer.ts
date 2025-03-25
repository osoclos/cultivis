import type { Sources } from "../../Globals";
import knucklebonesPlayerData from "../../../files/characters/npcs/knucklebones-player-data.json";

export type KnucklebonesPlayerDataJSON = Record<KnucklebonesPlayerId, KnucklebonesPlayerData>;
export interface KnucklebonesPlayerData {
    name: string;
    src: Sources;

    skin: string;
    headSkin: string;

    animation: string;
}

export const KNUCKLEBONES_PLAYER_IDS: (keyof typeof knucklebonesPlayerData)[] = ["Ratau", "Flinky", "Klunko_And_Bop", "Shrumy"] as const;
export type KnucklebonesPlayerId = typeof KNUCKLEBONES_PLAYER_IDS[number];