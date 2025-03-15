import { soundManager } from "./managers";

import type { AnimationData, AnimationSound } from "../data/types";
import { Random, Vector, type VectorObject } from "../utils";

export class Actor implements ActorObject {
    pos: Vector;
    scale: Vector;

    private oldPos: Vector;
    private oldScale: Vector;

    #offset: Vector;
    #size: Vector;

    hidden: boolean;
    muted: boolean;

    #flipX: boolean;

    animation: AnimationData;
    #animationId: string;

    private skinEntries: Set<spine.Skin>;
    private soundEntries: Set<AnimationSound & { nextPlay: number; }>;

    constructor(public skeleton: spine.Skeleton, public animationState: spine.AnimationState, public id: string = Random.id(), public label: string = "Actor") {
        this.pos = Vector.Zero;
        this.scale = Vector.One;

        this.oldPos = Vector.Zero;
        this.oldScale = Vector.One;
        
        this.#offset = Vector.Zero;
        this.#size = Vector.Zero;

        this.hidden = false;
        this.muted = false;

        this.#flipX = false;

        this.animation = {
            name: "",

            animations: [],
            sounds: []
        };

        this.#animationId = "";

        this.skinEntries = new Set();
        this.soundEntries = new Set();
    }

    get type(): string {
        return "actor";
    }

    get size() {
        return this.#size.clone();
    }

    get offset() {
        return this.#offset.clone();
    }

    get flipX(): boolean {
        return this.#flipX;
    }

    set flipX(flipped: boolean) {
        this.#flipX = flipped;
        this.skeleton.scaleX = this.scale.x * (-flipped || 1);
    }

    get animationId(): string {
        return this.#animationId;
    }

    set animationId(animationId: string) {
        this.#animationId = animationId;
    }

    private get firstTrack(): spine.TrackEntry | null {
        return this.animationState.tracks[0] ?? null;
    }

    get skinNames(): string[] {
        return this.skeleton.data.skins.map(({ name }) => name);
    }

    get animationNames(): string[] {
        return this.skeleton.data.animations.map(({ name }) => name);
    }

    get animationDurations(): Record<string, number> {
        return Object.fromEntries(this.skeleton.data.animations.map(({ name, duration }) => [name, duration]));
    }

    get attachmentNames(): string[] {
        return this.skeleton.slots.map(({ attachment }) => attachment?.name);
    }

    get time(): number {
        return this.firstTrack?.trackTime ?? 0;
    }

    set time(time: number) {
        for (const track of this.animationState.tracks.filter((track) => track)) track.trackTime = time;
        this.tick(0, false);
    }

    get duration(): number {
        return Math.max(...this.animationState.tracks.filter((track) => track).map(({ animationEnd, delay }) => animationEnd + delay));
    }

    clone(id?: string, label: string = `${this.label} (Copy)`) {
        const { skeleton, animationState, pos, scale, hidden, flipX, animation } = this;
        
        const actor = new Actor(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label);
        actor.setCustomSkin(skeleton.skin);
        actor.setAnimation(animation);

        actor.pos.copy(pos);
        actor.scale.copy(scale);

        actor.hidden = hidden;
        actor.flipX = flipX;

        return actor;
    }

    copyFromObj(obj: ActorObject) {
        const { pos, scale, hidden, flipX } = obj;
        
        this.pos.copyObj(pos);
        this.scale.copyObj(scale);

        this.hidden = hidden;
        this.flipX = flipX;
    }

    toObj(): ActorObject {
        const { type, id, label, pos, scale, hidden, muted, flipX, animation, animationId, time, duration } = this;
        return {
            type,

            id,
            label,

            pos: pos.toObj(),
            scale: scale.toObj(),
            
            hidden,
            muted,

            flipX,

            animation,
            animationId,
            
            time,
            duration
        };
    }

    setAnimation(animation: AnimationData, id?: string) {
        this.animation = animation;
        if (id !== undefined) this.animationId = id;
        
        this.reset();
        this.updateBounds();
    }

    setRawAnimation(name: string, track: number = 0) {
        this.setAnimation({
            name,
            
            animations: [{
                animation: name,
                track,

                start: 0
            }],
            
            sounds: []
        }, name);
    }

    addSkins(...names: string[]) {
        for (const name of names) {
            const skin = this.skeleton.data.findSkin(name);
            this.skinEntries.add(skin);
        }

        this.resetSkin();
    }

    removeSkins(...names: string[]) {
        const skins = [...this.skinEntries].filter(({ name }) => names.includes(name));
        skins.forEach((skin) => this.skinEntries.delete(skin));

        this.resetSkin();
    }

    setSkin(name: string) {
        this.skinEntries.clear();
        this.addSkins(name);
    }

    addCustomSkin(skin: spine.Skin) {
        this.skinEntries.add(skin);
        this.resetSkin();
    }

    setCustomSkin(skin: spine.Skin) {
        this.skinEntries.clear();
        this.addCustomSkin(skin);
    }

    findAnimationsWithAttachment(name: string): string[] {
        const { animation, animationNames } = this;

        const filteredAnimations = animationNames.filter((animation) => {
            this.setRawAnimation(animation);
            return this.attachmentNames.some((attachment) => attachment?.includes(name));
        });

        this.setAnimation(animation);
        return filteredAnimations;
    }

    reset() {
        this.time = 0;

        this.resetAnimation();
        this.resetSkin();
    }

    resetAnimation() {
        const { animationState, animation, soundEntries, muted } = this;

        animationState.clearTracks();
        soundEntries.clear();
        
        const { animations, sounds } = animation;
        for (const animationData of animations) {
            const {
                animation,
                track,
                
                start,
                duration = 0,
                
                loops = 0,
                offset = 0
            } = animationData;

            for (const i of Array(Math.max(loops, 1)).keys()) {
                const entry = animationState.addAnimation(track, animation, loops <= 0, start + (duration - offset) * i);
    
                if ("duration" in animationData) entry.animationEnd = duration;
                if ("offset" in animationData) entry.animationStart = offset;
            }
        }

        for (const sound of sounds) soundEntries.add({ ...sound, nextPlay: muted ? -1 : sound.start });

        this.tick(0, false);
    }

    resetSkin() {
        const { skeleton, skinEntries } = this;

        const combinedSkin = new spine.Skin("Combined Skin");
        for (const skin of skinEntries) combinedSkin.addSkin(skin);
        
        skeleton.setSkin(combinedSkin);
        skeleton.setToSetupPose();

        this.tick(0, false);
    }

    tick(delta: number = 0, checkManipulation: boolean = true) {
        checkManipulation && this.checkManipulation();

        const { skeleton, animationState, muted, time, duration, soundEntries } = this;

        animationState.apply(skeleton);
        animationState.update(delta);
        
        if (!muted && time > 0) for (const entry of soundEntries) {
            const { sound, variants, step = duration, nextPlay } = entry;
            if (time < nextPlay) continue;

            soundManager.play(sound, variants ? Random.item(variants) : undefined);
            while (entry.nextPlay < time) entry.nextPlay += step;
        }

        skeleton.updateWorldTransform();
    }

    updateBounds() {
        if (!this.firstTrack) {
            this.reset();

            const { x, y } = this.pos;
            this.skeleton.x = x;
            this.skeleton.y = y;

            this.skeleton.getBounds(this.#offset, this.#size);
            return;
        }

        const prevTime = this.time;
        this.reset();

        this.oldPos.set(0);
        this.skeleton.x = 0;
        this.skeleton.y = 0;

        const min = Vector.Max;
        const max = Vector.Min;
        
        while (this.time <= this.duration) {
            this.tick(1 / 100, false);
            
            const offset = new Vector();
            const size = new Vector();
            
            this.skeleton.getBounds(offset, size);

            min.min(offset);
            max.max(Vector.add(offset, size));
        }

        this.#offset.copy(min);
        this.#size.copy(Vector.sub(max, min));

        this.time = prevTime;
        this.checkManipulation(true);
    }

    private checkManipulation(forceManipulate: boolean = false) {
        if (forceManipulate || !this.oldPos.equals(this.pos)) {
            this.oldPos.copy(this.pos);

            const { x, y } = this.pos;
            const [offsetX, offsetY] = this.offset;
            const [sizeX, sizeY] = this.size;

            this.skeleton.x = x - offsetX - sizeX / 2;
            this.skeleton.y = y - offsetY - sizeY / 2;
        }

        if (forceManipulate || !this.oldScale.equals(this.scale)) {
            this.oldScale.copy(this.scale);

            const { x, y } = this.scale;
            this.skeleton.scaleX = x * (-this.flipX || 1);
            this.skeleton.scaleY = y;
        }
    }
}

export interface ActorObject {
    type: string;
    
    id: string;
    label: string;

    pos: VectorObject;
    scale: VectorObject;

    hidden: boolean;
    muted: boolean;

    flipX: boolean;

    animation: AnimationData;
    animationId: string;

    time: number;
    duration: number;
}