<script lang="ts">
    import type { Snippet } from "svelte";
    import { soundManager } from "../../scripts/managers";

    interface Props {
        children?: Snippet;

        selected?: boolean;
        label: string;

        hideBackground?: boolean;
        hideFocusRing?: boolean;

        onclick?: VoidFunction;
    }

    let button: HTMLButtonElement;
    const {
        children,
        
        selected = $bindable(false),
        label,

        hideBackground = false,
        hideFocusRing = false,

        onclick: click = () => {}
    }: Props = $props();

    function onclick() {
        button.focus();
        click();

        soundManager.play("Click");
    }
</script>

<button bind:this={button} class="group relative w-16 h-16 {hideFocusRing ? "outline-none" : "focus:rounded-xs outline-0 focus:outline-[1.5px] outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75 touch-manipulation"}" aria-label={label} {onclick} onpointerenter={() => document.hasFocus() && button.focus()} onfocus={() => soundManager.play("Flicker")}>
    {#if !hideBackground}
        <img src="/static/ui/option-box.png" alt="" class="absolute top-0 left-0 w-16 h-16 {selected ? "brightness-75" : "brightness-35"} not-motion-reduce:transition-[filter] not-motion-reduce:duration-150" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
    {/if}    
    
    {#if !hideFocusRing}
        <div class="absolute top-0 left-0 z-10 w-16 h-16 group-focus:inset-ring-2 inset-ring-highlight not-motion-reduce:transition-shadow not-motion-reduce:duration-75"></div>
    {/if}

    <div class="absolute top-0 left-0">
        {@render children?.()}
    </div>
    
</button>