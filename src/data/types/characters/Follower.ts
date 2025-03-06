import type { ColorObject } from "../../../utils";
import followerData from "../../files/characters/follower-data.json";

export interface FollowerDataJSON {
    forms: FormDataJSON
    clothing: ClothingDataJSON;
    
    necklaces: NecklaceDataJSON;
    hats: HatDataJSON;

    generalColorSets: ColorSet[];
}

export type FormDataJSON = Record<FollowerId, FormData>;
export interface FormData {
    name: string;
    category: FollowerCategory;

    variants: string[];
    sets: ColorSet[];

    canBeTinted: boolean;
}

export const FOLLOWER_IDS: (keyof typeof followerData.forms)[] = ["Deer", "Pig", "Dog", "Cat", "Fox", "Night Wolf", "Fish", "Pangolin", "Shrew", "Unicorn", "Axolotl", "Starfish", "Red Panda", "Poop", "Massive Monster", "Crab", "Snail", "Owl", "Butterfly", "Koala", "Shrimp", "Snake", "Worm", "Mushroom", "Bee", "Tapir", "Turtle", "Monkey", "Narwal", "Moose", "Gorilla", "Mosquito", "Goldfish", "Possum", "Hammerhead", "Llama", "Tiger", "Sphynx", "LadyBug", "TwitchMouse", "TwitchCat", "TwitchDog", "TwitchDogAlt", "TwitchPoggers", "Lion", "Penguin", "Pelican", "Kiwi", "DogTeddy", "Camel", "Anteater", "Skunk", "Panda", "Enchida", "Boss Death Cat", "CultLeader 1", "CultLeader 2", "CultLeader 3", "CultLeader 4", "Baal", "Aym", "Sozo", "Jalala", "Rinor", "Abomination", "Seal", "Lemur", "Caterpillar", "Webber", "Volvy", "StarBunny", "Crow", "BatDemon", "DeerSkull", "Cthulhu", "DeerRitual", "Poppy", "Cow", "Horse", "Hedgehog", "Rabbit", "Chicken", "Squirrel", "Boss Mama Worm", "Boss Mama Maggot", "Boss Burrow Worm", "Boss Beholder 1", "Giraffe", "Bison", "Frog", "Capybara", "Fennec Fox", "Rhino", "Eagle", "Boss Flying Burp Frog", "Boss Egg Hopper", "Boss Mortar Hopper", "Boss Beholder 2", "Crocodile", "Elephant", "Hippo", "Otter", "Seahorse", "Duck", "Boss Spiker", "Boss Charger", "Boss Scuttle Turret", "Boss Beholder 3", "Racoon", "Bear", "Bat", "Beetle", "Badger", "Boss Spider Jump", "Boss Millipede Poisoner", "Boss Scorpion", "Boss Beholder 4"] as const;
export type FollowerId = typeof FOLLOWER_IDS[number];

export enum FollowerCategory {
    General,
    Special,
    DLC,
    Darkwood,
    Anura,
    Anchordeep,
    SilkCradle
}

export const FOLLOWER_CATEGORIES = ["General", "DLC", "Special", "Darkwood", "Anura", "Anchordeep", "Silk Cradle"] as const;
export const FOLLOWER_CATEGORY_LENGTH = FOLLOWER_CATEGORIES.length;

export type FollowerCategoryName = typeof FOLLOWER_CATEGORIES[number];

export type ClothingDataJSON = Record<ClothingId, ClothingData>;
export interface ClothingData {
    name: string;
    category: ClothingCategory;

    variants: string[];
    sets?: ColorSet[];

    attachments?: string[];
}

export const CLOTHING_IDS: (keyof typeof followerData.clothing | ClothingIdExtras)[] = ["Default_Clothing", "Normal9_Clothing", "Normal8_Clothing", "Normal7_Clothing", "Normal6_Clothing", "Normal5_Clothing", "Normal4_Clothing", "Normal3_Clothing", "Normal2_Clothing", "Normal1_Clothing", "Normal12_Clothing", "Normal11_Clothing", "Normal10_Clothing", "Naked_Clothing", "Rags", "Missionary", "Undertaker", "Holiday", "Old", "Baby", "Torn", "Warrior_Clothing", "Special_7_Clothing", "Special_6_Clothing", "Special_5_Clothing", "Special_4_Clothing", "Special_3_Clothing", "Special_2_Clothing", "Special_1_Clothing", "Fancy_Suit_Clothing", "Fancy_Clothing", "Baal_Robes", "Aym_Robes", "Sozo_Backpack", "Heretic_DLC_Clothing", "Heretic_DLC_Clothing2", "DLC_6", "DLC_5", "DLC_4", "DLC_3", "DLC_2", "DLC_1", "Cultist_DLC_Clothing", "Cultist_DLC_Clothing2", "Pilgrim_DLC_Clothing", "Pilgrim_DLC_Clothing2"];
export type ClothingId = typeof CLOTHING_IDS[number];

export const CLOTHING_ID_EXTRAS = ["Rags", "Old", "Baby", "Torn", "Missionary", "Undertaker", "Holiday", "Baal_Robes", "Aym_Robes", "Sozo_Backpack"] as const;
export type ClothingIdExtras = typeof CLOTHING_ID_EXTRAS[number];

export enum ClothingCategory {
    General,
    Special,
    DLC
}

export const CLOTHING_CATEGORIES = ["General", "Special", "DLC"] as const;
export const CLOTHING_CATEGORY_LENGTH: number = Object.keys(ClothingCategory).length / 2;

export type ClothingCategoryName = typeof CLOTHING_CATEGORIES[number];

export type NecklaceDataJSON = Record<NecklaceId, NecklaceData>;
export interface NecklaceData {
    name: string;
    category: NecklaceCategory;

    variant: string;
}

export const NECKLACE_IDS = ["Flower", "Feather", "Skull", "Nature", "Moon", "Missionary", "Loyalty", "Demonic", "Gold_Skull", "Bell", "Light", "Dark"] as const;
export type NecklaceId = typeof NECKLACE_IDS[number];

export enum NecklaceCategory {
    Crusade,
    Mythic,
    Special
}

export const NECKLACE_CATEGORIES = ["Crusade", "Mythic", "Special"] as const;
export const NECKLACE_CATEGORY_LENGTH: number = Object.keys(NecklaceCategory).length / 2;

export type NecklaceCategoryName = typeof NECKLACE_CATEGORIES[number];

export type HatDataJSON = Record<HatId, HatData>;
export interface HatData {
    name: string;
    variant: string;
}

export const HATS_ID = ["Bartender", "Chef", "Tax_Enforcer", "Faith_Enforcer", "Farmer", "Lumberjack", "Miner", "Nudist", "Refiner"] as const;
export type HatId = typeof HATS_ID[number];

export type ColorSet = ColorSetItem[];
export interface ColorSetItem {
    color: ColorObject;
    slots: string[];
}

let tempArr: any[];

tempArr = Array(FOLLOWER_CATEGORY_LENGTH);
for (const id of FOLLOWER_IDS) {
    const { category = 0 } = followerData.forms[id] ?? {};
    tempArr[category] ? tempArr[category].push(id) : tempArr[category] = [id];
}

const followerIdsByCategory = <Record<FollowerCategoryName, FollowerId[]>>{};
for (const [i, ids] of tempArr.entries()) followerIdsByCategory[FOLLOWER_CATEGORIES[i]] = ids;

tempArr = Array(CLOTHING_CATEGORY_LENGTH);
for (const id of CLOTHING_IDS) {
    const { category = 0 } = followerData.clothing[id] ?? {};
    tempArr[category] ? tempArr[category].push(id) : tempArr[category] = [id];
}

const clothingIdsByCategory = <Record<ClothingCategoryName, ClothingId[]>>{};
for (const [i, ids] of tempArr.entries()) clothingIdsByCategory[CLOTHING_CATEGORIES[i]] = ids;

tempArr = Array(NECKLACE_CATEGORY_LENGTH);
for (const id of NECKLACE_IDS) {
    const { category = 0 } = followerData.necklaces[id] ?? {};
    tempArr[category] ? tempArr[category].push(id) : tempArr[category] = [id];
}

const necklaceIdsByCategory = <Record<NecklaceCategoryName, NecklaceId[]>>{};
for (const [i, ids] of tempArr.entries()) necklaceIdsByCategory[NECKLACE_CATEGORIES[i]] = ids;

export { followerIdsByCategory, clothingIdsByCategory, necklaceIdsByCategory };