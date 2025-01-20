<script lang="ts">
    import { onMount, type Snippet } from "svelte";
    import { twMerge } from "tailwind-merge";

    import { Header } from ".";

    interface Props {
        children?: Snippet;

        title?: string;
        description?: string;

        class?: string;
        childClass?: string;
    }

    const {
        children,

        title = "",
        description = "",

        class: className,
        childClass
    }: Props = $props();

    let dialog: HTMLDivElement;
    onMount(() => requestAnimationFrame(() => {
        dialog.classList.replace("opacity-0", "opacity-100");
        dialog.classList.replace("scale-125", "scale-100");
    }));
</script>

<div bind:this={dialog} class={twMerge("aspect-[6_/_5] w-100 sm:w-120 bg-[linear-gradient(170deg,_#232823_50%,_#0a0a0a_90%,_#0a0a0a_100%)] opacity-0 transition-[opacity,_scale] duration-450 scale-125", className)} role="dialog" aria-label="Terms of Service Disclaimer">
    <img src="/static/ui/dialog-outline.png" alt="" width="480" height="400" draggable="false" role="presentation" aria-hidden="true" />
    
    <div class="aspect-[3_/_2] flex absolute top-8 left-1/2 flex-col px-10 w-full -translate-x-1/2">
        <div class="flex flex-col gap-1 sm:gap-2 items-center">
            <Header class="-mt-2 scale-85" {title} />
            <p class="font-subtitle text-xs sm:text-sm text-active text-center">{description}</p>

            <img src="/static/ui/dialog-divider.png" alt="" class="mt-2 sm:mt-4" width="175" height="20" draggable="false" role="presentation" aria-hidden="true" />
        </div>
        
        <div class={childClass}>
            {@render children?.()}
        </div>
    </div>
</div>