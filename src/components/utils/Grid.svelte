<script lang="ts">
    import { onDestroy, onMount, type Snippet } from "svelte";
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
        label: string;
        
        onfocus?: (pos: Vector, i: number, fromKeys: boolean) => void;
        onkeyfocus?: (offset: Vector, isValid: boolean, pos: Vector) => void;
    }
    
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
        label,

        onfocus: focus = () => {},
        onkeyfocus: keyFocus = () => {}
    }: Props = $props();

    let container: HTMLDivElement = $state(document.createElement("div"));
    let numOfChildren: number = $state(0);

    const focusPos = $state(Vector[focusFirst ? "Zero" : "NegOne"].toObj());
    const focusIdx = $derived(Vector.NegOne.equalsObj(focusPos) ? -1 : focusPos.x + focusPos.y * columns);

    const resizer = new ResizeObserver(([entry]) => {
        const { inlineSize: width } = entry.contentBoxSize[0];
        updateGridSize(width);
    });

    const mutator = new MutationObserver(([entry]) => {
        const { type } = entry;
        if (type !== "childList") return;

        updateGridSize();
    });

    function updateGridSize(width: number = container.clientWidth) {
        numOfChildren = ([...container.children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0).length;

        if (autoColumns) columns = MoreMath.clamp(((width + gapWidth) / (tileWidth + gapWidth)) | 0, minColumns, maxColumns);
        rows = Math.ceil(numOfChildren / columns);
    }

    onMount(() => {
        resizer.observe(container);
        mutator.observe(container, { childList: true });

        focusFirst && document.hasFocus() && (container.firstElementChild as HTMLElement).focus();
    });

    onDestroy(() => {
        resizer.disconnect();
        mutator.disconnect();
    });

    // TODO: redo keyboard focus to comply with aria grid role key combinations

    function updateVecFromIdx(i: number) {
        Vector.valToObj(focusPos, i % columns, (i / columns) | 0);
    }

    function onkeydown(evt: KeyboardEvent) {
        if (!children || !enableKeyInput) return;

        const { code, shiftKey, ctrlKey, altKey } = evt;
        if (!["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].concat(isTabbable ? ["Tab"] : []).includes(code) || ctrlKey || altKey || document.activeElement instanceof HTMLInputElement || !enableKeyInput) return;

        evt.preventDefault();
        if (code === "Tab") {
            const toNextElement = !shiftKey;    
            const idxOffset = +toNextElement || -1;

            const elements = ([...container.children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0);
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

        const elements = ([...container.children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0);

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

    function onfocusin({ target }: FocusEvent) {
        const elements = ([...container.children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0);

        const i = elements.findIndex((element) => element.contains(target as HTMLElement));
        if (i < 0) return;

        updateVecFromIdx(i);
        focus(Vector.fromObj(focusPos), focusIdx, false);
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={container} class={twMerge("grid place-content-center w-full", className)} style:grid-template-columns="repeat(auto-fit, {tileWidth}px)" style:grid-template-rows="repeat(auto-fit, {tileHeight}px)" style:column-gap="{gapWidth}px" style:row-gap="{gapHeight}px" style:min-width="{(tileWidth + gapWidth) * minColumns - gapWidth}px" style:max-width="{(tileWidth + gapWidth) * maxColumns - gapWidth + 0.1}px" tabindex="0" role="grid" aria-label={label} {onkeydown} {onfocusin} onfocusout={({ relatedTarget }) => !relatedTarget && Vector.NegOne.cloneObj(focusPos)}>
    {@render children?.()}
    {#each Array(Math.max(maxColumns - numOfChildren, 0)).keys() as i (i)}
        <div tabindex="-1"></div>
    {/each}
</div>