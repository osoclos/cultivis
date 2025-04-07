<script lang="ts" module>
    export const SHOPKEEPER_MENU_NAME: string = "shopkeeper";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { MultiGrid, SpritesheetImage } from "../../utils";

    import { shopkeeperData } from "../../../data/files";
    import { shopkeeperIdsByCategory, type ShopkeeperCategoryName, type ShopkeeperData, type ShopkeeperId } from "../../../data/types";

    import { Factory } from "../../../scripts";
    import { Shopkeeper, type ShopkeeperObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";
    
    interface Props {
        obj: ShopkeeperObject;
        factory: Factory;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
        onchange?: (shopkeeper: Shopkeeper) => void;
    }

    let {
        obj = $bindable(),
        factory,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},
        onchange: change = () => {}
    }: Props = $props();

    async function updateShopkeeper(shopkeeperId: ShopkeeperId) {
        const { id, label } = obj;

        if (!factory.hasLoadedShopkeeper(shopkeeperId)) await factory.loadShopkeeper(shopkeeperId);
        const shopkeeper = factory.shopkeeper(shopkeeperId, id, label);

        obj.shopkeeper = shopkeeperId;
        shopkeeper.copyFromObj(obj);

        const { animation } = shopkeeperData[shopkeeperId];

        shopkeeper.setRawAnimation(animation);
        obj.animation = shopkeeper.animation;

        update();
        change(shopkeeper);
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Giver" />

    <MultiGrid gridClass="mx-1" titles={Object.keys(shopkeeperIdsByCategory)} minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        {#snippet children(category, y)}
            <BoxOption label="Select Random Mini Boss" hideBackground onclick={() => updateShopkeeper(Random.item(shopkeeperIdsByCategory[category as ShopkeeperCategoryName]))}>
                <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
            </BoxOption>

            {#each Object.values(shopkeeperIdsByCategory)[y].map<[ShopkeeperId, ShopkeeperData]>((id) => [id, shopkeeperData[id]]) as [id, { name }], x (id) }
                <BoxOption label={name} selected={id === obj.shopkeeper} onclick={() => updateShopkeeper(id as ShopkeeperId)}>
                    <SpritesheetImage src="/static/assets/characters/shopkeepers.png" label={name} class="m-1" {x} {y} tileWidth={64} tileHeight={64} width={56} height={56} />
                </BoxOption>
            {/each}
        {/snippet}
    </MultiGrid>
</div>