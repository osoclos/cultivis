import soundData from "../files/sound-data.json";

export type SoundDataJSON = Record<string, SoundData>;
export interface SoundData {
    src: string;
    timeRanges?: Record<string, SoundTimeRange>;
}

export interface SoundTimeRange {
    start: number;
    duration: number;
}

export const SOUND_IDS: (keyof typeof soundData)[] = ["Click", "Flicker", "Option_Change", "Menu_Open", "Menu_Close", "Pet_Laugh"] as const;
export type SoundId = typeof SOUND_IDS[number];