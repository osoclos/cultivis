<script lang="ts">
    import { Label, Notice, NumberInput, Toggle } from "../base";
    import { type FormatData } from "../../scripts";

    interface Props { data: FormatData; }
    const { data }: Props = $props();
</script>

<div class="flex flex-col gap-8 items-center">
    <Label label="Delay Per Frame">
        <NumberInput label="Delay Per Frame" bind:value={data.delayMs} unit="ms" min={10} max={1000} />
    </Label>

    {#if data.type === "GIF"}
        <Label label="Use Accurate Colors">
            <Toggle label="Use Accurate Colors" bind:enabled={data.useAccurateColors} />
        </Label>

        <div class="flex flex-col gap-2 text-sm">
            {#if data.delayMs < 15}
                <Notice label="Some viewers will not display the scene at such a low refresh rate. Make sure that your viewer is compatible with high-framerate animations." />
            {/if}
            {#if data.useAccurateColors}
                <Notice label="Some mobile devices/low-end computers may not be able to handle exporting .GIF files with accurate colors. Consider switching to a more powerful device or exporting in the .APNG format." />
            {/if}
        </div>
    {:else if data.type === "APNG"}
        <Label label="Perform Optimisation">
            <Toggle label="Perform Optimisation" bind:enabled={data.performOptimisation} />
        </Label>

        {#if data.delayMs > 1000 / 60}
            <Notice label="Some viewers will not display the scene at such a high framerate. Make sure that your viewer is compatible with high-framerate animations." />
        {/if}
        {#if data.performOptimisation}
            <Notice label="Exporting with optimisation will take longer but will result in a smaller file size. Use this with caution as it may reload the website." />
        {/if}
    {/if}
</div>
