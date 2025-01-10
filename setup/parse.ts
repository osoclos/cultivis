import fs from "fs";
import path from "path";

import type { FollowerExtrasJSON, ClothingExtrasJSON, ClothingMetadataJSON } from "./types";
import { ClothingDataParser, WorshipperDataParser } from "./utils";

import { CLOTHING_IDS, ClothingDataJSON, FOLLOWER_IDS, FollowerDataJSON, FormDataJSON, HatDataJSON, NecklaceDataJSON } from "../src/data/types";

const WORSHIPPER_DATA_PATH = path.join(__dirname, "extracted/Worshipper_Data.dat");
const CLOTHING_DATA_DIR = path.join(__dirname, "extracted/clothing/");

const FOLLOWER_EXTRAS_PATH = path.join(__dirname, "addons/follower-extras.json");
const CLOTHING_EXTRAS_PATH = path.join(__dirname, "addons/clothing-extras.json");

const NECKLACE_DATA_PATH = path.join(__dirname, "addons/necklace-data.json");
const HAT_DATA_PATH = path.join(__dirname, "addons/hat-data.json");

const followerExtras: FollowerExtrasJSON = JSON.parse(fs.readFileSync(FOLLOWER_EXTRAS_PATH, { encoding: "utf-8" }));
const clothingExtras: ClothingExtrasJSON = JSON.parse(fs.readFileSync(CLOTHING_EXTRAS_PATH, { encoding: "utf-8" }));

const necklaceData: NecklaceDataJSON = JSON.parse(fs.readFileSync(NECKLACE_DATA_PATH, { encoding: "utf-8" }));
const hatData: HatDataJSON = JSON.parse(fs.readFileSync(HAT_DATA_PATH, { encoding: "utf-8" }));

const worshipperDataBuffer = fs.readFileSync(WORSHIPPER_DATA_PATH);
const worshipperDataParser = new WorshipperDataParser(worshipperDataBuffer);

const [generalColorSets, worshipperData] = worshipperDataParser.parse();
const formData = {} as FormDataJSON;

for (const id of FOLLOWER_IDS) {
    const { category: originalCategory, variants, sets } = worshipperData.find(({ id: form }) => form === id)!;
    const { name = id, category = originalCategory, variants: additionalVariants = [] } = followerExtras[id] ?? {};
    
    variants.concat(additionalVariants);
    formData[id] = { name, category, variants, sets };
}

const clothingMetadata = {} as ClothingMetadataJSON;
for (const filename of fs.readdirSync(CLOTHING_DATA_DIR)) {
    const dataFilePath = path.join(CLOTHING_DATA_DIR, filename);
    const buffer = fs.readFileSync(dataFilePath);

    const parser = new ClothingDataParser(buffer);
    const { id, ...data } = parser.parse();

    clothingMetadata[id] = data;
}

const clothingData = {} as ClothingDataJSON;
for (const id of CLOTHING_IDS) {
    const { variants = [], sets } = clothingMetadata[id] ?? {};
    const { name = id, category, variants: additionalVariants = [] } = clothingExtras[id] ?? { category: 0 };

    variants.concat(additionalVariants);
    clothingData[id] = { name, category, variants, sets };
}

const FOLLOWER_DATA_PATH = path.join(__dirname, "../src/data/follower-data.json");
const followerData: FollowerDataJSON = {
    forms: formData,
    clothing: clothingData,

    necklaces: necklaceData,
    hats: hatData,

    generalColorSets
};

fs.writeFileSync(FOLLOWER_DATA_PATH, JSON.stringify(followerData, null, 4));