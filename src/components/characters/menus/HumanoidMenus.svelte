<script lang="ts" module>
    export const HUMANOID_MENU_NAME: string = "humanoid";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { Grid, SpritesheetImage } from "../../utils";

    import { humanoidData } from "../../../data/files";
    import { HUMANOID_IDS, type HumanoidId } from "../../../data/types";

    import type { Humanoid, HumanoidObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";

    interface Props {
        humanoid: Humanoid;
        obj: HumanoidObject;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
    }

    let {
        humanoid,
        obj,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {}
    }: Props = $props();

    function updateHumanoid(id: HumanoidId) {
        humanoid.humanoid = id;
        obj.humanoid = id;

        update();
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Humanoid" />

    <Grid class="mx-1" label="List of Humanoids" minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        <BoxOption label="Select Random Humanoid" hideBackground onclick={() => updateHumanoid(Random.item(HUMANOID_IDS))}>
            <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
        </BoxOption>

        {#each Object.entries(humanoidData) as [id, { name }], i (id) }
            <BoxOption label={name} selected={id === obj.humanoid} onclick={() => updateHumanoid(id as HumanoidId)}>
                <SpritesheetImage src="/static/assets/humanoids.png" label={name} class="m-1" x={i} y={0} tileWidth={64} tileHeight={64} width={56} height={56} />
            </BoxOption>
        {/each}
    </Grid>
</div>