<script lang="ts">
    import { twMerge } from "tailwind-merge";
    interface Props {
        label: string;

        src: string;
        srcset?: string[];

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
        srcset = [],
        
        x,
        y,
        
        tileWidth,
        tileHeight,
        
        width = tileWidth,
        height = tileHeight,

        class: className
    }: Props = $props();
</script>

<div class={twMerge("origin-top-left", className)} style:margin-right="{width - tileWidth}px" style:margin-bottom="{height - tileHeight}px" style:width="{tileWidth}px" style:height="{tileHeight}px" style:background-position="-{x * tileWidth}px -{y * tileHeight}px" style:background-image={srcset.length ? `image-set(${srcset.map((src) => `url("${src}") type("image/${src.slice(src.lastIndexOf(".") + 1)}")`).join(", ")})` : `url("${src}")`} style:transform="scale({width / tileWidth}, {height / tileHeight})" role="img" aria-label={label}></div>