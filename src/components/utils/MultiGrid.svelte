<script lang="ts">
    import { type Snippet } from "svelte";
    import { twMerge } from "tailwind-merge";

    import { DividerTitle } from "../base";
    import { Grid } from "../utils";

    import { MoreMath, Vector } from "../../utils";

    interface Props {
        children?: Snippet<[string, number]>;
        titles: string[];

        columns?: number;
        rows?: number[];

        minColumns?: number;
        maxColumns?: number;

        autoColumns?: boolean;

        tileWidth?: number;
        tileHeight?: number;

        gapWidth?: number;
        gapHeight?: number;

        enableKeyInput?: boolean;
        focusFirst?: boolean;
        
        class?: string;
        gridClass?: string;
    }

    let {
        children = $bindable(),
        titles = $bindable(),

        minColumns = 1,
        maxColumns = 10,

        autoColumns = true,

        columns = $bindable(0),
        rows = $bindable(Array(1000).fill(0)),

        tileWidth = 100,
        tileHeight = 100,

        gapWidth = 10,
        gapHeight = 10,

        enableKeyInput = false,
        focusFirst = true,

        class: className,
        gridClass
    }: Props = $props();

    const gridContainers: HTMLDivElement[] = $state(Array(titles.length).fill(null));

    let gridFocusIdx: number = $state(0);
    let inGridKeyTransition: boolean = $state(false);

    function getGridElements(i: number): HTMLElement[] {
        return ([...(gridContainers[i].lastElementChild as HTMLElement).children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0);
    }
    
    function updateGridIdx(i: number) {
        gridFocusIdx = MoreMath.clamp(i, 0, gridContainers.length - 1);
    }
    
    // TODO: redo keyboard focus to comply with aria grid role key combinations
    function updateGridFocus(offset: number, isValid: boolean, pos: Vector) {
        if (!MoreMath.isInRange(gridFocusIdx + offset, 0, gridContainers.length - 1)) offset = 0;
        updateGridIdx(gridFocusIdx + offset * +!isValid);

        inGridKeyTransition = offset > 0 && !isValid;

        const elements = getGridElements(gridFocusIdx);
        const rows = Math.ceil(elements.length / columns);
        
        const { x, y } = pos;
        
        let j = x + (isValid ? y * columns : +(offset < +(!inGridKeyTransition && y)) * (rows - 1) * columns);
        if (j >= elements.length && rows > 1) j -= columns;
        
        elements[MoreMath.clamp(j, 0, elements.length - 1)].focus();
    }
</script>

<div class={twMerge("flex flex-col gap-2 w-full max-w-max", className)}>
    {#each titles as title, i (i)}
        <div bind:this={gridContainers[i]} class="flex flex-col gap-0.5">
            <DividerTitle style="padding-inline: calc(mod(max(100%, {(tileWidth + gapWidth) * minColumns - gapWidth}px) + {gapWidth}px, {tileWidth + gapWidth}px) / 2)" {title} />
            
            <Grid class={twMerge("items-center", gridClass)} label={title} bind:columns bind:rows={rows[i]} {minColumns} {maxColumns} {autoColumns} {tileWidth} {tileHeight} {gapWidth} {gapHeight} enableKeyInput={enableKeyInput && i === gridFocusIdx} autoFocus={false} focusFirst={!i && focusFirst} onfocus={(_pos, _i, fromKeys) => !fromKeys && updateGridIdx(i)} onkeyfocus={({ y }, isValid, pos) => inGridKeyTransition ? inGridKeyTransition = false : updateGridFocus(y, isValid, pos)}>
                {@render children?.(title, i) }
            </Grid>
        </div>
    {/each}
</div>