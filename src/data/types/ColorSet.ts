import type { FollowerId } from "./Follower";
import type { ColorObject } from "../../utils";

export interface ColorSetJSON {
    standard: ColorSet[];
    followers: FollowerColorSets;
}

export type FollowerColorSets = Record<FollowerId, ColorSet[]>;

export type ColorSet = ColorSetItem[];
export interface ColorSetItem {
    color: ColorObject;
    slots: string[];
}