<script lang="ts">
    import { twMerge } from "tailwind-merge";
  import { MoreMath } from "/src/utils";

    interface Props {
        label: string;

        value?: number;
        unit?: string;

        step?: number;
        min?: number;
        max?: number;

        class?: string;
        oninput?: (val: number) => void;
    }

    let inputElement: HTMLInputElement;
    let {
        label,

        value = $bindable(0),
        unit,
        
        step = 1,
        min = 0,
        max = 100,

        class: className,
        oninput: input = () => {}
    }: Props = $props();

    function oninput() {
        value = MoreMath.clamp(MoreMath.roundNearest(value, step), min, max);
        input(value);
    }
</script>

<button class={twMerge("flex flex-row gap-1 p-1 font-subtitle text-inactive focus-within:text-active tracking-widest bg-dark rounded-xs outline-0 focus-within:outline-3 outline-highlight transition-[outline] duration-75", className)} aria-label={label}>
    <input bind:this={inputElement} type="number" bind:value class="no-arrows w-12 text-end outline-none" {step} {min} {max} name={label} {oninput} onpointerenter={() => inputElement.focus()} />
    {#if unit}
        <p>{unit}</p>
    {/if}
</button>

<style>
    .no-arrows { appearance: textfield; }
    .no-arrows::-webkit-outer-spin-button, .no-arrows::-webkit-inner-spin-button { appearance: none; }
</style>