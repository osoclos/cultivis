import type { FollowerDataJSON, ModdedFollowerDataJSON, PlayerDataJSON } from "../../types";

import followerDataJSON from "./follower-data.json";
import moddedFollowerDataJSON from "./modded-follower-data.json";

import playerDataJSON from "./player-data.json";

const followerData: FollowerDataJSON = followerDataJSON;
const moddedFollowerData: ModdedFollowerDataJSON = moddedFollowerDataJSON;

const playerData: PlayerDataJSON = playerDataJSON;

export { followerData, moddedFollowerData, playerData };

export * from "./enemies";
export * from "./bosses";

export * from "./npcs";