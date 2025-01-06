<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        percent?: number;
        label: string;

        holeRadius?: number;

        class?: string;
    }

    const {
        percent = 0.0,
        label,

        holeRadius = 20,

        class: className,
    }: Props = $props();
</script>

<div class={twMerge("aspect-square grid place-items-center w-8 rounded-full", className)} style:background-image="conic-gradient(#f32002, #f32002 {percent * 100}%, #0a0a0a {percent * 100}%, #0a0a0a)" role="progressbar" aria-label={label}>
    <div class="aspect-square bg-black rounded-full" style:width="{holeRadius}px"></div>
</div>