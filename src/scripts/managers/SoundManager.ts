import { Howl, Howler, type SoundSpriteDefinitions } from "howler";

import { soundData } from "../../data/files";
import { SOUND_IDS, type SoundId } from "../../data/types";

import { fetchAndCache, Random, resolvePath } from "../../utils";

const MAX_POOL_SIZE: number = 96;
Howler.html5PoolSize = MAX_POOL_SIZE;

export class SoundManager {
    static readonly SOUNDS_FOLDER_NAME: string = "sounds";
    static readonly CACHE_NAME: string = "sounds";

    static readonly DEFAULT_VOLUME: number = 0.7;
    static readonly DEFAULT_POOL_SIZE: number = 6;

    private howlers: Map<SoundId, Howl>;
    private constructor(private cache: Cache) {
        this.howlers = new Map();
    }

    static async create() {
        const cache = await caches.open(SoundManager.CACHE_NAME);
        return new SoundManager(cache);
    }

    async load(...ids: SoundId[]) {
        for (const id of ids) {
            if (this.hasLoaded(id)) continue;
            const { src, timeRanges = {} } = soundData[id];

            const blob = await fetchAndCache(resolvePath(src, SoundManager.SOUNDS_FOLDER_NAME), this.cache).then((res) => res.blob());
            const url = URL.createObjectURL(blob);
    
            const sprite = <SoundSpriteDefinitions>{};
            for (const [key, { start, duration }] of Object.entries(timeRanges)) sprite[key] = [start, duration];
    
            const howler = new Howl({
                src: url,
                format: "wav",
    
                sprite,
                pool: SoundManager.DEFAULT_POOL_SIZE,
    
                volume: SoundManager.DEFAULT_VOLUME
            });
    
            this.howlers.set(id, howler);
    
            await new Promise((resolve, reject) => {
                howler.once("load", resolve);
                howler.on("loaderror", (_, err) => reject(err));
            });
        }
    }

    async loadAll() {
        await this.load(...SOUND_IDS);
    }

    hasLoaded(id: SoundId): boolean {
        return this.howlers.has(id);
    }

    play<I extends SoundId>(id: I, key: keyof (typeof soundData[I]["timeRanges"] & {}) = Random.item(Object.keys(soundData[id].timeRanges ?? {}))): number {       
        if (!this.hasLoaded(id)) throw new Error(`Sound ${id} has not been loaded`);

        const playbackId = this.howlers.get(id)!.play(Object.keys(soundData[id].timeRanges ?? {}).length ? <string>key : undefined);
        return playbackId;
    }

    stop<I extends SoundId>(id: I, playbackId?: number) {       
        if (!this.hasLoaded(id)) throw new Error(`Sound ${id} has not been loaded`);
        this.howlers.get(id)!.stop(playbackId);
    }
}

export const soundManager = await SoundManager.create();