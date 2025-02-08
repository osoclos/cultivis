<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { MoreMath } from "../../utils";
  import { onDestroy, onMount } from "svelte";

    interface Props {
        label: string;
        value?: number;
        
        min?: number;
        max?: number;
        step?: number;

        showVal?: boolean;

        displayValues?: string[];
        format?: string;

        class?: string;
        oninput?: (val: number) => void;
    }

    let bar: HTMLDivElement = $state(document.createElement("div"));
    let barWidth: number = $state(0);

    let isPointerDown: boolean = false;
    let {
        label,
        value = $bindable(0),

        min = 0,
        max = 100,
        step = 1,

        showVal = true,

        displayValues = [],
        format = "<val>",
        
        class: className,
        oninput: input = () => {}
    }: Props = $props();

    const resizer = new ResizeObserver(([entry]) => barWidth = entry.contentBoxSize[0].inlineSize);
    onMount(() => resizer.observe(bar));
    onDestroy(() => resizer.disconnect());

    const percent = $derived((value - min) / (max - min));
    function updateValFromPercentage(percentage: number) {
        value = MoreMath.clamp(MoreMath.roundNearest(min + percentage * (max - min), step), min, max);
    }

    function onpointerdown({ pointerId, offsetX }: PointerEvent) {
        isPointerDown = true;
        bar.setPointerCapture(pointerId);

        updateValFromPercentage(offsetX / bar.clientWidth);
        input(value);
    }

    function onpointermove({ offsetX }: PointerEvent) {
        if (!isPointerDown) return;
        
        updateValFromPercentage(offsetX / bar.clientWidth);
        input(value);
    }

    function onpointerup({ pointerId }: PointerEvent) {
        isPointerDown = false;
        bar.releasePointerCapture(pointerId);
    }
</script>

<div class={twMerge("flex flex-row items-center w-80 h-3", className)}>
    <div class="relative w-full" role="slider" aria-label={label} aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} {onpointerdown} {onpointermove} {onpointerup}>
        <div bind:this={bar} class="w-full max-w-56 h-3" style:background-image="linear-gradient(to right, #01d5a2, #01d5a2 {percent * 100}%, #0a0a0a {percent * 100}%, #0a0a0a)"></div>
        <div class="aspect-square absolute top-1/2 w-6 bg-primary rounded-xs border-3 border-secondary -translate-1/2 pointer-events-none" style:left="{percent * barWidth}px"></div>
    </div>

    {#if showVal}
        <p class="w-24 font-subtitle tracking-widest text-end text-inactive">{displayValues.length ? displayValues[value] : format.replace("<val>", `${value}`)}</p>
    {/if}
</div>