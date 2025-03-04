import { deepEquals } from "bun";

import { type WorshipperData } from "../types";
import { DataReader } from "../utils";

import type { ColorSet } from "../../src/data/types";
import type { ColorObject } from "../../src/utils";

export class WorshipperDataParser extends DataReader {
    private static readonly MONO_BEHAVIOUR_METADATA_LENGTH: number = 11;
    private static readonly FOLLOWER_METADATA_ATTRIBUTE_LENGTH: number = 4;

    parse(): [ColorSet[], WorshipperData[]] {
        // Unity MonoBehaviour component metadata (redundant)
        for (const _ of Array(WorshipperDataParser.MONO_BEHAVIOUR_METADATA_LENGTH)) this.readUint32();

        const generalColorSets: ColorSet[] = Array(this.readUint32()).fill(null).map(this.readSet.bind(this));
        const worshipperData: WorshipperData[] = Array(this.readUint32()).fill(null).map(this.readData.bind(this));

        return [generalColorSets, worshipperData];
    }

    private readData() {
        const id = this.readString();
        const category = this.readUint32();

        // follower metadata attributes (replaced with custom metadata, but included as fallback)
        const [hasAttributes, isUnique, hasSpecialEvents, mustBeDiscovered]: boolean[] = Array(WorshipperDataParser.FOLLOWER_METADATA_ATTRIBUTE_LENGTH).fill(null).map(() => !!this.readUint32());

        const variants: string[] = Array(this.readUint32()).fill(null).map(this.readString.bind(this));
        const sets: ColorSet[] = Array(this.readUint32()).fill(null).map(this.readSet.bind(this));

        const data: WorshipperData = { id, category, variants, sets };
        if (hasAttributes) data.attributes = { isUnique, hasSpecialEvents, mustBeDiscovered };
        
        return data;
    }

    private readSet() {
        const sets: ColorSet = [];
        for (const _ of Array(this.readUint32())) {
            const slot = this.readString();

            // multiply by 255 (0xff) to get unnormalized color values and to save space and network usage
            const [r, g, b, a]: number[] = Array(4).fill(null).map(() => (this.readFloat() * 0xff) | 0);
            const color: ColorObject = { r, g, b, a };

            const i = sets.findIndex(({ color: c }) => deepEquals(c, color));
            i < 0 ? sets.push({ color, slots: [slot] }) : sets[i].slots.push(slot);
        }

        // hidden base color of follower (redundant)
        for (const _ of Array(4)) this.readFloat();

        return sets;
    }
}