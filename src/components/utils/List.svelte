<script lang="ts">
    import { onDestroy, onMount, type Snippet } from "svelte";
    import { twMerge } from "tailwind-merge";

    import { MoreMath } from "../../utils";

    interface Props {
        children?: Snippet;

        enableKeyInput?: boolean;
        isHorizontal?: boolean;

        focusFirst?: boolean;
        autoFocus?: boolean;

        isTabbable?: boolean;

        class?: string;
        label: string;

        onfocus?: (i: number, fromKeys: boolean) => void;
        onkeyfocus?: (offset: number, isValid: boolean, i: number) => void;
    }

    const {
        children = $bindable(),

        enableKeyInput = false,
        isHorizontal = false,

        focusFirst = false,
        autoFocus = true,

        isTabbable = true,

        class: className,
        label,

        onfocus: focus = () => {},
        onkeyfocus: keyFocus = () => {}
    }: Props = $props();

    let focusIdx: number = $state(+focusFirst - 1);
    let container: HTMLDivElement;

    function onKeyDown(evt: KeyboardEvent) {
        if (!children || !enableKeyInput) return;

        const { code, shiftKey, ctrlKey, altKey } = evt;
        if (!(isTabbable ? ["Tab"] : []).concat(isHorizontal ? ["KeyA", "KeyD", "ArrowLeft", "ArrowRight"] : ["KeyW", "KeyS", "ArrowUp", "ArrowDown"]).includes(code) || ctrlKey || altKey || document.activeElement instanceof HTMLInputElement || !enableKeyInput) return;

        evt.preventDefault();

        const toNextElement = (isHorizontal ? ["KeyD", "ArrowRight"] : ["KeyS", "ArrowDown"]).includes(code) || code === "Tab" && !shiftKey;
        const idxOffset = +toNextElement || -1;

        const elements = ([...container.children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0);

        const i = MoreMath.clamp(focusIdx + idxOffset, 0, elements.length - 1);
        const isValid = i === focusIdx + idxOffset;
        
        keyFocus(idxOffset, isValid, i);

        if (!isValid) return;
        focus(i, true);

        if (!autoFocus) return;

        focusIdx = i;
        elements[focusIdx].focus();
    }

    function onfocusin({ target }: FocusEvent) {
        const elements = ([...container.children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0);

        const i = elements.findIndex((element) => element.contains(target as HTMLElement));
        if (i < 0) return;
        
        focusIdx = i;
        focus(focusIdx, false);
    }

    onMount<boolean | void>(() => {
        addEventListener("keydown", onKeyDown);
        focusFirst && document.hasFocus() && (container.firstElementChild as HTMLElement).focus();
    });

    onDestroy(() => removeEventListener("keydown", onKeyDown));
</script>

<div bind:this={container} class={twMerge("flex", isHorizontal ? "flex-row" : "flex-col", className)} aria-label={label} {onfocusin} onfocusout={({ relatedTarget }) => !relatedTarget && (focusIdx = -1)}>
    {@render children?.()}
</div>