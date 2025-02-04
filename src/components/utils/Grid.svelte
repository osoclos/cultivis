<script lang="ts">
    import { onDestroy, onMount, type Snippet } from "svelte";
    import type { Action } from "svelte/action";

    import { twMerge } from "tailwind-merge";

    import { MoreMath, Vector } from "../../utils";

    interface Props {
        children?: Snippet;

        columns?: number;
        rows?: number;

        minColumns?: number;
        maxColumns?: number;
        
        autoColumns?: boolean;

        tileWidth?: number;
        tileHeight?: number;

        gapWidth?: number;
        gapHeight?: number;

        enableKeyInput?: boolean;
        isTabbable?: boolean;

        focusFirst?: boolean;
        autoFocus?: boolean

        class?: string;
        
        onfocus?: (pos: Vector, i: number, fromKeys: boolean) => void;
        onkeyfocus?: (offset: Vector, isValid: boolean, pos: Vector) => void;
    }
    
    let container: HTMLDivElement = $state(document.createElement("div"));
    
    let {
        children = $bindable(),

        minColumns = 1,
        maxColumns = 10,

        autoColumns = true,

        columns = $bindable(maxColumns * +!autoColumns),
        rows = $bindable(0),

        tileWidth = 100,
        tileHeight = 100,

        gapWidth = 10,
        gapHeight = 10,

        enableKeyInput = false,
        isTabbable = true,

        focusFirst = false,
        autoFocus = true,

        class: className,

        onfocus: focus = () => {},
        onkeyfocus: keyFocus = () => {}
    }: Props = $props();

    let numOfChildren: number = $state(0);

    const focusPos = $state(Vector[focusFirst ? "Zero" : "NegOne"].toObj());
    const focusIdx = $derived(Vector.NegOne.equalsObj(focusPos) ? -1 : focusPos.x + focusPos.y * columns);

    const resizer = new ResizeObserver(([entry]) => {
        const { inlineSize: width } = entry.contentBoxSize[0];

        if (autoColumns) columns = MoreMath.clamp(Math.floor((width + gapWidth) / (tileWidth + gapWidth)), minColumns, maxColumns);
        rows = Math.ceil((container?.childElementCount ?? 0) / columns);
    });

    const mutator = new MutationObserver(([entry]) => {
        const { target, type } = entry;
        if (type !== "childList") return;

        numOfChildren = (target as HTMLDivElement).children.length;
    });

    onMount(() => {
        resizer.observe(container);
        mutator.observe(container, { childList: true });
    });

    onDestroy(() => {
        resizer.disconnect();
        mutator.disconnect();
    });

    function updateVecFromIdx(i: number) {
        Vector.valToObj(focusPos, i % columns, Math.floor(i / columns));
    }

    const focusEvents: Action<HTMLDivElement> = (container) => {
        if (!children) return;
        focusFirst && document.hasFocus() && ([...container.children] as HTMLElement[]).find(({ tabIndex }) => tabIndex >= 0)?.focus();

        function onFocusIn({ target }: FocusEvent) {
            const i = ([...container.children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0).findIndex((child) => child === target as HTMLElement || [...child.children].includes(target as HTMLElement));
            if (i < 0) return;

            updateVecFromIdx(i);
            focus(Vector.fromObj(focusPos), focusIdx, false);
        }

        function onFocusOut({ relatedTarget }: FocusEvent) {
            if (!relatedTarget) Vector.NegOne.cloneObj(focusPos);
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
            if (!["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].concat(isTabbable ? ["Tab"] : []).includes(code) || document.activeElement instanceof HTMLInputElement || !enableKeyInput) return;

            evt.preventDefault();
            if (code === "Tab") {
                const toNextElement = !shiftKey;    
                const idxOffset = +toNextElement || -1;

                const i = MoreMath.clamp(focusIdx + idxOffset, 0, elements.length - 1);

                const prevPos = Vector.fromObj(focusPos);
                updateVecFromIdx(i);

                const pos = Vector.fromObj(focusPos);
                const isValid = !pos.equals(prevPos);

                autoFocus && elements[i].focus();

                isValid && focus(pos, i, true);
                keyFocus(Vector.sub(pos, prevPos), isValid, pos);
            
                return;
            }

            const isUpButtonPressed = ["KeyW", "ArrowUp"].includes(code);
            const isDownButtonPressed = ["KeyS", "ArrowDown"].includes(code);
            const isLeftButtonPressed = ["KeyA", "ArrowLeft"].includes(code);
            const isRightButtonPressed = ["KeyD", "ArrowRight"].includes(code);

            const xOffset = +isRightButtonPressed - +isLeftButtonPressed;
            const yOffset = +isDownButtonPressed - +isUpButtonPressed;

            const { x, y } = focusPos;
            const lastRowLength = elements.length % columns || columns;
            const isinLastRow = y === rows - 1;

            const maxColumnIdx = (isinLastRow ? lastRowLength : columns) - 1;
            const maxRowIdx = rows - 1 - +(focusPos.x >= lastRowLength);
            
            const isValid = MoreMath.isInRange(x + xOffset, 0, maxColumnIdx) && MoreMath.isInRange(y + yOffset, 0, maxRowIdx);

            const pos = Vector.fromObj(focusPos).addVal(xOffset, yOffset).min(new Vector(maxColumnIdx, maxRowIdx)).max(Vector.Zero);
            keyFocus(new Vector(xOffset, yOffset), isValid, pos);

            if (!isValid) return;

            const [newX, newY] = pos;
            focus(pos, newX + newY * columns, true);

            if (!autoFocus) return;
            
            pos.cloneObj(focusPos);
            elements[focusIdx].focus();
        }
        
        $effect(() => {
            addEventListener("keydown", onKeyDown);
            return () => removeEventListener("keydown", onKeyDown);
        });
    };
</script>

<div bind:this={container} use:focusEvents use:keyEvents class={twMerge("grid w-full", numOfChildren < maxColumns ? "place-content-start" : "place-content-center", className)} style:grid-template-columns="repeat(auto-fit, {tileWidth}px)" style:grid-template-rows="repeat(auto-fit, {tileHeight}px)" style:column-gap="{gapWidth}px" style:row-gap="{gapHeight}px" style:min-width="{(tileWidth + gapWidth) * minColumns - gapWidth}px" style:max-width="{(tileWidth + gapWidth) * maxColumns - gapWidth}px">
    {@render children?.()}
    <!-- {#each Array(Math.max(maxColumns - numOfChildren, 0)).keys() as i (i)}
        <div tabindex="-1"></div>
    {/each} -->
</div>