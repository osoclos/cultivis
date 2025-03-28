<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { Color, type ColorObject } from "../../utils";

    interface Props {
        color: ColorObject;
        label?: string;

        width?: number;
        height?: number;

        class?: string;
    }

    const {
        color = $bindable(),
        label = `Color #${Color.fromObj(color).toHex()}`,
        
        width = 40,
        height = 40,
        
        class: className
    }: Props = $props();
</script>

<div class={twMerge("rounded-full border-2", Color.objToArr(color).slice(0, 3).reduce((sum, val) => sum + val) / 3 < 0x1f ? "border-[#ffffff0a]" : "border-[#00000030]", className)} aria-label={label} style:width="{width}px" style:height="{height}px" style:background-color={Color.fromObj(color).toCSS_Str()}></div>