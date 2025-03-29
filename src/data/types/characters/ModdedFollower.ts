import type { ColorObject } from "../../../utils";
import moddedFollowerData from "../../files/characters/modded-follower-data.json";

export type ModdedFollowerDataJSON = Record<ModdedFollowerSlotId, ModdedFollowerData>;
export interface ModdedFollowerData {
    regions: Record<string, ModdedFollowerRegionId>;
    slot: string;
    
    color?: ColorObject;
}

export const MODDED_FOLLOWER_SLOT_IDS: (keyof typeof moddedFollowerData)[] = ["EYE_LEFT/IRIS", "EYE_LEFT/PUPIL", "EYE_LEFT/SCHLERA", "EYE_LEFT/OUTLINE", "EYE_RIGHT/IRIS", "EYE_RIGHT/PUPIL", "EYE_RIGHT/SCHLERA", "EYE_RIGHT/OUTLINE"] as const;
export type ModdedFollowerSlotId = typeof MODDED_FOLLOWER_SLOT_IDS[number];

export const MODDED_FOLLOWER_REGION_IDS = ["colorful-eyes/EYE/iris", "colorful-eyes/EYE/pupil", "colorful-eyes/EYE/schlera", "colorful-eyes/EYE/outline", "colorful-eyes/EYE_ANGRY/iris", "colorful-eyes/EYE_ANGRY/pupil", "colorful-eyes/EYE_ANGRY/schlera", "colorful-eyes/EYE_ANGRY/outline", "colorful-eyes/EYE_ANGRY_HURT/iris", "colorful-eyes/EYE_ANGRY_HURT/pupil", "colorful-eyes/EYE_ANGRY_HURT/schlera", "colorful-eyes/EYE_ANGRY_HURT/outline", "colorful-eyes/EYE_ANGRY_LEFT/iris", "colorful-eyes/EYE_ANGRY_LEFT/pupil", "colorful-eyes/EYE_ANGRY_LEFT/schlera", "colorful-eyes/EYE_ANGRY_LEFT/outline", "colorful-eyes/EYE_ANGRY_UP/iris", "colorful-eyes/EYE_ANGRY_UP/pupil", "colorful-eyes/EYE_ANGRY_UP/schlera", "colorful-eyes/EYE_ANGRY_UP/outline", "colorful-eyes/EYE_ANGRY_UP_HURT/iris", "colorful-eyes/EYE_ANGRY_UP_HURT/pupil", "colorful-eyes/EYE_ANGRY_UP_HURT/schlera", "colorful-eyes/EYE_ANGRY_UP_HURT/outline", "colorful-eyes/EYE_ANGRY_UP_LEFT/iris", "colorful-eyes/EYE_ANGRY_UP_LEFT/pupil", "colorful-eyes/EYE_ANGRY_UP_LEFT/schlera", "colorful-eyes/EYE_ANGRY_UP_LEFT/outline"] as const;
export type ModdedFollowerRegionId = typeof MODDED_FOLLOWER_REGION_IDS[number];