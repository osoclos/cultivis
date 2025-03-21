<script lang="ts" module>
    export const HERETIC_MENU_NAME: string = "heretic";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { MultiGrid, SpritesheetImage } from "../../utils";

    import { hereticData } from "../../../data/files";
    import { hereticIdsByCategory, type HereticCategoryName, type HereticData, type HereticId } from "../../../data/types";

    import { Factory } from "../../../scripts";
    import { Heretic, type HereticObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";
    
    interface Props {
        obj: HereticObject;
        factory: Factory;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
        onchange?: (heretic: Heretic) => void;
    }

    let {
        obj = $bindable(),
        factory,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},
        onchange: change = () => {}
    }: Props = $props();

    async function updateHeretic(hereticId: HereticId) {
        const { id, label } = obj;

        if (!factory.hasLoadedHeretic(hereticId)) await factory.loadHeretic(hereticId);
        const heretic = factory.heretic(hereticId, id, label);

        obj.heretic = hereticId;
        heretic.copyFromObj(obj);

        const { animation } = hereticData[hereticId];

        heretic.setRawAnimation(animation);
        obj.animation = heretic.animation;

        update();
        change(heretic);
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Heretic" />

    <MultiGrid gridClass="mx-1" titles={Object.keys(hereticIdsByCategory)} minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        {#snippet children(category, y)}
            <BoxOption label="Select Random Heretic" hideBackground onclick={() => updateHeretic(Random.item(hereticIdsByCategory[category as HereticCategoryName]))}>
                <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
            </BoxOption>

            {#each Object.values(hereticIdsByCategory)[y].map<[HereticId, HereticData]>((id) => [id, hereticData[id]]) as [id, { name }], x (id) }
                <BoxOption label={name} selected={id === obj.heretic} onclick={() => updateHeretic(id as HereticId)}>
                    <SpritesheetImage src="/static/assets/characters/heretics.png" label={name} class="m-1" {x} {y} tileWidth={64} tileHeight={64} width={56} height={56} />
                </BoxOption>
            {/each}
        {/snippet}
    </MultiGrid>
</div>