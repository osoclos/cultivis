<script lang="ts" module>
    export const MINI_BOSS_MENU_NAME: string = "mini-boss";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { MultiGrid, SpritesheetImage } from "../../utils";

    import { miniBossData } from "../../../data/files";
    import { miniBossIdsByCategory, type MiniBossCategoryName, type MiniBossData, type MiniBossId } from "../../../data/types";

    import { Factory } from "../../../scripts";
    import type { MiniBoss, MiniBossObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";
    
    interface Props {
        obj: MiniBossObject;
        factory: Factory;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
        onchange?: (miniboss: MiniBoss) => void;
    }

    let {
        obj = $bindable(),
        factory,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},
        onchange: change = () => {}
    }: Props = $props();

    async function updateMiniBoss(miniBossId: MiniBossId) {
        const { id, label, isUpgraded } = obj;

        if (!factory.hasLoadedMiniBoss(miniBossId)) await factory.loadMiniBoss(miniBossId);
        const miniBoss = factory.miniBoss(miniBossId, isUpgraded, id, label);

        obj.miniBoss = miniBossId;
        miniBoss.copyFromObj(obj);

        const { animation } = miniBossData[miniBossId];

        obj.animation = animation;
        miniBoss.setAnimation(animation);

        update();
        change(miniBoss);
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Mini Boss" />

    <MultiGrid gridClass="mx-1" titles={Object.keys(miniBossIdsByCategory)} minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        {#snippet children(category, y)}
            <BoxOption label="Select Random Mini Boss" hideBackground onclick={() => updateMiniBoss(Random.item(miniBossIdsByCategory[category as MiniBossCategoryName]))}>
                <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
            </BoxOption>

            {#each Object.values(miniBossIdsByCategory)[y].map<[MiniBossId, MiniBossData]>((id) => [id, miniBossData[id]]) as [id, { name }], x (id) }
                <BoxOption label={name} selected={id === obj.miniBoss} onclick={() => updateMiniBoss(id as MiniBossId)}>
                    <SpritesheetImage src="/static/assets/characters/mini-bosses.png" label={name} class="m-1" {x} {y} tileWidth={64} tileHeight={64} width={56} height={56} />
                </BoxOption>
            {/each}
        {/snippet}
    </MultiGrid>
</div>