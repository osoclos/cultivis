<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { MoreMath } from "../../utils";

    interface Props {
        label: string;
        value?: number;
        
        min?: number;
        max?: number;
        step?: number;

        showVal?: boolean;
        format?: string;

        class?: string;
        oninput?: (val: number) => void;
    }

    // svelte-ignore non_reactive_update
    let bar: HTMLDivElement;

    let isPointerDown: boolean = false;
    let {
        label,
        value = $bindable(0),

        min = 0,
        max = 100,
        step = 1,

        showVal = true,
        format = "<val>",
        
        class: className,
        oninput: input = () => {}
    }: Props = $props();

    const percentage = $derived(value / (max - min));
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

<div class={twMerge("flex flex-row w-80 h-3 items-center", className)}>
    <div class="relative w-full" role="slider" aria-label={label} aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} {onpointerdown} {onpointermove} {onpointerup}>
        <div bind:this={bar} class="w-full max-w-56 h-3 bg-primary"></div>
        <div class="aspect-square absolute top-1/2 w-6 bg-primary rounded-xs border-3 border-secondary -translate-1/2 pointer-events-none" style:left="{percentage * (bar?.clientWidth ?? 0)}px"></div>
    </div>

    {#if showVal}
        <p class="w-24 font-subtitle  tracking-widest text-end text-inactive">{format.replace("<val>", `${value}`)}</p>
    {/if}
</div>