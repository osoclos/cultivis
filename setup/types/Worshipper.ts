import { type ColorSet, FollowerCategory, type FollowerId } from "../../src/data/types";

export type FollowerExtrasJSON = Partial<Record<FollowerId, Partial<FollowerExtras>>>;
export interface FollowerExtras {
    name: string;
    category: FollowerCategory;

    variants: string[];
    canBeTinted: boolean;
}

export interface WorshipperData {
    id: string;
    category: FollowerCategory;
    attributes?: WorshipperAttributes;

    variants: string[];
    sets: ColorSet[];
}

export interface WorshipperAttributes {
    isUnique: boolean;

    hasSpecialEvents: boolean;
    mustBeDiscovered: boolean;
}