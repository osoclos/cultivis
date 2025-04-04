import soundData from "../files/sound-data.json";

export type SoundDataJSON = Record<SoundId, SoundData>;
export interface SoundData {
    src: string;
    timeRanges?: Record<string, SoundTimeRange>;
}

export interface SoundTimeRange {
    start: number;
    duration: number;
}

export const SOUND_IDS: (keyof typeof soundData)[] = ["Click", "Flicker", "Option_Change", "Menu_Open", "Menu_Close", "River_Boy_Mourning_Music", "Greet", "Grunt", "Laugh"] as const;
export type SoundId = typeof SOUND_IDS[number];