import type { BishopDataJSON, ClothingDataJSON, ColorSetJSON, FollowerMetadataJSON, HatDataJSON, NecklaceDataJSON, PlayerDataJSON } from "./types";

import followerMetadataJSON from "./follower-metadata.json";
import colorSetsJSON from "./color-sets.json";

import clothingDataJSON from "./clothing-data.json";
import necklaceDataJSON from "./necklace-data.json";
import hatDataJSON from "./hat-data.json";

import playerDataJSON from "./player-data.json";
import bishopDataJSON from "./bishop-data.json";

import forbiddenAnimations from "./forbidden-animations.json";

const followerMetadata: FollowerMetadataJSON = followerMetadataJSON;
const colorSets: ColorSetJSON = colorSetsJSON;

const clothingData = clothingDataJSON as ClothingDataJSON;
const necklaceData = necklaceDataJSON as NecklaceDataJSON;
const hatData = hatDataJSON as HatDataJSON;

const playerData: PlayerDataJSON = playerDataJSON;
const bishopData: BishopDataJSON = bishopDataJSON;

export { followerMetadata, colorSets, clothingData, necklaceData, hatData, playerData, bishopData, forbiddenAnimations };