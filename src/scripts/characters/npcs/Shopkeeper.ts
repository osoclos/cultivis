import { shopkeeperData } from "../../../data/files";
import type { ShopkeeperId } from "../../../data/types";

import { MoreMath } from "../../../utils";

import { Actor, type ActorObject } from "../../Actor";

const TYPE: string = "shopkeeper";

export class Shopkeeper extends Actor implements ShopkeeperObject {
    #stage: number;
    constructor(skeletonData: spine.SkeletonData, atlas: spine.TextureAtlas, id?: string, label: string = shopkeeperData.Rakshasa.name, readonly shopkeeper: ShopkeeperId = "Rakshasa") {
        super(skeletonData, atlas, id, label);
        this.#stage = 0;
        
        this.update();
    }

    get stage(): number {
        return this.#stage;
    }

    set stage(stage: number) {
        const { shopkeeper } = this;
        const { skins } = shopkeeperData[shopkeeper];

        this.#stage = MoreMath.clamp(stage, 0, skins.length - 1);
        this.update();
    }

    clone(id?: string, label?: string) {
        const { skeleton, atlas, shopkeeper } = this;

        const questGiver = new Shopkeeper(skeleton.data, atlas, id, label, shopkeeper);
        questGiver.copyFromObj(this.toObj());

        return questGiver;
    }

    update() {
        const { shopkeeper, stage } = this;
        const { skins } = shopkeeperData[shopkeeper];

        this.setSkin(skins[stage]);
        this.tick();
    }

    copyFromObj(obj: ShopkeeperObject) {
        const { stage } = obj;
        this.stage = stage;

        super.copyFromObj(obj);
    }

    toObj(): ShopkeeperObject {
        const { shopkeeper, stage } = this;
        return { ...super.toObj(), type: TYPE, shopkeeper, stage };
    }
}

export interface ShopkeeperObject extends ActorObject {
    shopkeeper: ShopkeeperId;
    stage: number;
}

export function isShopkeeperObj(obj: ActorObject): obj is ShopkeeperObject {
    return obj instanceof Shopkeeper || obj.type === TYPE;
}