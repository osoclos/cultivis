import type { ClothingId, FollowerId, ModdedFollowerSlotId } from "../../data/types";
import { moddedFollowerData } from "../../data/files";

import { Color, type ColorObject } from "../../utils";

import type { ActorObject } from "../Actor";
import { Follower, type FollowerObject } from "./Follower";

const TYPE: string = "modded-follower";

export class ModdedFollower extends Follower implements ModdedFollowerObject {
    static readonly TEXTURE_PATHS: string[] = [Follower.TEXTURE_FILENAME, "modded/colorful-eyes.png"];
    static readonly ATLAS_FILENAME: string = "modded/Follower.atlas";

    static readonly LEFT_EYE_SLOT_NAME: string = "EYE_LEFT";
    static readonly RIGHT_EYE_SLOT_NAME: string = "EYE_RIGHT";

    private _colors: Record<AllModdedFollowerSlotId, Color>;
    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label?: string, form?: FollowerId, clothing?: ClothingId) {
        super(skeletonData, atlas, id, label, form, clothing);
        const { skeleton, colorSetData, formColorSetIdx } = this;
        
        this._colors = <Record<AllModdedFollowerSlotId, Color>>{ ...Color.fromColorSet(colorSetData[formColorSetIdx]) };

        for (const dataSlotName in moddedFollowerData) {
            const newSlotName = <ModdedFollowerSlotId>dataSlotName;
            const { regions, slot: targetSlotName, color } = moddedFollowerData[newSlotName];

            const targetSlot = skeleton.findSlot(targetSlotName);
            const { bone } = targetSlot;

            this.addSlot(newSlotName, bone);
            this.addRegionToSlot(regions, newSlotName, targetSlotName);

            this.setColor(newSlotName, color ? Color.fromObj(color) : Color.White);
        }

        this.update();
    }

    get colors(): Record<AllModdedFollowerSlotId, Color> {
        return this._colors;
    }

    get formColorSetIdx(): number {
        return super.formColorSetIdx;
    }

    set formColorSetIdx(formColorSetIdx: number) {;
        const colors = Color.fromColorSet(this.colorSetData[formColorSetIdx]);
        for (const color in colors) this.setColor(<AllModdedFollowerSlotId>color, Color.fromObj(colors[<AllModdedFollowerSlotId>color]));
        
        super.formColorSetIdx = formColorSetIdx;
        this.update();
    }

    setColor(slot: AllModdedFollowerSlotId, color: Color) {
        const { colors } = this;
        slot in colors ? colors[slot].copy(color) : colors[slot] = color.clone();

        this.applyColors(Color.toColorSet(this.colors));
    }

    clone(id?: string, label?: string, form: FollowerId = this.form, clothing: ClothingId = this.clothing): ModdedFollower {
        const { skeleton, atlas } = this;

        const follower = new ModdedFollower(skeleton.data, atlas, id, label, form, clothing);
        follower.copyFromObj(this.toObj());

        follower.form = form;
        follower.clothing = clothing;

        return follower;
    }

    resetSkin() {
        super.resetSkin();
        this.applyColors(Color.toColorSet(this.colors));
    }

    resetAnimation() {
        super.resetAnimation();
        this.applyColors(Color.toColorSet(this.colors));
    }

    copyFromObj(obj: ModdedFollowerObject) {
        super.copyFromObj(obj);

        const { colors } = obj;
        for (const color in colors) this.setColor(<AllModdedFollowerSlotId>color, Color.fromObj(colors[<AllModdedFollowerSlotId>color]));
    }

    toObj(): ModdedFollowerObject {
        const { colors: originalColors } = this;

        const colors = <Record<AllModdedFollowerSlotId, ColorObject>>{};
        for (const color in originalColors) colors[<AllModdedFollowerSlotId>color] = originalColors[<AllModdedFollowerSlotId>color].toObj();

        return { ...super.toObj(), type: TYPE, colors };
    }
}

export interface ModdedFollowerObject extends FollowerObject { colors: Record<AllModdedFollowerSlotId, ColorObject>; };
export function isModdedFollowerObj(obj: ActorObject): obj is ModdedFollowerObject {
    return obj instanceof ModdedFollower || obj.type === TYPE;
}

export const EXISTING_MODDED_FOLLOWER_SLOT_IDS = ["HEAD_SKIN_BTM", "HEAD_SKIN_TOP", "ARM_LEFT_SKIN", "ARM_RIGHT_SKIN", "LEG_LEFT_SKIN", "LEG_RIGHT_SKIN", "BODY_NAKED", "MARKINGS"] as const;
export type ExistingModdedFollowerSlotId = typeof EXISTING_MODDED_FOLLOWER_SLOT_IDS[number];

export type AllModdedFollowerSlotId = ModdedFollowerSlotId | ExistingModdedFollowerSlotId;