<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Action } from "svelte/action";

    import { twMerge } from "tailwind-merge";

    import { soundManager } from "../../scripts/managers";
    import { MoreMath } from "../../utils";

    interface Props {
        children?: Snippet<[number]>;

        enableKeyInput?: boolean;
        selectedIdx?: number;
        
        class?: string;
        onclick?: (i: number) => void;
    }

    let {
        children,

        enableKeyInput = false,
        selectedIdx = $bindable(+!!children - 1),

        class: className,
        onclick: click = () => {}
    }: Props = $props();

    const clickEvent: Action<HTMLDivElement> = (container) => {
        if (!children) return;

        function onClick({ target }: MouseEvent) {
            const i = ([...container.children] as HTMLElement[]).findIndex((element) => element === target as HTMLElement || [...element.children].includes(target as HTMLElement));
            if (i < 0 || i === selectedIdx) return;
            
            selectedIdx = i;
            click(selectedIdx);
        }

        $effect(() => {
            container.addEventListener("click", onClick);
            return () => container.removeEventListener("click", onClick);
        });
    };

    const keyEvents: Action<HTMLDivElement> = (container) => {
        if (!children) return;

        function onKeyDown(evt: KeyboardEvent) {
            const { code } = evt;
            if (!["KeyQ", "KeyR"].includes(code) || document.activeElement instanceof HTMLInputElement || !enableKeyInput) return;

            evt.preventDefault();

            const toNextElement = code === "KeyR";
            const idxOffset = +toNextElement || -1;

            const i = MoreMath.clamp(selectedIdx + idxOffset, 0, container.childElementCount - 1);
            if (i !== selectedIdx + idxOffset) return;

            selectedIdx = i;

            soundManager.play("Option_Change");
            click(selectedIdx);
        }

        $effect(() => {
            addEventListener("keydown", onKeyDown);
            return () => removeEventListener("keydown", onKeyDown);
        });
    };
</script>

<div use:clickEvent use:keyEvents class={twMerge("flex flex-row", className)}>
    {@render children?.(selectedIdx)}
</div>