import { Actor, type ActorObject } from "..";

import { followerData } from "../../data";
import type { ColorSet, FollowerId, ClothingId, ClothingData, FormData, NecklaceId, HatId, NecklaceData, HatData } from "../../data/types";

import { MoreMath, Random } from "../../utils";

// to add halo, you need to set attachment "halo" to skin "Other/Halo"
export class Follower extends Actor implements FollowerObject {
    static readonly TEXTURE_FILENAME: string = "Follower.png";
    static readonly ATLAS_FILENAME: string = "Follower.atlas";
    static readonly SKELETON_FILENAME: string = "Follower.skel";

    #form: FollowerId;
    #clothing: ClothingId;
    #necklace: NecklaceId | null;
    #hat: HatId | null;

    private indexes: FollowerIndexes
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, form: FollowerId, clothing: ClothingId, id: string = Random.id(), label: string = followerData.forms[form].name) {
        super(skeleton, animationState, id, label);

        this.#form = form;
        this.#clothing = clothing;
        this.#necklace = null;
        this.#hat = null;

        this.indexes = {
            form: {
                variant: 0,
                colorSet: 0
            },

            clothing: {
                variant: 0,
                colorSet: 0
            }
        };

        this.update();
    }

    get form(): FollowerId {
        return this.#form;
    }

    set form(form: FollowerId) {
        this.#form = form;
        this.clampIndexes();

        this.update();
    }
    
    get clothing(): ClothingId {
        return this.#clothing;
    }

    set clothing(clothing: ClothingId) {
        this.#clothing = clothing;
        this.clampIndexes();

        this.update();
    }

    get necklace(): NecklaceId | null {
        return this.#necklace;
    }

    set necklace(necklace: NecklaceId | null) {
        this.#necklace = necklace;
        this.update();
    }
    
    get hat(): HatId | null{
        return this.#hat;
    }

    set hat(hat: HatId | null) {
        this.#hat = hat;
        this.update();
    }

    get formData(): FormData {
        return followerData.forms[this.form];
    }

    get clothingData(): ClothingData {
        return followerData.clothing[this.clothing];
    }

    get necklaceData(): NecklaceData | null {
        return this.necklace ? followerData.necklaces[this.necklace] : null;
    }

    get hatData(): HatData | null {
        return this.hat ? followerData.hats[this.hat] : null;
    }

    get colorSetData(): ColorSet[] {
        return [...followerData.forms[this.form].sets, ...followerData.generalColorSets];
    }

    get formVariantIdx(): number {
        return this.indexes.form.variant;
    }

    set formVariantIdx(i: number) {
        this.indexes.form.variant = MoreMath.clamp(i, 0, this.formData.variants.length - 1);
        this.update();
    }

    get formColorSetIdx(): number {
        return this.indexes.form.colorSet;
    }

    set formColorSetIdx(i: number) {
        this.indexes.form.colorSet = MoreMath.clamp(i, 0, this.colorSetData.length - 1);
        this.update();
    }

    get clothingVariantIdx(): number {
        return this.indexes.clothing.variant;
    }

    set clothingVariantIdx(i: number) {
        this.indexes.clothing.variant = MoreMath.clamp(i, 0, this.clothingData.variants.length - 1);
        this.update();
    }

    get clothingColorSetIdx(): number {
        return this.indexes.clothing.colorSet;
    }

    set clothingColorSetIdx(i: number) {
        this.indexes.clothing.colorSet = MoreMath.clamp(i, 0, (this.clothingData.sets?.length ?? 1) - 1);
        this.update();
    }

    clone(id: string = Random.id(), label: string = `${this.label} (Copy)`, form: FollowerId = this.form, clothing: ClothingId = this.clothing) {
        const { skeleton, animationState } = this;

        const follower = new Follower(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), form, clothing, id, label);
        follower.copyFromObj(this.toObj());

        follower.form = form;
        follower.clothing = clothing;

        return follower;
    }

    update() {
        const { formData, clothingData, necklaceData, hatData, colorSetData, formVariantIdx, formColorSetIdx, clothingVariantIdx, clothingColorSetIdx } = this;

        this.setSkin(formData.variants[formVariantIdx]);
        this.addSkins(clothingData.variants[clothingVariantIdx]);

        this.applyColors(colorSetData[formColorSetIdx]);
        clothingData.sets && this.applyColors(clothingData.sets![clothingColorSetIdx]);

        necklaceData && this.addSkins(necklaceData.variant);
        hatData && this.addSkins(hatData.variant);

        // TODO: fix weird red overlay on sherpa, etc. clothing

        this.tick();
    }

    copyFromObj(obj: FollowerObject) {
        const { form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat } = obj;
        
        this.form = form;
        this.formVariantIdx = formVariantIdx;
        this.formColorSetIdx = formColorSetIdx;

        this.clothing = clothing;
        this.clothingVariantIdx = clothingVariantIdx;
        this.clothingColorSetIdx = clothingColorSetIdx;

        this.necklace = necklace;
        this.hat = hat;

        super.copyFromObj(obj);
    }

    toObj(): FollowerObject {
        const { form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat } = this;
        return { ...super.toObj(), type: "follower", form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat };
    }

    private clampIndexes() {
        const { formVariantIdx, formColorSetIdx, clothingVariantIdx, clothingColorSetIdx } = this;

        this.indexes.form.variant = MoreMath.clamp(formVariantIdx, 0, this.formData.variants.length - 1);
        this.indexes.form.colorSet = MoreMath.clamp(formColorSetIdx, 0, this.colorSetData.length - 1);

        this.indexes.clothing.variant = MoreMath.clamp(clothingVariantIdx, 0, this.clothingData.variants.length - 1);
        this.indexes.clothing.colorSet = MoreMath.clamp(clothingColorSetIdx, 0, (this.clothingData.sets?.length ?? 1) - 1);
    }
}

export interface FollowerObject extends ActorObject {
    form: FollowerId;
    formVariantIdx: number;
    formColorSetIdx: number;

    clothing: ClothingId;
    clothingVariantIdx: number;
    clothingColorSetIdx: number;

    necklace: NecklaceId | null;
    hat: HatId | null;
}

export interface FollowerIndexes {
    form: FollowerIndex;
    clothing: FollowerIndex;
}

export interface FollowerIndex {
    variant: number;
    colorSet: number;
}

export function isFollowerObj(obj: ActorObject): obj is FollowerObject {
    return obj instanceof Follower || obj.type === "follower";
}