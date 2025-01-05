<script lang="ts">
    import { Label, LabelTitle, NumberInput, Toggle } from "../base";
    import type { VectorObject } from "../../utils";

    interface Options {
        size: VectorObject;

        fitScene: boolean;
        cropScene: boolean;
    }

    interface Props extends Options { oninput?: (options: Options) => void; }

    let {
        size = $bindable(),

        fitScene = $bindable(),
        cropScene = $bindable(),

        oninput: input = () => {}
    }: Props = $props();

    function oninput() {
        input({ size, fitScene, cropScene });
    }
</script>

<div class="flex flex-col items-center gap-6 mx-8">
    <LabelTitle title="Size" />

    <div class="flex flex-col gap-2 w-80 sm:w-90">
        {#if !cropScene}
            <Label label="Width">
                <NumberInput label="Width" bind:value={size.x} unit="px" max={Infinity} {oninput} />
            </Label>
            
            <Label label="Height">
                <NumberInput label="Height" bind:value={size.y} unit="px" max={Infinity} {oninput} />
            </Label>
        {/if}

        <Label class="my-3" label="Fit Scene">
            <Toggle label="Fit Scene" bind:enabled={fitScene} {oninput} />
        </Label>

        <Label class="my-3" label="Crop Scene">
            <Toggle label="Crop Scene" bind:enabled={cropScene} {oninput} />
        </Label>
    </div>
</div>