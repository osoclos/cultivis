import { deepEquals } from "bun";

import type { ColorSet, FollowerForm } from "../../src/data/types";
import type { ColorObject } from "../../src/utils";

import { DataReader } from "../utils";

export class WorshipperDataParser extends DataReader {
    private static readonly MONO_BEHAVIOUR_METADATA_LENGTH: number = 11;
    private static readonly FOLLOWER_METADATA_ATTRIBUTE_LENGTH: number = 4;

    parse(): [ColorSet[], FollowerForm[]] {
        // Unity MonoBehaviour component metadata (redundant)
        for (const _ of Array(WorshipperDataParser.MONO_BEHAVIOUR_METADATA_LENGTH).keys()) this.readUint32();

        const standardColorSets: ColorSet[] = Array(this.readUint32()).fill(null).map(this.readSet.bind(this));
        const followerForms: FollowerForm[] = Array(this.readUint32()).fill(null).map(this.readForm.bind(this));

        return [standardColorSets, followerForms];
    }

    private readForm() {
        const id = this.readString();
        const category = this.readUint32();

        // follower metadata attributes (replaced with custom metadata, but included as fallback)
        const [hasAttributes, isUnique, hasSpecialEvents, mustBeDiscovered]: boolean[] = Array(WorshipperDataParser.FOLLOWER_METADATA_ATTRIBUTE_LENGTH).fill(null).map(() => !!this.readUint32());

        const variants: string[] = Array(this.readUint32()).fill(null).map(this.readString.bind(this));
        const sets: ColorSet[] = Array(this.readUint32()).fill(null).map(this.readSet.bind(this));

        const form: FollowerForm = { id, category, variants, sets };
        if (hasAttributes) form.attributes = { isUnique, hasSpecialEvents, mustBeDiscovered };
        
        return form;
    }

    private readSet() {
        const sets: ColorSet = [];
        for (const _ of Array(this.readUint32()).keys()) {
            const slot = this.readString();

            const [r, g, b, a]: number[] = Array(4).fill(null).map(this.readFloat.bind(this));
            const color: ColorObject = { r, g, b, a };

            const i = sets.findIndex(({ color: c }) => deepEquals(c, color));
            i < 0 ? sets.push({ color, slots: [slot] }) : sets[i].slots.push(slot);
        }

        // hidden base color of follower (redundant)
        for (const _ of Array(4).keys()) this.readFloat();

        return sets;
    }
}