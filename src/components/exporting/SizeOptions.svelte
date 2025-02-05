<script lang="ts">
    import { Label, LabelTitle, Notice, NumberInput, Toggle } from "../base";
    import type { VectorObject } from "../../utils";

    interface Options {
        size: VectorObject;
        lockAspectRatio: boolean;

        fitScene: boolean;
        cropScene: boolean;
    }

    interface Props extends Options { oninput?: (options: Options) => void; }

    let {
        size = $bindable(),
        lockAspectRatio = $bindable(),

        fitScene = $bindable(),
        cropScene = $bindable(),

        oninput: input = () => {}
    }: Props = $props();

    function oninput() {
        input({ size, lockAspectRatio, fitScene, cropScene });
    }
</script>

<div class="flex flex-col gap-6 items-center mx-8">
    <LabelTitle title="Size" />

    <div class="flex flex-col gap-8 w-80 sm:w-90">
        {#if !cropScene}
            <Label label="Width">
                <NumberInput label="Width" bind:value={size.x} unit="px" max={Infinity} {oninput} />
            </Label>
            
            <Label class="-mt-6" label="Height">
                <NumberInput label="Height" bind:value={size.y} unit="px" max={Infinity} {oninput} />
            </Label>

            {#if size.x * size.y > 600_000}
                <Notice label="Your device may not be able to handle exports with such a large size. Note that you may crash your browser and lose your scene if you attempt to do so." />
            {/if}

            <Label label="Lock Aspect Ratio">
                <Toggle label="Lock Aspect Ratio" bind:enabled={lockAspectRatio} {oninput} />
            </Label>
        {/if}

        <Label label="Fit Scene">
            <Toggle label="Fit Scene" bind:enabled={fitScene} {oninput} />
        </Label>

        <Label label="Crop Scene">
            <Toggle label="Crop Scene" bind:enabled={cropScene} {oninput} />
        </Label>

        {#if size.x * size.y > 600_000 && cropScene}
            <Notice label="Your device may not be able to handle exports with such a large size. Note that you may crash your browser and lose your scene if you attempt to do so." />
        {/if}
    </div>
</div>