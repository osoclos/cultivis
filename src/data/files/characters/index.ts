import type { FollowerDataJSON, PlayerDataJSON } from "../../types";

import followerDataJSON from "./follower-data.json";
import playerDataJSON from "./player-data.json";

const followerData: FollowerDataJSON = followerDataJSON;
const playerData: PlayerDataJSON = playerDataJSON;

export { followerData, playerData };
export * from "./bosses";