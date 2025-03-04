<script lang="ts" module>
    export const SOLDIER_MENU_NAME: string = "soldier";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { Grid, SpritesheetImage } from "../../utils";

    import { soldierData } from "../../../data/files";
    import { SOLDIER_IDS, type SoldierId } from "../../../data/types";

    import type { Soldier, SoldierObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";

    interface Props {
        soldier: Soldier;
        obj: SoldierObject;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
    }

    let {
        soldier,
        obj,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {}
    }: Props = $props();

    function updateSoldier(id: SoldierId) {
        soldier.soldier = id;
        obj.soldier = id;

        update();
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Soldier" />

    <Grid class="mx-1" label="List of Soldiers" minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        <BoxOption label="Select Random Soldier" hideBackground onclick={() => updateSoldier(Random.item(SOLDIER_IDS))}>
            <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
        </BoxOption>

        {#each Object.entries(soldierData) as [id, { name }], i (id) }
            <BoxOption label={name} selected={id === obj.soldier} onclick={() => updateSoldier(id as SoldierId)}>
                <SpritesheetImage src="/static/assets/soldiers.png" label={name} class="m-1" x={i} y={0} tileWidth={64} tileHeight={64} width={56} height={56} />
            </BoxOption>
        {/each}
    </Grid>
</div>