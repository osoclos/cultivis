<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Action } from "svelte/action";

    import { twMerge } from "tailwind-merge";

    import { soundManager } from "../../scripts/managers";

    interface Props {
        children?: Snippet;
        label: string;

        class?: string;
    }

    const { children, label, class: className }: Props = $props();

    const pointerEvents: Action<HTMLDivElement> = (container) => {
        function onClick({ target }: MouseEvent) {
            const lastChild = container.lastElementChild as HTMLElement;
            const inputGrandchild = [...lastChild.children].find((child) => child instanceof HTMLInputElement || child instanceof HTMLSelectElement);

            (inputGrandchild ?? lastChild)[target === lastChild ? "focus" : "click"]();
        }

        function onPointerEnter() {
            const lastChild = container.lastElementChild as HTMLElement;
            if (lastChild instanceof HTMLSelectElement) return;
            
            lastChild.focus();
            soundManager.play("Flicker");
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

<div use:pointerEvents class={twMerge("group flex flex-row justify-between items-center w-full max-w-160", className)}>
    <p class="font-subtitle italic tracking-widest text-inactive group-hover:text-active not-motion-reduce:transition-[color] not-motion-reduce:duration-75">{label}</p>
    {@render children?.()}
</div>