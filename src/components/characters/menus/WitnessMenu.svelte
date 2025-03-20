<script lang="ts" module>
    export const WITNESS_MENU_NAME: string = "witness";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { Grid, SpritesheetImage } from "../../utils";

    import { witnessData } from "../../../data/files";
    import { WITNESS_IDS, type WitnessId } from "../../../data/types";

    import { Witness, type WitnessObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";

    interface Props {
        witness: Witness;
        obj: WitnessObject;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
    }

    let {
        witness,
        obj,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {}
    }: Props = $props();

    function updateWitness(id: WitnessId) {
        witness.witness = id;
        obj.witness = id;

        update();
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Witness" />

    <Grid class="mx-1" label="List of Witnesses" minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        <BoxOption label="Select Random Witness" hideBackground onclick={() => updateWitness(Random.item(WITNESS_IDS))}>
            <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
        </BoxOption>

        {#each Object.entries(witnessData) as [id, { name }], i (id) }
            <BoxOption label={name} selected={id === obj.witness} onclick={() => updateWitness(id as WitnessId)}>
                <SpritesheetImage src="/static/assets/characters/witnesses.png" label={name} class="m-1" x={i} y={0} tileWidth={64} tileHeight={64} width={56} height={56} />
            </BoxOption>
        {/each}
    </Grid>
</div>