<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        selected?: boolean;
        label: string;

        class?: string;
        onclick?: VoidFunction;
    }

    let button: HTMLButtonElement;
    const labelElement = $derived([...button!.children].find((element) => element instanceof HTMLParagraphElement))!;

    let {
        selected = $bindable(false),
        label,
    
        class: className,
        onclick = () => {}
    }: Props = $props();
    
    function onpointerleave() {
        if (selected) return;

        const { classList } = labelElement;
        classList.replace("text-white", "text-black");
        classList.replace("duration-75", "duration-150");
    }

    function ontransitionend() {
        if (!selected && !button.matches(":hover")) return;
        
        const { classList } = labelElement;
        classList.replace("text-black", "text-white");
        classList.replace("duration-150", "duration-75");
    }
</script>

<button bind:this={button} class={twMerge("group aspect-[370_/_148] flex relative flex-col justify-end min-w-30 h-10.5 outline-none transition-[filter] duration-225 [&_*]:pointer-events-none", selected ? "saturate-100" : "saturate-0 hover:saturate-100", className)} aria-label={label} {onclick} {onpointerleave}>
    <div class="w-full {selected ? "h-7.25" : "h-7"} group-hover:h-7.25 bg-cover bg-[url('/static/ui/tab.png')] transition-[height] duration-150"></div>
    <div class="w-full {selected ? "h-3.25" : "h-1.5"} group-hover:h-3.25 bg-bottom bg-cover bg-[url('/static/ui/tab.png')] transition-[height] duration-150"></div>

    <p class="absolute {selected ? "top-1/2 text-white" : "top-2/3"} group-hover:top-1/2 left-1/2 text-xl text-black transition-[top,_color] duration-150 -translate-1/2" {ontransitionend}>{label}</p>
</button>