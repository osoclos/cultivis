import playerDataJSON from "./player-data.json";

import followerMetadataJSON from "./follower-metadata.json";
import colorSetsJSON from "./color-sets.json";

import clothingDataJSON from "./clothing-data.json";
import necklaceDataJSON from "./necklace-data.json";
import hatDataJSON from "./hat-data.json";

import forbiddenAnimations from "./forbidden-animations.json";

import type { ClothingDataJSON, ColorSetJSON, FollowerMetadataJSON, HatDataJSON, NecklaceDataJSON, PlayerDataJSON } from "./types";

const playerData: PlayerDataJSON = playerDataJSON;

const followerMetadata: FollowerMetadataJSON = followerMetadataJSON;
const colorSets: ColorSetJSON = colorSetsJSON;

const clothingData = clothingDataJSON as ClothingDataJSON;
const necklaceData = necklaceDataJSON as NecklaceDataJSON;
const hatData = hatDataJSON as HatDataJSON;

export { playerData, followerMetadata, colorSets, clothingData, necklaceData, hatData, forbiddenAnimations };