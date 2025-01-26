import { Actor, type ActorObject } from "..";

import { followerData } from "../../data";
import type { ColorSet, FollowerId, ClothingId, ClothingData, FormData, NecklaceId, HatId, NecklaceData, HatData } from "../../data/types";

import { Color, MoreMath } from "../../utils";

export class Follower extends Actor implements FollowerObject {
    static readonly TEXTURE_FILENAME: string = "Follower.png";
    static readonly ATLAS_FILENAME: string = "Follower.atlas";
    static readonly SKELETON_FILENAME: string = "Follower.skel";

    static readonly HALO_SLOT_NAME: string = "halo";
    static readonly HALO_ATTACHMENT_NAME: string = "Other/Halo";

    static readonly BABY_SKIN_NAME: string = "Other/Baby";
    static readonly OLD_SKIN_NAME: string = "Other/Old";

    static readonly BODY_EXTRA_SLOT_NAME: string = "BODY_EXTRA";

    private _form: FollowerId;
    #clothing: ClothingId;

    #necklace: NecklaceId | null;
    #hat: HatId | null;

    #isDisciple: boolean;
    #ageState: FollowerAgeState;

    private indexes: FollowerIndexes
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = followerData.forms.Deer.name, form: FollowerId = "Deer", clothing: ClothingId = "Default_Clothing") {
        super(skeleton, animationState, id, label);

        this._form = form;
        this.#clothing = clothing;

        this.#necklace = null;
        this.#hat = null;

        this.#isDisciple = false;
        this.#ageState = FollowerAgeState.Adult;

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
        return this._form;
    }

    set form(form: FollowerId) {
        this._form = form;
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

    get isDisciple(): boolean {
        return this.#isDisciple;
    }

    set isDisciple(isDisciple: boolean) {
        this.#isDisciple = isDisciple;
        this.update();
    }

    get ageState(): FollowerAgeState {
        return this.#ageState;
    }

    set ageState(ageState: FollowerAgeState) {
        this.#ageState = ageState;
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

    clone(id?: string, label?: string, form: FollowerId = this.form, clothing: ClothingId = this.clothing) {
        const { skeleton, animationState } = this;

        const follower = new Follower(new spine.Skeleton(skeleton.data), new spine.AnimationState(animationState.data), id, label, form, clothing);
        follower.copyFromObj(this.toObj());

        follower.form = form;
        follower.clothing = clothing;

        return follower;
    }

    update() {
        const { formData, clothingData, necklaceData, hatData, colorSetData, formVariantIdx, formColorSetIdx, clothingVariantIdx, clothingColorSetIdx, isDisciple, ageState } = this;

        this.setSkin(formData.variants[formVariantIdx]);
        this.addSkins(clothingData.variants[clothingVariantIdx]);

        ageState !== FollowerAgeState.Adult && this.addSkins(Follower[ageState === FollowerAgeState.Baby ? "BABY_SKIN_NAME" : "OLD_SKIN_NAME"]);

        ageState !== FollowerAgeState.Baby && clothingData.sets && this.applyColors(clothingData.sets[clothingColorSetIdx]);
        this.applyColors(colorSetData[formColorSetIdx]);

        necklaceData && this.addSkins(necklaceData.variant);
        hatData && this.addSkins(hatData.variant);

        isDisciple && this.skeleton.setAttachment(Follower.HALO_SLOT_NAME, Follower.HALO_ATTACHMENT_NAME);
        this.tick();
    }

    resetSkin() {
        super.resetSkin();
        this.form === "Deer" && this.skeleton.slots[this.skeleton.findSlotIndex(Follower.BODY_EXTRA_SLOT_NAME)].setAttachment(null as unknown as spine.Attachment);
    }

    copyFromObj(obj: FollowerObject) {
        const { form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat, isDisciple, ageState } = obj;
        
        this.form = form;
        this.formVariantIdx = formVariantIdx;
        this.formColorSetIdx = formColorSetIdx;

        this.clothing = clothing;
        this.clothingVariantIdx = clothingVariantIdx;
        this.clothingColorSetIdx = clothingColorSetIdx;

        this.necklace = necklace;
        this.hat = hat;

        this.isDisciple = isDisciple;
        this.ageState = ageState;

        super.copyFromObj(obj);
    }

    toObj(): FollowerObject {
        const { form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat, isDisciple, ageState } = this;
        return { ...super.toObj(), type: "follower", form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat, isDisciple, ageState };
    }

    applyColors(set: ColorSet) {
        for (const { color, slots } of set) {
            for (const slot of slots) {
                const attachments: spine.SkinEntry[] = [];
                this.skeleton.skin.getAttachmentsForSlot(this.skeleton.findSlotIndex(slot), attachments);

                for (const { attachment } of attachments) {
                    const { r, g, b, a } = Color.fromObj(color).normalize();
                    const spineColor = new spine.Color(r, g, b, a);

                    if ("color" in attachment) attachment.color = spineColor;
                }
            }
        }
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

    isDisciple: boolean;
    ageState: FollowerAgeState;
}

export interface FollowerIndexes {
    form: FollowerIndex;
    clothing: FollowerIndex;
}

export interface FollowerIndex {
    variant: number;
    colorSet: number;
}

export enum FollowerAgeState {
    Baby,
    Adult,
    Elder
}

export function isFollowerObj(obj: ActorObject): obj is FollowerObject {
    return obj instanceof Follower || obj.type === "follower";
}