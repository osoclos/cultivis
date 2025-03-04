<script lang="ts" module>
    
</script>

<script lang="ts">
    import { Label, Notice, NumberInput, Toggle } from "../base";
    import { isDataAPNG_Data, isDataGIF_Data, type FormatData, type FormatId } from "../../scripts";

    interface Props {
        format: FormatId;
        data: FormatData;
    }

    const { format = $bindable(), data }: Props = $props();
</script>

<div class="flex flex-col gap-8 items-center">
    {#if format === "gif" && isDataGIF_Data(data)}
        <Label label="Delay Per Frame">
            <NumberInput label="Delay Per Frame" bind:value={data.delay} unit="ms" min={10} max={1000} />
        </Label>

        <Label label="Use Accurate Colors">
            <Toggle label="Use Accurate Colors" bind:enabled={data.useAccurateColors} />
        </Label>

        <div class="flex flex-col gap-2 text-sm">
            {#if data.delay < 15}
                <Notice label="Some viewers will not display the scene at such a low refresh delay. Make sure that your viewer is compatible with high-framerate animations." />
            {/if}
            {#if data.useAccurateColors}
                <Notice label="Some mobile devices/low-end computers may not be able to handle exporting .GIF files with accurate colors. Consider switching to a more powerful device or exporting in the .APNG format." />
            {/if}
        </div>
        
    {:else if format === "apng" && isDataAPNG_Data(data)}
        <Label label="Delay Per Frame">
            <NumberInput label="Delay Per Frame" bind:value={data.delay} unit="ms" max={Infinity} />
        </Label>
    {/if}
</div>