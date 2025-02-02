<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { soundManager } from "../../scripts/managers";
    import { MoreMath } from "../../utils";

    interface Props {
        options: string[];
        i?: number;

        label: string;

        class?: string;
        oninput?: (val: string, i: number) => void;
    }

    let {
        options,
        i = $bindable(0),

        label,

        class: className,
        oninput: input = () => {}
    }: Props = $props();

    const value: string = $derived(options[i]);
    let text: HTMLParagraphElement;

    function changeIdx(offset: number) {
        const newIdx = MoreMath.clamp(i + offset, 0, options.length - 1);
        if (newIdx === i) return;

        i = newIdx;
        input(value, i);

        text.classList.remove("fade-left", "fade-right");
        requestAnimationFrame(() => text.classList.add(offset > 0 ? "fade-right" : "fade-left"));

        soundManager.play("Option_Change");
    }

    function onkeydown(evt: KeyboardEvent) {
        const { code } = evt;
        if (!["KeyA", "KeyD", "ArrowLeft", "ArrowRight"].includes(code)) return;

        evt.preventDefault();
        changeIdx(+["KeyD", "ArrowRight"].includes(code) || -1);
    }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={twMerge("flex flex-row justify-between items-center w-80 outline-none", className)} tabindex="0" aria-label={label} {onkeydown}>
    {#if i}
        <button class="outline-none" name="Previous" onclick={() => changeIdx(-1)} onpointerenter={({ target }) => document.hasFocus() && (target as HTMLButtonElement).focus()}>
            <img src="/static/ui/scroll-list-arrow.png" alt="" class="aspect-square w-6 h-6 brightness-360 hue-rotate-45 saturate-120 hover:brightness-185 hover:hue-rotate-168 hover:saturate-200 active:brightness-185 active:hue-rotate-168 active:saturate-200 not-motion-reduce:transition-[filter,_scale] not-motion-reduce:duration-150 origin-left hover:scale-125" width="24" height="24" draggable="false" role="presentation" aria-hidden="true" />
        </button>
    {:else}
        <div class="w-6 h-6"></div>
    {/if}
    
    <!-- yes i copied their error and im too lazy to fix it -->
    <p bind:this={text} class="w-full font-subtitle text-xs sm:text-sm text-center text-active">{value}</p>

    {#if i < options.length - 1}
        <button class="outline-none" name="Next" onclick={() => changeIdx(1)} onpointerenter={({ target }) => document.hasFocus() && (target as HTMLButtonElement).focus()}>
            <img src="/static/ui/scroll-list-arrow.png" alt="" class="aspect-square w-6 h-6 brightness-360 hue-rotate-45 saturate-120 hover:brightness-185 hover:hue-rotate-168 hover:saturate-200 active:brightness-185 active:hue-rotate-168 active:saturate-200 not-motion-reduce:transition-[filter,_scale] not-motion-reduce:duration-150 origin-left -scale-x-100 hover:-scale-x-125 hover:scale-y-125 translate-x-full" width="24" height="24" draggable="false" role="presentation" aria-hidden="true" />
        </button>
    {:else}
        <div class="w-6 h-6"></div>
    {/if}
</div>

<style>
    @media not (prefers-reduced-motion) {
        .fade-left {
            animation: fade;
            animation-duration: 450ms;
            animation-timing-function: cubic-bezier(0.455, 0.03, 0.515, 0.955);
            animation-direction: reverse;
        }

        .fade-right {
            animation: fade;
            animation-duration: 450ms;
            animation-timing-function: cubic-bezier(0.455, 0.03, 0.515, 0.955);
        }
    }

    @keyframes fade {
        0% {
            filter: opacity(100%);
            transform: translateX(0);
        }

        49.9% {
            filter: opacity(0%);
            transform: translateX(1rem);
        }

        50.1% {
            filter: opacity(0%);
            transform: translateX(-1rem);
        }

        100% {
            filter: opacity(100%);
            transform: translateX(0);
        }
    }
</style>