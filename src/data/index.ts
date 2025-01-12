import type { BishopDataJSON, FollowerDataJSON, NarinderDataJSON, PlayerDataJSON } from "./types";

import followerDataJSON from "./follower-data.json";
import playerDataJSON from "./player-data.json";

import bishopDataJSON from "./bishop-data.json";
import narinderDataJSON from "./narinder-data.json";

import forbiddenAnimations from "./forbidden-animations.json";

const followerData: FollowerDataJSON = followerDataJSON;
const playerData: PlayerDataJSON = playerDataJSON;

const bishopData: BishopDataJSON = bishopDataJSON;
const narinderData: NarinderDataJSON = narinderDataJSON;

export { followerData, playerData, bishopData, narinderData, forbiddenAnimations };