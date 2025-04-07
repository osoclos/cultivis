import type { Sources } from "../../Globals";
import shopkeeperData from "../../../files/characters/npcs/shopkeeper-data.json";

export type ShopkeeperDataJSON = Record<ShopkeeperId, ShopkeeperData>;
export interface ShopkeeperData {
    name: string;
    category: ShopkeeperCategory;

    src: Sources;

    skins: string[];
    animation: string;
}

export const SHOPKEEPER_IDS: (keyof typeof shopkeeperData)[] = ["Rakshasa", "Forneus", "Helob", "Fox", "Ratoo", "Berith", "Monch", "Clauneck", "Kudaai", "Chemach", "Haro", "Mystic_Seller", "Rakshasa_Customer", "Rakshasa_Wife", "Berith_Record_Player"] as const;
export type ShopkeeperId = typeof SHOPKEEPER_IDS[number];

export enum ShopkeeperCategory {
    Crusade,
    Birds,
    Miscellaneous
}

export const SHOPKEEPER_CATEGORIES = ["Crusade", "Birds", "Miscellaneous"] as const;
export const SHOPKEEPER_CATEGORY_LENGTH = SHOPKEEPER_CATEGORIES.length;

export type ShopkeeperCategoryName = typeof SHOPKEEPER_CATEGORIES[number];

let tempArr: any[];

tempArr = Array(SHOPKEEPER_CATEGORY_LENGTH);
for (const id of SHOPKEEPER_IDS) {
    const { category = 0 } = shopkeeperData[id] ?? {};
    tempArr[category] ? tempArr[category].push(id) : tempArr[category] = [id];
}

const shopkeeperIdsByCategory = <Record<ShopkeeperCategoryName, ShopkeeperId[]>>{};
for (const [i, ids] of tempArr.entries()) shopkeeperIdsByCategory[SHOPKEEPER_CATEGORIES[i]] = ids;

export { shopkeeperIdsByCategory };