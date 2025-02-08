import { Actor, type ActorObject } from "..";

import { followerData } from "../../data/files";
import type { ColorSet, FollowerId, ClothingId, ClothingData, FormData, NecklaceId, HatId, NecklaceData, HatData } from "../../data/types";

import { Color, MoreMath } from "../../utils";

export class Follower extends Actor implements FollowerObject {
    static readonly TEXTURE_FILENAME: string = "Follower.png";
    static readonly ATLAS_FILENAME: string = "Follower.atlas";
    static readonly SKELETON_FILENAME: string = "Follower.skel";

    static readonly HALO_SLOT_NAME: string = "halo";
    static readonly HALO_ATTACHMENT_NAME: string = "Other/Halo";
    
    static readonly HOOD_SKIN_PREFIX: string = "Clothes/Hooded_Lvl";
    static readonly ELDER_HOOD_SKIN_NAME: string = "Clothes/Hooded_HorseTown";
    static readonly MAX_HOOD_LEVEL: number = 5;

    static readonly ROBES_SKIN_PREFIX: string = "Clothes/Robes_Lvl";
    static readonly ELDER_ROBES_SKIN_NAME: string = "Clothes/Robes_Old";
    static readonly ROBES_STARTING_LEVEL: number = 3;
    static readonly LEVELS_PER_ROBES_UPGRADE: number = 2;
    static readonly MAX_ROBES_FOLLOWER_LEVEL: number = (5 - this.ROBES_STARTING_LEVEL + 1) * this.LEVELS_PER_ROBES_UPGRADE; // highest robes level is 5.
    static readonly ROBES_LEVEL_WHEN_EXCEEDED: number = 3;

    static readonly BABY_SKIN_NAME: string = "Other/Baby";
    static readonly ELDER_SKIN_NAME: string = "Other/Old";

    static readonly BODY_EXTRA_SLOT_NAME: string = "BODY_EXTRA";

    private _form: FollowerId;
    #clothing: ClothingId;

    #necklace: NecklaceId | null;
    #hat: HatId | null;

    #level: FollowerLevel;
    #ageState: FollowerAgeState;

    #isDisciple: boolean;
    #isHooded: boolean;

    // TODO: attributes other than isDisciple and ageState are animation-based, so will require animation sequencing. add this when scenarios are added
    #emotionState: FollowerEmotionState;

    #isEnlightened: boolean;
    #isSinned: boolean;

    #isTired: boolean;
    #isHungry: boolean;

    #isSick: boolean;
    #isTraumatized: boolean;

    #isZombie: boolean;
    #isPossessed: boolean;

    #isBrainwashed: boolean;
    #isDissenting: boolean;

    #isBefuddled: boolean;
    #isSweating: boolean;

    private indexes: FollowerIndexes
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = followerData.forms.Deer.name, form: FollowerId = "Deer", clothing: ClothingId = "Default_Clothing") {
        super(skeleton, animationState, id, label);

        this._form = form;
        this.#clothing = clothing;

        this.#necklace = null;
        this.#hat = null;

        this.#level = FollowerLevel.I;

        this.#ageState = FollowerAgeState.Adult;
        this.#emotionState = FollowerEmotionState.Normal;

        this.#isDisciple = false;
        this.#isHooded = false;

        this.#isEnlightened = false;
        this.#isSinned = false;

        this.#isTired = false;
        this.#isHungry = false;

        this.#isSick = false;
        this.#isTraumatized = false;

        this.#isZombie = false;
        this.#isPossessed = false;

        this.#isBrainwashed = false;
        this.#isDissenting = false;

        this.#isBefuddled = false;
        this.#isSweating = false;

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

    get level(): FollowerLevel {
        return this.#level;
    }

    set level(level: FollowerLevel) {
        this.#level = level;
        this.update();
    }

    get ageState(): FollowerAgeState {
        return this.#ageState;
    }

    set ageState(ageState: FollowerAgeState) {
        this.#ageState = ageState;
        this.update();
    }

    get emotionState(): FollowerEmotionState {
        return this.#emotionState;
    }

    set emotionState(emotionState: FollowerEmotionState) {
        this.#emotionState = emotionState;
        this.update();
    }

    get isDisciple(): boolean {
        return this.#isDisciple;
    }

    set isDisciple(isDisciple: boolean) {
        this.#isDisciple = isDisciple;
        this.update();
    }

    get isHooded(): boolean {
        return this.#isHooded;
    }

    set isHooded(isHooded: boolean) {
        this.#isHooded = isHooded;
        this.update();
    }

    get isEnlightened(): boolean {
        return this.#isEnlightened;
    }

    set isEnlightened(isEnlightened: boolean) {
        this.#isEnlightened = isEnlightened;
        this.update();
    }

    get isSinned(): boolean {
        return this.#isSinned;
    }

    set isSinned(isSinned: boolean) {
        this.#isSinned = isSinned;
        this.update();
    }

    get isTired(): boolean {
        return this.#isTired;
    }

    set isTired(isTired: boolean) {
        this.#isTired = isTired;
        this.update();
    }

    get isHungry(): boolean {
        return this.#isHungry;
    }

    set isHungry(isHungry: boolean) {
        this.#isHungry = isHungry;
        this.update();
    }

    get isSick(): boolean {
        return this.#isSick;
    }

    set isSick(isSick: boolean) {
        this.#isSick = isSick;
        this.update();
    }

    get isTraumatized(): boolean {
        return this.#isTraumatized;
    }

    set isTraumatized(isTraumatized: boolean) {
        this.#isTraumatized = isTraumatized;
        this.update();
    }

    get isZombie(): boolean {
        return this.#isZombie;
    }

    set isZombie(isZombie: boolean) {
        this.#isZombie = isZombie;
        this.update();
    }

    get isPossessed(): boolean {
        return this.#isPossessed;
    }

    set isPossessed(isPossessed: boolean) {
        this.#isPossessed = isPossessed;
        this.update();
    }

    get isBrainwashed(): boolean {
        return this.#isBrainwashed;
    }

    set isBrainwashed(isBrainwashed: boolean) {
        this.#isBrainwashed = isBrainwashed;
        this.update();
    }

    get isDissenting(): boolean {
        return this.#isDissenting;
    }

    set isDissenting(isDissenting: boolean) {
        this.#isDissenting = isDissenting;
        this.update();
    }

    get isBefuddled(): boolean {
        return this.#isBefuddled;
    }

    set isBefuddled(isBefuddled: boolean) {
        this.#isBefuddled = isBefuddled;
        this.update();
    }

    get isSweating(): boolean {
        return this.#isSweating;
    }

    set isSweating(isSweating: boolean) {
        this.#isSweating = isSweating;
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
        const { formData, clothingData, necklaceData, hatData, colorSetData, formVariantIdx, formColorSetIdx, clothingVariantIdx, clothingColorSetIdx, level, ageState, isDisciple, isHooded } = this;

        this.setSkin(formData.variants[formVariantIdx]);
        ageState !== FollowerAgeState.Adult && this.addSkins(Follower[ageState === FollowerAgeState.Baby ? "BABY_SKIN_NAME" : "ELDER_SKIN_NAME"]);

        isHooded && this.addSkins(ageState === FollowerAgeState.Elder ? Follower.ELDER_HOOD_SKIN_NAME : `${Follower.HOOD_SKIN_PREFIX}${Math.min(level, Follower.MAX_HOOD_LEVEL)}`)
        this.addSkins(
            isHooded
                ? ageState === FollowerAgeState.Elder
                    ? Follower.ELDER_ROBES_SKIN_NAME
                    : `${Follower.ROBES_SKIN_PREFIX}${level > Follower.MAX_ROBES_FOLLOWER_LEVEL ? Follower.ROBES_LEVEL_WHEN_EXCEEDED : Math.floor((level - 1) / Follower.LEVELS_PER_ROBES_UPGRADE) + Follower.ROBES_STARTING_LEVEL}`
                : clothingData.variants[clothingVariantIdx]
        );
        
        isHooded ? ageState !== FollowerAgeState.Elder && this.applyColors(followerData.clothing.Default_Clothing.sets![clothingColorSetIdx]) : clothingData.sets && this.applyColors(clothingData.sets[clothingColorSetIdx]);
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
        const { form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat, level, ageState, emotionState, isDisciple, isHooded, isEnlightened, isSinned, isTired, isHungry, isSick, isTraumatized, isZombie, isPossessed, isBrainwashed, isDissenting, isBefuddled, isSweating } = obj;
        
        this.form = form;
        this.formVariantIdx = formVariantIdx;
        this.formColorSetIdx = formColorSetIdx;

        this.clothing = clothing;
        this.clothingVariantIdx = clothingVariantIdx;
        this.clothingColorSetIdx = clothingColorSetIdx;

        this.necklace = necklace;
        this.hat = hat;

        this.level = level;
        
        this.ageState = ageState;
        this.emotionState = emotionState;

        this.isDisciple = isDisciple;
        this.isHooded = isHooded;

        this.isEnlightened = isEnlightened;
        this.isSinned = isSinned;

        this.isTired = isTired;
        this.isHungry = isHungry;
        
        this.isSick = isSick;
        this.isTraumatized = isTraumatized;
        
        this.isZombie = isZombie;
        this.isPossessed = isPossessed;
        
        this.isBrainwashed = isBrainwashed;
        this.isDissenting = isDissenting;
        
        this.isBefuddled = isBefuddled;
        this.isSweating = isSweating;

        super.copyFromObj(obj);
    }

    toObj(): FollowerObject {
        const { form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat, level, ageState, emotionState, isDisciple, isHooded, isEnlightened, isSinned, isTired, isHungry, isSick, isTraumatized, isZombie, isPossessed, isBrainwashed, isDissenting, isBefuddled, isSweating } = this;
        return { ...super.toObj(), type: "follower", form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat, level, ageState, emotionState, isDisciple, isHooded, isEnlightened, isSinned, isTired, isHungry, isSick, isTraumatized, isZombie, isPossessed, isBrainwashed, isDissenting, isBefuddled, isSweating };
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
        const { formData, formVariantIdx, clothingData, clothingVariantIdx, colorSetData, formColorSetIdx, clothingColorSetIdx, isHooded} = this;

        this.indexes.form.variant = MoreMath.clamp(formVariantIdx, 0, formData.variants.length - 1);
        this.indexes.form.colorSet = MoreMath.clamp(formColorSetIdx, 0, colorSetData.length - 1);

        this.indexes.clothing.variant = MoreMath.clamp(clothingVariantIdx, 0, clothingData.variants.length - 1);
        this.indexes.clothing.colorSet = MoreMath.clamp(clothingColorSetIdx, 0, ((isHooded ? followerData.clothing.Default_Clothing : clothingData).sets?.length ?? 1) - 1);
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

    level: FollowerLevel;

    ageState: FollowerAgeState;
    emotionState: FollowerEmotionState;

    isDisciple: boolean;
    isHooded: boolean;

    isEnlightened: boolean;
    isSinned: boolean;

    isTired: boolean;
    isHungry: boolean;

    isSick: boolean;
    isTraumatized: boolean;

    isZombie: boolean;
    isPossessed: boolean;

    isBrainwashed: boolean;
    isDissenting: boolean;

    isBefuddled: boolean;
    isSweating: boolean;
}

export interface FollowerIndexes {
    form: FollowerIndex;
    clothing: FollowerIndex;
}

export interface FollowerIndex {
    variant: number;
    colorSet: number;
}

export enum FollowerLevel {
    I = 1,
    II,
    III,
    IV,
    V,
    VI,
    VII,
    VIII,
    IX,
    X
}

export enum FollowerAgeState {
    Baby,
    Adult,
    Elder
}

export enum FollowerEmotionState {
    Normal,
    Happy,
    Sad,
    Angry,
    Scared
}

export function isFollowerObj(obj: ActorObject): obj is FollowerObject {
    return obj instanceof Follower || obj.type === "follower";
}