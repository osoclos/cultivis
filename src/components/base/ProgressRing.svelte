<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        progress?: number;
        label: string;

        radius?: number;
        width?: number;

        rotation?: number;
        showGradient?: boolean;

        class?: string;
    }

    const {
        progress = 0.0,
        label,

        radius = 16,
        width = 6,

        rotation = 0,
        showGradient = false,

        class: className,
    }: Props = $props();
</script>

<div class={twMerge("relative", className)} role="progressbar" aria-label={label} aria-valuenow={progress * 100} aria-valuemin={0} aria-valuemax={100} aria-valuetext="{progress * 100}%">
    <div class="absolute aspect-square rounded-full" style:width="{radius * 2}px" style:background-image="conic-gradient(#f32002, {showGradient ? `${progress > 0.8 ? `#f32002 ${progress * 10}%, #4d0005 ${progress * 25}%, #4d0005 ${progress * 40}%, #f32002 ${progress * 55}%, #4d0005 ${progress * 70}%, #4d0005 ${progress * 85}%, #f32002` : `#f32002 ${progress * 40}%, #4d0005 ${progress * 60}%, #4d0005`}` : "#f32002"} {progress * 100}%, #0a0a0a {progress * 100}%, #0a0a0a)" style:transform="rotate({rotation}deg)"></div>
    <div class="aspect-square bg-dark rounded-full" style:width="{(radius - width) * 2}px" style:transform="translate({width}px, {width}px)"></div>
</div>