<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import { Label, NumberInput } from "../base";

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

    const MAX_ACTIVE_OUTLINE_VALUE: number = 0x1f;
</script>

<div class={twMerge("flex flex-col gap-2 w-full", className)}>
    <div class="flex flex-row gap-6 items-center">
        <Label label="R">
            <div class="ml-4 mr-6 w-full h-6 rounded-full {(g + b) / 2 < MAX_ACTIVE_OUTLINE_VALUE ? "outline-2 outline-active" : ""}" style:background-image="linear-gradient(to right, rgb({0x00} {g} {b}), rgb({0xff} {g} {b})" aria-label="Red" aria-valuenow={r} aria-valuemin={0x00} aria-valuemax={0xff}>
                <!-- add knob for slider -->
            </div>

            <NumberInput label="Red" bind:value={r} min={0} max={0xff} step={1} oninput={() => input(r, g, b)} />
        </Label>
    </div>

    <div class="flex flex-row gap-6 items-center">
        <Label label="G">
            <div class="ml-4 mr-6 w-full h-6 rounded-full {(r + b) / 2 < MAX_ACTIVE_OUTLINE_VALUE ? "outline-2 outline-active" : ""}" style:background-image="linear-gradient(to right, rgb({r} {0x00} {b}), rgb({r} {0xff} {b})" aria-label="Green" aria-valuenow={g} aria-valuemin={0x00} aria-valuemax={0xff}>

            </div>
    
            <NumberInput label="Green" bind:value={g} min={0} max={0xff} step={1} oninput={() => input(r, g, b)} />
        </Label>
    </div>

    <div class="flex flex-row gap-6 items-center">
        <Label label="B">
            <div class="ml-4 mr-6 w-full h-6 rounded-full {(r + g) / 2 < MAX_ACTIVE_OUTLINE_VALUE ? "outline-2 outline-active" : ""}" style:background-image="linear-gradient(to right, rgb({r} {g} {0x00}), rgb({r} {g} {0xff})" aria-label="Blue" aria-valuenow={b} aria-valuemin={0x00} aria-valuemax={0xff}>
            
            </div>
    
            <NumberInput label="Blue" bind:value={b} min={0} max={0xff} step={1} oninput={() => input(r, g, b)} />
        </Label>
    </div>
</div>