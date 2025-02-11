<script lang="ts" module>
    export const TOWW_MENU_NAME: string = "toww";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { Grid, SpritesheetImage } from "../../utils";

    import { towwData } from "../../../data/files";
    import { TOWW_IDS, type TOWW_Id } from "../../../data/types";

    import { Factory } from "../../../scripts";
    import type { TOWW, TOWW_Object } from "../../../scripts/characters";

    import { Random } from "../../../utils";
    
    interface Props {
        obj: TOWW_Object;
        factory: Factory;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
        onchange?: (toww: TOWW) => void;
    }

    let {
        obj = $bindable(),
        factory,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},
        onchange: change = () => {}
    }: Props = $props();

    async function updateTOWW(form: TOWW_Id) {
        const { id, label } = obj;

        if (!factory.hasLoadedTOWW(form)) await factory.loadTOWW(form);
        const toww = factory.TOWW(form, id, label);

        obj.form = form;
        toww.copyFromObj(obj);

        const { attributes, animation } = towwData[form];

        obj.animation = animation;
        toww.setAnimation(animation);

        const {
            hasCrown = null,
            hasChains = null,
            
            eyeState = null,
            isInjured = null
        } = attributes;
        
        toww.hasCrown = hasCrown;
        toww.hasChains = hasChains;

        toww.eyeState = eyeState;
        toww.isInjured = isInjured;

        update();
        change(toww);
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Form" />

    <Grid class="mx-1" label="List of Forms" minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        <BoxOption label="Select Random Form" hideBackground onclick={() => updateTOWW(Random.item(TOWW_IDS))}>
            <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
        </BoxOption>

        {#each Object.entries(towwData) as [id, { name }], i (id) }
            <BoxOption label={name} selected={id === obj.form} onclick={() => updateTOWW(id as TOWW_Id)}>
                <SpritesheetImage src="/static/assets/toww.png" label={name} class="m-1" x={i} y={0} tileWidth={64} tileHeight={64} width={56} height={56} />
            </BoxOption>
        {/each}
    </Grid>
</div>