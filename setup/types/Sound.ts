import { SoundId } from "../../src/data/types";

export type SoundExtrasJSON = Record<SoundId, SoundExtras>;
export interface SoundExtras {
    src?: string[];
    dest: string;
}