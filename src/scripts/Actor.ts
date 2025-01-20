import { Random, Vector, type VectorObject } from "../utils";

export class Actor implements ActorObject {
    pos: Vector;
    scale: Vector;

    private oldPos: Vector;
    private oldScale: Vector;

    #offset: Vector;
    #size: Vector;

    hidden: boolean;
    #flipX: boolean;

    private skinEntries: Set<spine.Skin>;

    constructor(public skeleton: spine.Skeleton, public animationState: spine.AnimationState, public id: string = Random.id(), public label: string = "Actor") {
        this.pos = Vector.Zero;
        this.scale = Vector.One;

        this.oldPos = Vector.Zero;
        this.oldScale = Vector.One;
        
        this.#offset = Vector.Zero;
        this.#size = Vector.Zero;

        this.hidden = false;
        this.#flipX = false;

        this.skinEntries = new Set();

        this.setSkin(this.skinNames[0]);
        this.setAnimation(this.animationNames[0]);
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

    private get firstTrack(): spine.TrackEntry | null {
        return this.animationState.tracks[0] ?? null;
    }

    get skin(): string {
        return this.skeleton.skin.name;
    }

    get animation(): string {
        return this.firstTrack?.animation.name ?? "";
    }

    get skinNames(): string[] {
        return this.skeleton.data.skins.map(({ name }) => name);
    }

    get animationNames(): string[] {
        return this.skeleton.data.animations.map(({ name }) => name);
    }

    get time(): number {
        return this.firstTrack?.trackTime ?? 0;
    }

    set time(time: number) {
        if (this.firstTrack) this.firstTrack.trackTime = time;
        this.tick(0, false);
    }

    get duration(): number {
        return this.animationState.tracks[0]?.animationEnd ?? 0;
    }

    clone(id: string = Random.id(), label: string = `${this.label} (Copy)`) {
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

    copyFromObj({ pos, scale, hidden, flipX }: ActorObject) {
        this.pos.copyObj(pos);
        this.scale.copyObj(scale);

        this.hidden = hidden;
        this.flipX = flipX;
    }

    toObj(): ActorObject {
        const { type, id, label, pos, scale, hidden, flipX, skin, animation, time, duration } = this;
        return {
            type,

            id,
            label,

            pos: pos.toObj(),
            scale: scale.toObj(),
            
            hidden,
            flipX,
            
            skin,
            animation,
            
            time,
            duration
        };
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

    // TODO: add code to run animation sequences
    setAnimation(name: string) {
        this.animationState.clearTrack(0);
        this.animationState.setAnimation(0, name, true);

        this.reset();
        this.updateBounds();
    }

    reset() {
        this.time = 0;
        this.resetSkin();
    }

    resetSkin() {
        const combinedSkin = new spine.Skin("Combined Skin");
        for (const skin of this.skinEntries.values()) combinedSkin.addSkin(skin);
        
        this.skeleton.setSkin(combinedSkin);
        this.skeleton.setToSetupPose();

        this.animationState.apply(this.skeleton);
        this.animationState.update(0);

        this.skeleton.updateWorldTransform();
    }

    tick(delta: number = 0, checkManipulation: boolean = true) {
        checkManipulation && this.checkManipulation();

        this.animationState.apply(this.skeleton);
        this.animationState.update(delta);

        this.skeleton.updateWorldTransform();
    }

    updateBounds() {
        const track = this.animationState.tracks[0];
        if (!track || !track.animationEnd) {
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
    flipX: boolean;

    skin: string;
    animation: string;

    time: number;
    duration: number;
}