<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Action } from "svelte/action";

    import { twMerge } from "tailwind-merge";

    interface Props {
        children?: Snippet;
        label: string;

        class?: string;
    }

    const { children, label, class: className }: Props = $props();

    const pointerEvent: Action<HTMLDivElement> = (container) => {
        function onClick() {
            const lastChild = container.lastElementChild as HTMLElement;
            const inputGrandchild = [...lastChild.children].find((child) => child instanceof HTMLInputElement || child instanceof HTMLSelectElement);

            (inputGrandchild ?? lastChild).focus();
        }

        function onPointerEnter() {
            const lastChild = container.lastElementChild as HTMLElement;
            if (lastChild instanceof HTMLSelectElement) return;
            
            lastChild.focus();
        }

        $effect(() => {
            container.addEventListener("click", onClick);
            container.addEventListener("pointerenter", onPointerEnter);

            return () => {
                container.removeEventListener("click", onClick);
                container.removeEventListener("pointerenter", onPointerEnter);
            };
        });
    };
</script>

<div use:pointerEvent class={twMerge("group flex flex-row justify-between items-center w-full max-w-160", className)}>
    <p class="font-subtitle italic tracking-widest text-inactive group-hover:text-active transition-[color] duration-75">{label}</p>
    {@render children?.()}
</div>