import { Actor, type ActorObject } from "..";

import { followerMetadata, colorSets, clothingData, necklaceData, hatData } from "../../data";
import type { ColorSet, FollowerId, ClothingId, ClothingData, FollowerMetadata, NecklaceId, HatId, NecklaceData, HatData } from "../../data/types";

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
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, form: FollowerId, clothing: ClothingId, id: string = Random.id(), label: string = followerMetadata[form].name) {
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

    get formData(): FollowerMetadata {
        return followerMetadata[this.form];
    }

    get clothingData(): ClothingData {
        return clothingData[this.clothing];
    }

    get necklaceData(): NecklaceData | null {
        return this.necklace ? necklaceData[this.necklace] : null;
    }

    get hatData(): HatData | null {
        return this.hat ? hatData[this.hat] : null;
    }

    get colorSetData(): ColorSet[] {
        return [...colorSets.followers[this.form], ...colorSets.standard];
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

    clone(form: FollowerId = this.form, clothing: ClothingId = this.clothing, id: string = Random.id(), label: string = `${this.label} (Copy)`) {
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

        !clothingData.useFromSource && this.applyColors(clothingData.sets![clothingColorSetIdx]);
        this.applyColors(colorSetData[formColorSetIdx]);

        necklaceData && this.addSkins(necklaceData.variant);
        hatData && this.addSkins(hatData.variant);

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