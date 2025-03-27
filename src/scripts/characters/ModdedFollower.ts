import type { ClothingId, FollowerId } from "../../data/types";
import { Color } from "../../utils";

import type { ActorObject } from "../Actor";
import { Follower, type FollowerObject } from "./Follower";

const TYPE: string = "modded-follower";

export const enum ModdedFollowerSlots {
    Head = "HEAD_SKIN_BTM",
    HeadDetails = "HEAD_SKIN_TOP",

    LeftArm = "ARM_LEFT_SKIN",
    RightArm = "ARM_RIGHT_SKIN",

    LeftLeg = "LEG_LEFT_SKIN",
    RightLeg = "LEG_RIGHT_SKIN",

    Body = "BODY_NAKED",
    Markings = "MARKINGS",

    LeftIris = "left-iris",
    RightIris = "right-iris",

    LeftPupil = "left-pupil",
    RightPupil = "right-pupil",

    LeftSchlera = "left-schlera",
    RightSchlera = "right-schlera",

    LeftEyeOutline = "left-eye-outline",
    RightEyeOutline = "right-eye-outline"
}

export const enum ModdedFollowerRegions {
    NormalIris = "EYE-IRIS",
    NormalPupil = "EYE-PUPIL",
    NormalSchlera = "EYE-SCHLERA",
    NormalEyeOutline = "EYE-OUTLINE"
}

export const MODDED_FOLLOWER_SLOT_NAMES: Record<ModdedFollowerSlots, string> = {
    [ModdedFollowerSlots.Head]: "Head",
    [ModdedFollowerSlots.HeadDetails]: "Head Details",

    [ModdedFollowerSlots.LeftArm]: "Left Arm",
    [ModdedFollowerSlots.RightArm]: "Right Arm",

    [ModdedFollowerSlots.LeftLeg]: "Left Leg",
    [ModdedFollowerSlots.RightLeg]: "Right Leg",

    [ModdedFollowerSlots.Body]: "Body",
    [ModdedFollowerSlots.Markings]: "Markings",

    [ModdedFollowerSlots.LeftIris]: "Left Iris",
    [ModdedFollowerSlots.RightIris]: "Right Iris",

    [ModdedFollowerSlots.LeftPupil]: "Left Pupil",
    [ModdedFollowerSlots.RightPupil]: "Right Pupil",

    [ModdedFollowerSlots.LeftSchlera]: "Left Eye White",
    [ModdedFollowerSlots.RightSchlera]: "Right Eye White",

    [ModdedFollowerSlots.LeftEyeOutline]: "Left Eye Outline",
    [ModdedFollowerSlots.RightEyeOutline]: "Right Eye Outline",
} as const;

export type ModdedFollowerSlotName = typeof MODDED_FOLLOWER_SLOT_NAMES[ModdedFollowerSlots];

export const DEFAULT_MODDED_FOLLOWER_REGION_COLORS: Record<ModdedFollowerRegions, number> = {
    [ModdedFollowerRegions.NormalIris]: 0x120d0d,
    [ModdedFollowerRegions.NormalPupil]: 0xffffff,
    [ModdedFollowerRegions.NormalSchlera]: 0xffffff,
    [ModdedFollowerRegions.NormalEyeOutline]: 0xffffff,
};

export class ModdedFollower extends Follower implements ModdedFollowerObject {
    static readonly TEXTURE_PATHS: string[] = [Follower.TEXTURE_FILENAME, "modded/colorful-eyes.png"];
    static readonly ATLAS_FILENAME: string = "modded/Follower.atlas";

    static readonly LEFT_EYE_SLOT_NAME: string = "EYE_LEFT";
    static readonly RIGHT_EYE_SLOT_NAME: string = "EYE_RIGHT";

    #colors: Record<ModdedFollowerSlots, Color>;
    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label?: string, form?: FollowerId, clothing?: ClothingId) {
        super(skeletonData, atlas, id, label, form, clothing);
        const { skeleton, colorSetData, formColorSetIdx } = this;
        
        this.#colors = Color.fromColorSet(colorSetData[formColorSetIdx]);

        const leftEyeSlot = skeleton.slots.find(({ data: { name }}) => name === ModdedFollower.LEFT_EYE_SLOT_NAME)!;
        const { bone: leftEyeBone } = leftEyeSlot;
        
        const rightEyeSlot = skeleton.slots.find(({ data: { name }}) => name === ModdedFollower.RIGHT_EYE_SLOT_NAME)!;
        const { bone: rightEyeBone } = rightEyeSlot;
        
        // move all of these to a data file
        this.addSlot(ModdedFollowerSlots.LeftIris, leftEyeBone);
        this.addSlot(ModdedFollowerSlots.LeftPupil, leftEyeBone);
        this.addSlot(ModdedFollowerSlots.LeftSchlera, leftEyeBone);
        this.addSlot(ModdedFollowerSlots.LeftEyeOutline, leftEyeBone);

        this.addRegionToSlot({ "Face/EYE": ModdedFollowerRegions.NormalIris }, ModdedFollowerSlots.LeftIris, ModdedFollower.LEFT_EYE_SLOT_NAME);
        this.addRegionToSlot({ "Face/EYE": ModdedFollowerRegions.NormalPupil }, ModdedFollowerSlots.LeftPupil, ModdedFollower.LEFT_EYE_SLOT_NAME);
        this.addRegionToSlot({ "Face/EYE": ModdedFollowerRegions.NormalSchlera }, ModdedFollowerSlots.LeftSchlera, ModdedFollower.LEFT_EYE_SLOT_NAME);
        this.addRegionToSlot({ "Face/EYE": ModdedFollowerRegions.NormalEyeOutline }, ModdedFollowerSlots.LeftEyeOutline, ModdedFollower.LEFT_EYE_SLOT_NAME);

        this.addSlot(ModdedFollowerSlots.RightIris, rightEyeBone);
        this.addSlot(ModdedFollowerSlots.RightPupil, rightEyeBone);
        this.addSlot(ModdedFollowerSlots.RightSchlera, rightEyeBone);
        this.addSlot(ModdedFollowerSlots.RightEyeOutline, rightEyeBone);

        this.addRegionToSlot({ "Face/EYE": ModdedFollowerRegions.NormalIris }, ModdedFollowerSlots.RightIris, ModdedFollower.RIGHT_EYE_SLOT_NAME);
        this.addRegionToSlot({ "Face/EYE": ModdedFollowerRegions.NormalPupil }, ModdedFollowerSlots.RightPupil, ModdedFollower.RIGHT_EYE_SLOT_NAME);
        this.addRegionToSlot({ "Face/EYE": ModdedFollowerRegions.NormalSchlera }, ModdedFollowerSlots.RightSchlera, ModdedFollower.RIGHT_EYE_SLOT_NAME);
        this.addRegionToSlot({ "Face/EYE": ModdedFollowerRegions.NormalEyeOutline }, ModdedFollowerSlots.RightEyeOutline, ModdedFollower.RIGHT_EYE_SLOT_NAME);

        this.update();
    }

    get colors(): Record<ModdedFollowerSlots, Color> {
        return this.#colors;
    }

    clone(id?: string, label?: string, form: FollowerId = this.form, clothing: ClothingId = this.clothing): ModdedFollower {
        const { skeleton, atlas } = this;

        const follower = new ModdedFollower(skeleton.data, atlas, id, label, form, clothing);
        follower.copyFromObj(this.toObj());

        follower.form = form;
        follower.clothing = clothing;

        return follower;
    }

    copyFromObj(obj: ModdedFollowerObject) {
        const { colors } = obj;
        this.#colors = colors;

        super.copyFromObj(obj);
    }

    toObj(): ModdedFollowerObject {
        const { colors } = this;
        return { ...super.toObj(), type: TYPE, colors };
    }
}

export interface ModdedFollowerObject extends FollowerObject { colors: Record<ModdedFollowerSlots, Color>; };
export function isModdedFollowerObj(obj: ActorObject): obj is ModdedFollowerObject {
    return obj instanceof ModdedFollower || obj.type === TYPE;
}