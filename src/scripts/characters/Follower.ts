import { followerAnimationData, followerData } from "../../data/files";
import type { ColorSet, FollowerId, ClothingId, ClothingData, FormData, NecklaceId, HatId, NecklaceData, HatData, FollowerAnimationId } from "../../data/types";

import { Color, MoreMath } from "../../utils";

import { Actor, type ActorObject } from "../Actor";

const TYPE: string = "follower";

export class Follower extends Actor implements FollowerObject {
    static readonly TEXTURE_FILENAME: string = "Follower.png";
    static readonly ATLAS_FILENAME: string = "Follower.atlas";
    static readonly SKELETON_FILENAME: string = "Follower.skel";

    static readonly BABY_SKIN_NAME: string = "Other/Baby";
    static readonly ELDER_SKIN_NAME: string = "Other/Old";

    static readonly EMOTIONS_ANIMATION_PREFIX: string = "Emotions"

    static readonly EMOTION_STATE_TRACK_INDEX: number = 100;

    static readonly POSSESSION_STATE_TRACK_INDEX: number = 101;
    static readonly SICK_STATE_TRACK_INDEX: number = 102;
    static readonly BELIEF_STATE_TRACK_INDEX: number = 103;

    static readonly TIRED_TRACK_INDEX: number = 104;
    static readonly SWEATING_TRACK_INDEX: number = 105;

    static readonly TIRED_ANIMATION_NAME: string = "emotion-tired";
    static readonly SWEATING_ANIMATION_NAME: string = "emotion-soaked";

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

    static readonly BODY_EXTRA_SLOT_NAME: string = "BODY_EXTRA";

    #animationId: FollowerAnimationId;

    #form: FollowerId;
    #clothing: ClothingId;

    #necklace: NecklaceId | null;
    #hat: HatId | null;

    #level: FollowerLevel;

    #ageState: FollowerAgeState;
    #emotionState: FollowerEmotionState;

    #possessionState: FollowerPossessionState | null;
    #sickState: FollowerSickState | null;
    #beliefState: FollowerBeliefState | null;

    #isDisciple: boolean;
    #isHooded: boolean;

    #isTired: boolean;
    #isSweating: boolean;

    #isBefuddled: boolean;

    private indexes: FollowerIndexes
    constructor(skeleton: spine.Skeleton, animationState: spine.AnimationState, id?: string, label: string = followerData.forms.Deer.name, form: FollowerId = "Deer", clothing: ClothingId = "Default_Clothing") {
        super(skeleton, animationState, id, label);

        this.#animationId = "Idle";

        this.#form = form;
        this.#clothing = clothing;

        this.#necklace = null;
        this.#hat = null;

        this.#level = FollowerLevel.I;

        this.#ageState = FollowerAgeState.Adult;
        this.#emotionState = FollowerEmotionState.Normal;

        this.#possessionState = null;
        this.#sickState = null;
        this.#beliefState = null;

        this.#isDisciple = false;
        this.#isHooded = false;

        this.#isTired = false;
        this.#isSweating = false;

        this.#isBefuddled = false;

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

    get animationId(): FollowerAnimationId {
        return this.#animationId;
    }

    set animationId(animationId: FollowerAnimationId) {
        this.#animationId = animationId;
        console.log(animationId)
        animationId in followerAnimationData && this.setAnimation(followerAnimationData[animationId]);
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

    get possessionState(): FollowerPossessionState | null {
        return this.#possessionState;
    }

    set possessionState(possessionState: FollowerPossessionState | null) {
        this.#possessionState = possessionState;
        this.update();
    }

    get sickState(): FollowerSickState | null {
        return this.#sickState;
    }

    set sickState(sickState: FollowerSickState | null) {
        this.#sickState = sickState;
        this.update();
    }

    get beliefState(): FollowerBeliefState | null {
        return this.#beliefState;
    }

    set beliefState(beliefState: FollowerBeliefState | null) {
        this.#beliefState = beliefState;
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

    get isTired(): boolean {
        return this.#isTired;
    }

    set isTired(isTired: boolean) {
        this.#isTired = isTired;
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
        
        if ("attachments" in clothingData) {
            const clothingSkin = new spine.Skin(clothingData.variants[clothingVariantIdx]);
            
            this.skeleton.data.findSkin(clothingData.variants[clothingVariantIdx]).getAttachments().filter(({ name }) => clothingData.attachments!.some((str) => name.includes(str))).forEach(({ name, attachment, slotIndex }) => clothingSkin.setAttachment(slotIndex, name, attachment));
            this.addCustomSkin(clothingSkin);
        } else this.addSkins(
            isHooded
                ? ageState === FollowerAgeState.Elder
                    ? Follower.ELDER_ROBES_SKIN_NAME
                    : `${Follower.ROBES_SKIN_PREFIX}${level > Follower.MAX_ROBES_FOLLOWER_LEVEL ? Follower.ROBES_LEVEL_WHEN_EXCEEDED : (((level - 1) / Follower.LEVELS_PER_ROBES_UPGRADE) | 0) + Follower.ROBES_STARTING_LEVEL}`
                : clothingData.variants[clothingVariantIdx]
        );

        isHooded ? ageState !== FollowerAgeState.Elder && this.applyColors(followerData.clothing.Default_Clothing.sets![clothingColorSetIdx]) : clothingData.sets && this.applyColors(clothingData.sets[clothingColorSetIdx]);
        formData.canBeTinted && this.applyColors(colorSetData[formColorSetIdx]);

        necklaceData && this.addSkins(necklaceData.variant);
        hatData && this.addSkins(hatData.variant);

        isDisciple && this.skeleton.setAttachment(Follower.HALO_SLOT_NAME, Follower.HALO_ATTACHMENT_NAME);

        

        this.tick();
    }

    resetSkin() {
        super.resetSkin();
        this.form === "Deer" && this.skeleton.slots[this.skeleton.findSlotIndex(Follower.BODY_EXTRA_SLOT_NAME)].setAttachment(null as unknown as spine.Attachment);
    }

    resetAnimation() {
        super.resetAnimation();

        const { animationState, emotionState, possessionState, sickState, beliefState, isTired, isBefuddled, isSweating } = this;

        const emotionStateAnimation: string = (() => {
            switch (emotionState) {
                case FollowerEmotionState.Normal: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-${isBefuddled ? "drunk" : "normal"}`;
                case FollowerEmotionState.Happy: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-${isBefuddled ? "drunk" : "happy"}`;
                case FollowerEmotionState.Sad: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-${isBefuddled ? "drunk-sad" : "unhappy"}`;
                case FollowerEmotionState.Angry: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-${isBefuddled ? "drunk-angry" : "angry"}`;
                case FollowerEmotionState.Scared: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-${isBefuddled ? "drunk" : "scared"}`;
            }
        })();

        const possessionStateAnimation: string | null = (() => {
            switch (possessionState) {
                case FollowerPossessionState.Enlightened: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-enlightened`;
                case FollowerPossessionState.Sinned: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-sin`;
                
                default: return null;
            }
        })();

        const sickStateAnimation: string | null = (() => {
            switch (sickState) {
                case FollowerSickState.Sick: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-sick`;
                case FollowerSickState.Traumatized: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-dread`;
                
                case FollowerSickState.Zombie: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-zombie`;
                case FollowerSickState.Possessed: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-possessed`;
                
                default: return null;
            }
        })();

        const beliefStateAnimation: string | null = (() => {
            switch (beliefState) {
                case FollowerBeliefState.Brainwashed: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-brainwashed`;
                case FollowerBeliefState.Dissenting: return `${Follower.EMOTIONS_ANIMATION_PREFIX}/emotion-dissenter`;
                
                default: return null;
            }
        })();

        animationState.setAnimation(Follower.EMOTION_STATE_TRACK_INDEX, emotionStateAnimation, true);

        possessionStateAnimation ? animationState.setAnimation(Follower.POSSESSION_STATE_TRACK_INDEX, possessionStateAnimation, true) : animationState.setEmptyAnimation(Follower.POSSESSION_STATE_TRACK_INDEX, 0);
        sickStateAnimation ? animationState.setAnimation(Follower.SICK_STATE_TRACK_INDEX, sickStateAnimation, true) : animationState.setEmptyAnimation(Follower.SICK_STATE_TRACK_INDEX, 0);
        beliefStateAnimation ? animationState.setAnimation(Follower.BELIEF_STATE_TRACK_INDEX, beliefStateAnimation, true) : animationState.setEmptyAnimation(Follower.BELIEF_STATE_TRACK_INDEX, 0);

        isTired ? animationState.setAnimation(Follower.TIRED_TRACK_INDEX, `${Follower.EMOTIONS_ANIMATION_PREFIX}/${Follower.TIRED_ANIMATION_NAME}`, true) : animationState.setEmptyAnimation(Follower.TIRED_TRACK_INDEX, 0);
        isSweating ? animationState.setAnimation(Follower.SWEATING_TRACK_INDEX, `${Follower.EMOTIONS_ANIMATION_PREFIX}/${Follower.SWEATING_ANIMATION_NAME}`, true) : animationState.setEmptyAnimation(Follower.SWEATING_TRACK_INDEX, 0);
    }

    copyFromObj(obj: FollowerObject) {
        const { form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat, level, ageState, emotionState, possessionState, sickState, beliefState, isDisciple, isHooded, isTired, isSweating, isBefuddled } = obj;
        
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

        this.possessionState = possessionState;
        this.sickState = sickState;
        this.beliefState = beliefState;

        this.isDisciple = isDisciple;
        this.isHooded = isHooded;

        this.isTired = isTired;
        this.isSweating = isSweating;
        
        this.isBefuddled = isBefuddled;

        super.copyFromObj(obj);
    }

    toObj(): FollowerObject {
        const { animationId, form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat, level, ageState, emotionState, possessionState, sickState, beliefState, isDisciple, isHooded, isTired, isSweating, isBefuddled } = this;
        return { ...super.toObj(), type: TYPE, animationId, form, formVariantIdx, formColorSetIdx, clothing, clothingVariantIdx, clothingColorSetIdx, necklace, hat, level, ageState, emotionState, possessionState, sickState, beliefState, isDisciple, isHooded, isTired, isSweating, isBefuddled };
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
    animationId: FollowerAnimationId;

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

    possessionState: FollowerPossessionState | null;
    sickState: FollowerSickState | null;
    beliefState: FollowerBeliefState | null;

    isDisciple: boolean;
    isHooded: boolean;

    isTired: boolean;
    isSweating: boolean;

    isBefuddled: boolean;
}

export interface FollowerIndexes {
    form: FollowerIndex;
    clothing: FollowerIndex;
}

export interface FollowerIndex {
    variant: number;
    colorSet: number;
}

export const enum FollowerLevel {
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

export const enum FollowerAgeState {
    Baby,
    Adult,
    Elder
}

export const enum FollowerEmotionState {
    Normal,
    Happy,
    Sad,
    Angry,
    Scared
}

export const enum FollowerPossessionState {
    Enlightened,
    Sinned
}

export const enum FollowerSickState {
    Sick,
    Traumatized,
    
    Zombie,
    Possessed
}

export const enum FollowerBeliefState {
    Brainwashed,
    Dissenting
}

export function isFollowerObj(obj: ActorObject): obj is FollowerObject {
    return obj instanceof Follower || obj.type === TYPE;
}