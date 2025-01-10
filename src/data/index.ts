import type { BishopDataJSON, FollowerDataJSON, PlayerDataJSON } from "./types";

import followerDataJSON from "./follower-data.json";
import playerDataJSON from "./player-data.json";

import bishopDataJSON from "./bishop-data.json";

import forbiddenAnimations from "./forbidden-animations.json";

const followerData: FollowerDataJSON = followerDataJSON;
const playerData: PlayerDataJSON = playerDataJSON;
const bishopData: BishopDataJSON = bishopDataJSON;

export { followerData, playerData, bishopData, forbiddenAnimations };