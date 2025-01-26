<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Action } from "svelte/action";

    import { twMerge } from "tailwind-merge";

    import { MoreMath } from "../../utils";

    interface Props {
        children?: Snippet;

        enableKeyInput?: boolean;
        isHorizontal?: boolean;

        focusFirst?: boolean;
        autoFocus?: boolean;

        class?: string;

        onfocus?: (i: number, fromKeys: boolean) => void;
        onkeyfocus?: (offset: number, isValid: boolean, i: number) => void;
    }

    const {
        children = $bindable(),

        enableKeyInput = false,
        isHorizontal = false,

        focusFirst = false,
        autoFocus = true,

        class: className,

        onfocus: focus = () => {},
        onkeyfocus: keyFocus = () => {}
    }: Props = $props();

    let focusIdx: number = $state(+focusFirst - 1);
    const focusEvents: Action<HTMLDivElement> = (container) => {
        if (!children) return;
        focusFirst && document.hasFocus() && ([...container.children] as HTMLElement[]).find(({ tabIndex }) => tabIndex >= 0)?.focus();

        function onFocusIn({ target }: FocusEvent) {
            const i = ([...container.children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0).findIndex((child) => child === target as HTMLElement || [...child.children].includes(target as HTMLElement));
            if (i < 0) return;
            
            focusIdx = i;
            focus(focusIdx, false);
        }

        function onFocusOut({ relatedTarget }: FocusEvent) {
            if (!relatedTarget) focusIdx = -1;
        }
        
        $effect(() => {
            container.addEventListener("focusin", onFocusIn);
            container.addEventListener("focusout", onFocusOut);

            return () => {
                container.removeEventListener("focusin", onFocusIn);
                container.removeEventListener("focusout", onFocusOut);
            };
        });
    };

    const keyEvents: Action<HTMLDivElement> = (container) => {
        if (!children) return;
        
        function onKeyDown(evt: KeyboardEvent) {
            const elements = ([...container.children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0);

            const { code, shiftKey } = evt;
            if (!["Tab"].concat(isHorizontal ? ["KeyA", "KeyD", "ArrowLeft", "ArrowRight"] : ["KeyW", "KeyS", "ArrowUp", "ArrowDown"]).includes(code) || document.activeElement instanceof HTMLInputElement || !enableKeyInput) return;

            evt.preventDefault();

            const toNextElement = (isHorizontal ? ["KeyD", "ArrowRight"] : ["KeyS", "ArrowDown"]).includes(code) || code === "Tab" && !shiftKey;
            const idxOffset = +toNextElement || -1;

            const i = MoreMath.clamp(focusIdx + idxOffset, 0, elements.length - 1);
            const isValid = i === focusIdx + idxOffset;
            
            keyFocus(idxOffset, isValid, i);

            if (!isValid) return;
            focus(i, true);

            if (!autoFocus) return;

            focusIdx = i;
            elements[focusIdx].focus();
        }

        $effect(() => {
            addEventListener("keydown", onKeyDown);
            return () => removeEventListener("keydown", onKeyDown);
        });
    };
</script>

<div use:focusEvents use:keyEvents class={twMerge("flex", isHorizontal ? "flex-row" : "flex-col", className)}>
    {@render children?.()}
</div>