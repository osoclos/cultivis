<script lang="ts">
    import { twMerge } from "tailwind-merge";
    interface Props {
        label: string;
        src: string;

        x: number;
        y: number;

        width?: number;
        height?: number;
        
        tileWidth: number;
        tileHeight: number;

        class?: string;
    }

    const {
        label,
        src,
        
        x,
        y,
        
        tileWidth,
        tileHeight,
        
        width = tileWidth,
        height = tileHeight,

        class: className
    }: Props = $props();
</script>

<div class={twMerge("origin-top-left", className)} style:width="{tileWidth}px" style:height="{tileHeight}px" style:background-position="-{x * tileWidth}px -{y * tileHeight}px" style:background-image="url('{src}')" style:transform="scale({width / tileWidth}, {height / tileHeight})" aria-label={label}></div>