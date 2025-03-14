import type { SoundId } from "./Sound";

export type AnimationDataJSON<K extends string> = Record<K, AnimationData>;
export interface AnimationData {
    name: string;

    animations: AnimationAnimation[];
    sounds: AnimationSound[];
}

export interface AnimationAnimation {
    animation: string;
    track: number;

    start: number;
    duration?: number;

    loops?: number;

    offset?: number;
}

export interface AnimationSound {
    sound: SoundId;
    variants?: string[];

    start: number;
    step?: number;
}