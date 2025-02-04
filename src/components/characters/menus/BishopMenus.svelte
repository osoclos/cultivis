<script lang="ts" module>
    export const BISHOP_MENU_NAME: string = "bishop";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { Grid, SpritesheetImage } from "../../utils";

    import { bishopData } from "../../../data/files";
    import { BISHOP_IDS, type BishopId } from "../../../data/types";

    import { Factory } from "../../../scripts";
    import type { Bishop, BishopObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";
    
    interface Props {
        obj: BishopObject;
        factory: Factory;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
        onchange?: (bishop: Bishop) => void;
    }

    let {
        obj = $bindable(),
        factory,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},
        onchange: change = () => {}
    }: Props = $props();

    async function updateBishop(bishopId: BishopId) {
        const { id, label, isBoss } = obj;

        if (!factory.hasLoadedBishop(bishopId, isBoss)) await factory.loadBishop(bishopId, isBoss);
        const bishop = factory.bishop(bishopId, isBoss, id, label);

        obj.bishop = bishopId;
        bishop.copyFromObj(obj);

        const { animation, bossAnimation = animation } = bishopData[bishopId];

        obj.animation = isBoss ? bossAnimation : animation;
        bishop.setAnimation(isBoss ? bossAnimation : animation);

        update();
        change(bishop);
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Bishop" />

    <Grid class="mx-1" minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        <BoxOption label="Select Random Bishop" hideBackground onclick={() => updateBishop(Random.item(BISHOP_IDS))}>
            <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
        </BoxOption>

        {#each Object.entries(bishopData) as [id, { name }], i (id) }
            <BoxOption label={name} selected={id === obj.bishop} onclick={() => updateBishop(id as BishopId)}>
                <SpritesheetImage src="/static/assets/crowns.png" label={name} class="m-1" x={i} y={0} tileWidth={200} tileHeight={200} width={56} height={56} />
            </BoxOption>
        {/each}
    </Grid>
</div>