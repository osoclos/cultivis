<script lang="ts" module>
    export const OCCULTIST_MENU_NAME: string = "occultist";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { Grid, SpritesheetImage } from "../../utils";

    import { occultistData } from "../../../data/files";
    import { OCCULTIST_IDS, type OccultistId } from "../../../data/types";

    import { Occultist, type OccultistObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";

    interface Props {
        occultist: Occultist;
        obj: OccultistObject;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
    }

    let {
        occultist,
        obj,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {}
    }: Props = $props();

    function updateOccultist(id: OccultistId) {
        occultist.occultist = id;
        obj.occultist = id;

        update();
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Occultist" />

    <Grid class="mx-1" label="List of Occultists" minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        <BoxOption label="Select Random Occultist" hideBackground onclick={() => updateOccultist(Random.item(OCCULTIST_IDS))}>
            <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
        </BoxOption>

        {#each Object.entries(occultistData) as [id, { name }], i (id) }
            <BoxOption label={name} selected={id === obj.occultist} onclick={() => updateOccultist(id as OccultistId)}>
                <SpritesheetImage src="/static/assets/characters/occultists.png" label={name} class="m-1" x={i} y={0} tileWidth={64} tileHeight={64} width={56} height={56} />
            </BoxOption>
        {/each}
    </Grid>
</div>