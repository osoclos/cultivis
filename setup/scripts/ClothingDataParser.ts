import { deepEquals } from "bun";

import { CLOTHING_DLCS, type ClothingMetadata, type ClothingDLC } from "../types";
import { DataReader } from "../utils";

import type { ColorSet } from "../../src/data/types";
import type { ColorObject } from "../../src/utils";

export class ClothingDataParser extends DataReader {
    private static readonly MONO_BEHAVIOUR_METADATA_LENGTH: number[] = [7, 3];
    private static readonly CLOTHING_METADATA_ATTRIBUTE_LENGTH: number = 10;

    parse(): ClothingMetadata {
        // Unity MonoBehaviour metadata (redundant)
        for (const _ of Array(ClothingDataParser.MONO_BEHAVIOUR_METADATA_LENGTH[0]).keys()) this.readUint32();

        const id: string = this.readString();

        // Unity MonoBehaviour metadata (redundant)
        for (const _ of Array(ClothingDataParser.MONO_BEHAVIOUR_METADATA_LENGTH[1]).keys()) this.readUint32();

        // numerical id (redundant)
        this.readUint32();

        // clothing metadata attributes (replaced with custom metadata, but included as fallback)
        const [isUnlockable, isUnique, isFromRitual, isDLC, ...attributes]: boolean[] = Array(ClothingDataParser.CLOTHING_METADATA_ATTRIBUTE_LENGTH).fill(null).map(() => !!this.readUint32());
        const [hasAttributes, _endByte, ...dlcAttributes] = attributes.reverse();
        
        // end of attributes bit (redundant)
        this.readUint32();

        const variants: string[] = Array(this.readUint32()).fill(null).map(this.readString.bind(this));
        const sets: ColorSet[] = Array(this.readUint32()).fill(null).map(this.readSet.bind(this));

        const data: ClothingMetadata = { id, variants, sets };
        if (hasAttributes) {
            data.attributes = { isUnlockable, isUnique, isFromRitual };
            if (isDLC) data.attributes.dlc = CLOTHING_DLCS[dlcAttributes.reverse().indexOf(true)] as ClothingDLC;
        }

        return data;
    }

    private readSet() {
        const sets: ColorSet = [];
        for (const _ of Array(this.readUint32()).keys()) {
            const slot = this.readString();

            // multiply by 255 (0xff) to get unnormalized color values and to save space and network usage
            const [r, g, b, a]: number[] = Array(4).fill(null).map(() => (this.readFloat() * 0xff) | 0);
            const color: ColorObject = { r, g, b, a };

            const i = sets.findIndex(({ color: c }) => deepEquals(c, color));
            i < 0 ? sets.push({ color, slots: [slot] }) : sets[i].slots.push(slot);
        }

        // hidden base color of follower (redundant)
        for (const _ of Array(4).keys()) this.readFloat();

        return sets;
    }
}