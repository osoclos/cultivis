<script lang="ts" module>
    export interface GIF_Data extends FormatData {
        type: "gif";
        hasAccurateColors: boolean;
    }

    export interface APNG_Data extends FormatData { type: "apng"; }
    export interface FormatData {
        type: FormatId;
        delay: number;
    }

    export function isDataGIF_Data(data: FormatData): data is GIF_Data {
        return data.type === "gif";
    }

    export function isDataAPNG_Data(data: FormatData): data is APNG_Data {
        return data.type === "apng";
    }

    export const FORMAT_IDS = ["gif", "apng"] as const; // TODO: add webp/true-color gifs when possible
    export type FormatId = typeof FORMAT_IDS[number];

    export function isStrFormatId(str: string): str is FormatId {
        return FORMAT_IDS.includes(str as FormatId);
    }
</script>

<script lang="ts">
  import { Label, Notice, NumberInput, Toggle } from "../base";

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

        <Label label="Has Accurate Colors">
            <Toggle label="Has Accurate Colors" bind:enabled={data.hasAccurateColors} />
        </Label>

        <div class="flex flex-col gap-2 text-sm">
            {#if data.delay < 15}
                <Notice label="Some viewers will not display the scene at such a low refresh delay. Make sure that your viewer is compatible with high-framerate animations." />
            {/if}
            {#if data.hasAccurateColors}
                <Notice label="Some mobile devices/low-end computers may not be able to handle exporting .GIF files with accurate colors. Consider switching to a more powerful device or exporting in the .APNG format." />
            {/if}
        </div>
        
    {:else if format === "apng" && isDataAPNG_Data(data)}
        <Label label="Delay Per Frame">
            <NumberInput label="Delay Per Frame" bind:value={data.delay} unit="ms" max={Infinity} />
        </Label>
    {/if}
</div>