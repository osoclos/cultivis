import type { AnimationDataJSON } from "../Animation";
import followerAnimationDataJSON from "../../files/animations/follower.json";

export type FollowerAnimationDataJSON = AnimationDataJSON<FollowerAnimationId>;

export const FOLLOWER_ANIMATION_IDS: (keyof typeof followerAnimationDataJSON)[] = ["Idle", "Wave", "Angry_Wave"];
export type FollowerAnimationId = typeof FOLLOWER_ANIMATION_IDS[number];