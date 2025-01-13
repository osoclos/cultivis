import type { BishopDataJSON, FollowerDataJSON, TOWW_DataJSON, PlayerDataJSON } from "./types";

import followerDataJSON from "./follower-data.json";
import playerDataJSON from "./player-data.json";

import bishopDataJSON from "./bishop-data.json";
import towwDataJSON from "./toww-data.json";

import forbiddenAnimations from "./forbidden-animations.json";

const followerData: FollowerDataJSON = followerDataJSON;
const playerData: PlayerDataJSON = playerDataJSON;

const bishopData: BishopDataJSON = bishopDataJSON;
const towwData: TOWW_DataJSON = towwDataJSON;

export { followerData, playerData, bishopData, towwData, forbiddenAnimations };