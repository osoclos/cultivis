import fs from "fs";
import path from "path";

import ffmpeg from "fluent-ffmpeg";

import { SoundExtrasJSON } from "./types";
import { SOUND_IDS, SoundDataJSON } from "../src/data/types";

const SRC_FOLDER_PATH: string = path.join(__dirname, "extracted/sounds");
const DEST_FOLDER_PATH: string = path.join(__dirname, "../public/sounds");

const TMP_FOLDER_PATH: string = path.join(__dirname, "tmp");

const SOUND_DATA_PATH: string = path.join(__dirname, "../src/data/files/sound-data.json");
const SOUND_EXTRAS_PATH: string = path.join(__dirname, "addons/sound-extras.json");

const soundData = <SoundDataJSON>{};
const soundExtras: SoundExtrasJSON = JSON.parse(fs.readFileSync(SOUND_EXTRAS_PATH, "utf-8"));

for (const id of SOUND_IDS) {
    const { src = [], dest } = soundExtras[id];

    soundData[id] = { src: dest };
    if (!src.length) continue;

    const command = ffmpeg();
    soundData[id].timeRanges = {};

    let totalDuration: number = 0;
    for (const file of src.map((file) => path.join(SRC_FOLDER_PATH, file))) {
        command.addInput(file).inputFormat("wav");
        
        const name = path.basename(file, ".wav");

        let { duration = 0 } = await new Promise<ffmpeg.FfprobeFormat>((resolve, reject) => ffmpeg.ffprobe(file, (err, { format }) => err ? reject(err) : resolve(format)));
        duration = Math.floor(duration * 1000);

        soundData[id].timeRanges[name] = { start: totalDuration, duration };
        totalDuration += duration;
    }

    const destPath = path.join(DEST_FOLDER_PATH, dest);
    command.mergeToFile(destPath, TMP_FOLDER_PATH);
}

fs.writeFileSync(SOUND_DATA_PATH, JSON.stringify(soundData, null, 4));