import type { ColorObject } from "../../../utils";
import moddedFollowerData from "../../files/characters/modded-follower-data.json";

export type ModdedFollowerDataJSON = Record<ModdedFollowerSlotId, ModdedFollowerData>;
export interface ModdedFollowerData {
    slot: string;

    fileName: string;
    folderPaths: Record<string, string>;
    
    color?: ColorObject;
}

export const MODDED_FOLLOWER_SLOT_IDS: (keyof typeof moddedFollowerData)[] = ["EYE_LEFT/IRIS", "EYE_LEFT/PUPIL", "EYE_LEFT/SCHLERA", "EYE_LEFT/OUTLINE", "EYE_RIGHT/IRIS", "EYE_RIGHT/PUPIL", "EYE_RIGHT/SCHLERA", "EYE_RIGHT/OUTLINE"] as const;
export type ModdedFollowerSlotId = typeof MODDED_FOLLOWER_SLOT_IDS[number];