import fs from "fs";
import path from "path";

import { CLOTHING_IDS, type ClothingDataJSON, type ClothingExtrasJSON, type ClothingMetadataJSON, FOLLOWER_IDS, type FollowerColorSets, type FollowerExtrasJSON, type FollowerFormMetadata, type FollowerMetadataJSON } from "../src/data/types";
import { ClothingDataParser, WorshipperDataParser } from "./utils";

const WORSHIPPER_DATA_PATH = path.join(__dirname, "../src/data/extracted/Worshipper_Data.dat");
const FOLLOWER_EXTRAS_PATH = path.join(__dirname, "../src/data/addons/follower-extras.json");

const worshipperDataBuffer = fs.readFileSync(WORSHIPPER_DATA_PATH);
const worshipperDataParser = new WorshipperDataParser(worshipperDataBuffer);

const [standardColorSets, followerForms] = worshipperDataParser.parse();
const [followerFormMetadata, followerColorSets] = followerForms.reduce(([obj1, obj2], { id, sets, ...data }) => [{ ...obj1, [id]: data }, { ...obj2, [id]: sets }], [{}, {}]) as [FollowerFormMetadata, FollowerColorSets];
const followerExtras: FollowerExtrasJSON = JSON.parse(fs.readFileSync(FOLLOWER_EXTRAS_PATH, { encoding: "utf-8" }));

const followerMetadata = {} as FollowerMetadataJSON;
for (const id of FOLLOWER_IDS) {
    const { category: originalCategory, attributes, variants } = followerFormMetadata[id];
    const { name, category, variants: additionalVariants } = followerExtras[id] ?? {};

    followerMetadata[id] = {
        name: name ?? id,
        category: category ?? originalCategory,
        attributes,

        variants: variants.concat(additionalVariants ?? [])
    };
}

const COLOR_SETS_PATH = path.join(__dirname, "../src/data/color-sets.json");
const FOLLOWER_METADATA_PATH = path.join(__dirname, "../src/data/follower-metadata.json");

fs.writeFileSync(COLOR_SETS_PATH, JSON.stringify({
    standard: standardColorSets,
    followers: followerColorSets
}, null, 4), "utf-8");

fs.writeFileSync(FOLLOWER_METADATA_PATH, JSON.stringify(followerMetadata, null, 4), "utf-8");

const CLOTHING_DATA_DIR = path.join(__dirname, "../src/data/extracted/clothing/");
const CLOTHING_EXTRAS_PATH = path.join(__dirname, "../src/data/addons/clothing-extras.json");

const clothingMetadata = {} as ClothingMetadataJSON;
for (const filename of fs.readdirSync(CLOTHING_DATA_DIR)) {
    const dataFilePath = path.join(CLOTHING_DATA_DIR, filename);
    const buffer = fs.readFileSync(dataFilePath);

    const parser = new ClothingDataParser(buffer);
    const { id, ...data } = parser.parse();

    clothingMetadata[id] = data;
}

const clothingExtras: ClothingExtrasJSON = JSON.parse(fs.readFileSync(CLOTHING_EXTRAS_PATH, { encoding: "utf-8" }));

const clothingData = {} as ClothingDataJSON;
for (const id of CLOTHING_IDS) {
    const { attributes, variants, sets } = clothingMetadata[id] ?? {};
    const { name, category, variants: additionalVariants } = clothingExtras[id] ?? { category: 0 };

    clothingData[id] = {
        name: name ?? id,
        category,
        attributes,
        useFromSource: !sets?.length,

        variants: variants?.concat(additionalVariants ?? []) ?? additionalVariants ?? [],
        sets
    };
}

const CLOTHING_DATA_PATH = path.join(__dirname, "../src/data/clothing-data.json");
fs.writeFileSync(CLOTHING_DATA_PATH, JSON.stringify(clothingData, null, 4), "utf-8");
