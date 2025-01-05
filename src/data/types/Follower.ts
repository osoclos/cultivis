import type { ColorSet } from "./ColorSet";
import followerMetadata from "../follower-metadata.json";

export type FollowerMetadataJSON = Record<FollowerId, FollowerMetadata>;
export interface FollowerMetadata {
    name: string;
    category: FollowerCategory;
    attributes?: FollowerAttributes;

    variants: string[];
}

export type FollowerExtrasJSON = Partial<Record<FollowerId, Partial<FollowerExtras>>>;
export interface FollowerExtras {
    name: string;
    category: FollowerCategory;

    variants: string[];
}

export type FollowerFormMetadata = Record<string, Omit<FollowerForm, "id">>;
export interface FollowerForm {
    id: string;
    category: FollowerCategory;
    attributes?: FollowerAttributes;

    variants: string[];
    sets: ColorSet[];
}

export interface FollowerAttributes {
    isUnique: boolean;

    hasSpecialEvents: boolean;
    mustBeDiscovered: boolean;
}

export const FOLLOWER_IDS: (keyof typeof followerMetadata)[] = ["Deer", "Pig", "Dog", "Cat", "Fox", "Night Wolf", "Fish", "Pangolin", "Shrew", "Unicorn", "Axolotl", "Starfish", "Red Panda", "Poop", "Massive Monster", "Crab", "Snail", "Owl", "Butterfly", "Koala", "Shrimp", "Snake", "Worm", "Mushroom", "Bee", "Tapir", "Turtle", "Monkey", "Narwal", "Moose", "Gorilla", "Mosquito", "Goldfish", "Possum", "Hammerhead", "Llama", "Tiger", "Sphynx", "LadyBug", "TwitchMouse", "TwitchCat", "TwitchDog", "TwitchDogAlt", "TwitchPoggers", "Lion", "Penguin", "Pelican", "Kiwi", "DogTeddy", "Camel", "Anteater", "Skunk", "Panda", "Enchida", "Boss Death Cat", "CultLeader 1", "CultLeader 2", "CultLeader 3", "CultLeader 4", "Baal", "Aym", "Sozo", "Jalala", "Rinor", "Abomination", "Seal", "Lemur", "Caterpillar", "Webber", "Volvy", "StarBunny", "Crow", "BatDemon", "DeerSkull", "Cthulhu", "DeerRitual", "Poppy", "Cow", "Horse", "Hedgehog", "Rabbit", "Chicken", "Squirrel", "Boss Mama Worm", "Boss Mama Maggot", "Boss Burrow Worm", "Boss Beholder 1", "Giraffe", "Bison", "Frog", "Capybara", "Fennec Fox", "Rhino", "Eagle", "Boss Flying Burp Frog", "Boss Egg Hopper", "Boss Mortar Hopper", "Boss Beholder 2", "Crocodile", "Elephant", "Hippo", "Otter", "Seahorse", "Duck", "Boss Spiker", "Boss Charger", "Boss Scuttle Turret", "Boss Beholder 3", "Racoon", "Bear", "Bat", "Beetle", "Badger", "Boss Spider Jump", "Boss Millipede Poisoner", "Boss Scorpion", "Boss Beholder 4"] as const;
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
export const followerIdsByCategory = Object.fromEntries(FOLLOWER_CATEGORIES.map<[FollowerCategoryName, FollowerId[]]>((name, i) => [name, FOLLOWER_IDS.map<[FollowerId, FollowerCategory]>((id) => [id, followerMetadata[id].category]).filter(([_, category]) => category === i).map(([id]) => id)])) as Record<FollowerCategoryName, FollowerId[]>;