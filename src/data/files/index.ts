import type { SoundDataJSON } from "../types";

import forbiddenAnimations from "./forbidden-animations.json";
import soundDataJSON from "./sound-data.json";

const soundData: SoundDataJSON = soundDataJSON;

export { forbiddenAnimations, soundData };
export * from "./characters";