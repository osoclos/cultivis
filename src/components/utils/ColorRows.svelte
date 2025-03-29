<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { Label, NumberInput } from "../base";
    import { MoreMath } from "/src/utils";

    const MAX_ACTIVE_OUTLINE_VALUE: number = 0x1f;

    interface Props {
        r?: number;
        g?: number;
        b?: number;

        class?: string;
        oninput?: (red: number, green: number, blue: number) => any;
    }

    let {
        r = $bindable(0),
        g = $bindable(0),
        b = $bindable(0),

        class: className,
        oninput: input = () => {}
    }: Props = $props();

    let pointerBar: HTMLDivElement | null = null;

    let redBar: HTMLDivElement;
    let greenBar: HTMLDivElement;
    let blueBar: HTMLDivElement;

    function updateValFromPercentage(percentage: number, target: HTMLDivElement) {
        const value = MoreMath.clamp(MoreMath.roundNearest(percentage * 0xff, 1), 0, 0xff);

        switch (target) {
            case redBar: {
                r = value;
                break;
            }

            case greenBar: {
                g = value;
                break;
            }

            case blueBar: {
                b = value;
                break;
            }
        }
    }

    function onpointerdown({ pointerId, offsetX, currentTarget, target }: PointerEvent) {
        const bar = currentTarget as HTMLDivElement;
        
        pointerBar = bar;
        bar.setPointerCapture(pointerId);

        if (bar !== target) return;

        updateValFromPercentage(offsetX / bar.clientWidth, bar);
        input(r, g, b);
    }

    function onpointermove({ offsetX, currentTarget }: PointerEvent) {
        if (currentTarget && pointerBar !== currentTarget) return;

        const bar = currentTarget as HTMLDivElement;
        
        updateValFromPercentage(offsetX / bar.clientWidth, bar);
        input(r, g, b);
    }

    function onpointerup({ pointerId, currentTarget }: PointerEvent) {
        const bar = currentTarget as HTMLDivElement;
        
        pointerBar = null;
        bar.releasePointerCapture(pointerId);
    }
</script>

<div class={twMerge("flex flex-col gap-6 w-full", className)}>
    <div class="flex flex-row gap-6 items-center">
        <Label label="R">
            <div bind:this={redBar} class="relative ml-4 mr-6 w-full h-6 rounded-full {(g + b) / 2 < MAX_ACTIVE_OUTLINE_VALUE ? "outline-2 outline-active" : ""}" style:background-image="linear-gradient(to right, rgb({0x00} {g} {b}), rgb({0xff} {g} {b})" aria-label="Red" aria-valuenow={r} aria-valuemin={0x00} aria-valuemax={0xff} {onpointerdown} {onpointermove} {onpointerup}>
                <button class="aspect-square w-4 h-4 absolute -top-4 -translate-x-1/2" style:left="{r / 0xff * 100}%">
                    <img src="/static/ui/selection-arrow.png" alt="" class=" brightness-360 hue-rotate-45 saturate-120 hover:brightness-185 hover:hue-rotate-168 hover:saturate-200 active:brightness-185 active:hue-rotate-168 active:saturate-200 not-motion-reduce:transition-[filter,_scale] not-motion-reduce:duration-150 -rotate-90" width="16" height="16" draggable="false" role="presentation" aria-hidden="true" />
                </button>
            </div>

            <NumberInput label="Red" bind:value={r} min={0} max={0xff} step={1} oninput={() => input(r, g, b)} />
        </Label>
    </div>

    <div class="flex flex-row gap-6 items-center">
        <Label label="G">
            <div bind:this={greenBar} class="relative ml-4 mr-6 w-full h-6 rounded-full {(r + b) / 2 < MAX_ACTIVE_OUTLINE_VALUE ? "outline-2 outline-active" : ""}" style:background-image="linear-gradient(to right, rgb({r} {0x00} {b}), rgb({r} {0xff} {b})" aria-label="Green" aria-valuenow={g} aria-valuemin={0x00} aria-valuemax={0xff} {onpointerdown} {onpointermove} {onpointerup}>
                <button class="aspect-square w-4 h-4 absolute -top-4 -translate-x-1/2" style:left="{g / 0xff * 100}%">
                    <img src="/static/ui/selection-arrow.png" alt="" class=" brightness-360 hue-rotate-45 saturate-120 hover:brightness-185 hover:hue-rotate-168 hover:saturate-200 active:brightness-185 active:hue-rotate-168 active:saturate-200 not-motion-reduce:transition-[filter,_scale] not-motion-reduce:duration-150 -rotate-90" width="16" height="16" draggable="false" role="presentation" aria-hidden="true" />
                </button>
            </div>
    
            <NumberInput label="Green" bind:value={g} min={0} max={0xff} step={1} oninput={() => input(r, g, b)} />
        </Label>
    </div>

    <div class="flex flex-row gap-6 items-center">
        <Label label="B">
            <div bind:this={blueBar} class="relative ml-4 mr-6 w-full h-6 rounded-full {(r + g) / 2 < MAX_ACTIVE_OUTLINE_VALUE ? "outline-2 outline-active" : ""}" style:background-image="linear-gradient(to right, rgb({r} {g} {0x00}), rgb({r} {g} {0xff})" aria-label="Blue" aria-valuenow={b} aria-valuemin={0x00} aria-valuemax={0xff} {onpointerdown} {onpointermove} {onpointerup}>
                <button class="aspect-square w-4 h-4 absolute -top-4 -translate-x-1/2" style:left="{b / 0xff * 100}%">
                    <img src="/static/ui/selection-arrow.png" alt="" class=" brightness-360 hue-rotate-45 saturate-120 hover:brightness-185 hover:hue-rotate-168 hover:saturate-200 active:brightness-185 active:hue-rotate-168 active:saturate-200 not-motion-reduce:transition-[filter,_scale] not-motion-reduce:duration-150 -rotate-90" width="16" height="16" draggable="false" role="presentation" aria-hidden="true" />
                </button>
            </div>
    
            <NumberInput label="Blue" bind:value={b} min={0} max={0xff} step={1} oninput={() => input(r, g, b)} />
        </Label>
    </div>
</div>