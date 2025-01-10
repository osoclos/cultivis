import type { ColorObject } from "../../utils";

export type ColorSet = ColorSetItem[];
export interface ColorSetItem {
    color: ColorObject;
    slots: string[];
}