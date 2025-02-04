<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import NoticeIcon from "./NoticeIcon.svelte";

    import { soundManager } from "../../scripts/managers";

    interface Props {
        selected?: boolean;
        hasNotice?: boolean;

        label: string;

        class?: string;
        buttonClass?: string;

        style?: string;
        onclick?: VoidFunction;
    }

    let isHovering: boolean = $state(false);

    let button: HTMLButtonElement;
    const labelElement = $derived([...button!.children].find((element) => element instanceof HTMLParagraphElement))!;

    let {
        selected = $bindable(false),
        hasNotice = false,

        label,
    
        class: className,
        buttonClass,

        style,
        onclick = () => {}
    }: Props = $props();
    
    function onpointerleave() {
        isHovering = false;
        if (selected) return;

        const { classList } = labelElement;
        classList.replace("text-white", "text-black");
        classList.replace("duration-75", "duration-150");
    }

    function ontransitionend() {
        isHovering = button.matches(":hover") && button.matches(":active");
        if (!selected || !isHovering) return;
        
        const { classList } = labelElement;

        classList.replace("text-black", "text-white");
        classList.replace("duration-150", "duration-75");
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class={twMerge("group relative", className)} {style} onclick={() => soundManager.play("Option_Change")}>
    <button bind:this={button} class={["aspect-[370_/_148] flex relative flex-col justify-end min-w-30 h-10.5 outline-none not-motion-reduce:transition-[filter] not-motion-reduce:duration-225 [&_*]:pointer-events-none", selected ? "saturate-100" : "saturate-0 hover:saturate-100", buttonClass]} aria-label={label} {onclick} onpointerenter={() => isHovering = selected} {onpointerleave}>
        <div class="w-full {selected ? "h-7.25" : "h-7"} group-hover:h-7.25 bg-cover bg-[url('/static/ui/tab.png')] not-motion-reduce:transition-[height] not-motion-reduce:duration-150"></div>
        <div class="w-full {selected ? "h-3.25" : "h-1.5"} group-hover:h-3.25 bg-bottom bg-cover bg-[url('/static/ui/tab.png')] not-motion-reduce:transition-[height] not-motion-reduce:duration-150"></div>

        <p class="absolute {selected || isHovering ? "top-1/2 text-white" : "top-2/3 group-hover:top-1/2 text-black motion-reduce:group-hover:text-white"} left-1/2 text-xl not-motion-reduce:transition-[top,_color] not-motion-reduce:duration-150 -translate-1/2" {ontransitionend}>{label}</p>
    </button>

    {#if hasNotice}
        <NoticeIcon class="absolute {selected ? "top-0" : "top-1/5 group-hover:top-0"} right-0 z-10 not-motion-reduce:transition-[top] not-motion-reduce:duration-150 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    {/if}
</div>