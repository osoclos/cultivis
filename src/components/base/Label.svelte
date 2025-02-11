<script lang="ts">
    import type { Snippet } from "svelte";
    import { twMerge } from "tailwind-merge";

    import { soundManager } from "../../scripts/managers";

    interface Props {
        children?: Snippet;
        label: string;

        class?: string;
    }

    const { children, label, class: className }: Props = $props();
    let container: HTMLDivElement = $state(document.createElement("div"));

    function onclick({ target }: MouseEvent) {
        const lastChild = container.lastElementChild as HTMLElement;
        const inputGrandchild = [...lastChild.children].find((child) => child instanceof HTMLInputElement || child instanceof HTMLSelectElement);

        (inputGrandchild ?? lastChild)[target === lastChild ? "focus" : "click"]();
    }

    function onpointerenter() {
        const lastChild = container.lastElementChild as HTMLElement;
        if (lastChild instanceof HTMLSelectElement) return;
        
        lastChild.focus();
        soundManager.play("Flicker");
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div bind:this={container} class={twMerge("group flex flex-row justify-between items-center w-full max-w-160", className)} role="listitem" aria-label={label} {onclick} {onpointerenter}>
    <p class="font-subtitle italic tracking-widest text-inactive group-hover:text-active not-motion-reduce:transition-[color] not-motion-reduce:duration-75">{label}</p>
    {@render children?.()}
</div>