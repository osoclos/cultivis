<script lang="ts" module>
    export const GUARD_MENU_NAME: string = "guard";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { MultiGrid, SpritesheetImage } from "../../utils";

    import { guardData } from "../../../data/files";
    import { guardIdsByCategory, type GuardCategoryName, type GuardData, type GuardId } from "../../../data/types";

    import { Guard, type GuardObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";

    interface Props {
        guard: Guard;
        obj: GuardObject;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
    }

    let {
        guard,
        obj,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {}
    }: Props = $props();

    function updateGuard(id: GuardId) {
        guard.guard = id;
        obj.guard = id;

        update();
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Guard" />

    <MultiGrid gridClass="mx-1" titles={Object.keys(guardIdsByCategory)} minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        {#snippet children(category, y)}
            <BoxOption label="Select Random Guard" hideBackground onclick={() => updateGuard(Random.item(guardIdsByCategory[category as GuardCategoryName]))}>
                <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
            </BoxOption>

            {#each Object.values(guardIdsByCategory)[y].map<[GuardId, GuardData]>((id) => [id, guardData[id]]) as [id, { name }], x (id) }
                <BoxOption label={name} selected={id === obj.guard} onclick={() => updateGuard(id as GuardId)}>
                    <SpritesheetImage src="/static/assets/characters/guards.png" label={name} class="m-1" {x} {y} tileWidth={64} tileHeight={64} width={56} height={56} />
                </BoxOption>
            {/each}
        {/snippet}
    </MultiGrid>
</div>