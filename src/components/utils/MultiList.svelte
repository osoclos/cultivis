<script lang="ts">
    import { type Snippet } from "svelte";
    import { twMerge } from "tailwind-merge";

    import { DividerTitle } from "../base";
    import { List } from "../utils";

    import { MoreMath } from "../../utils";

    interface Props {
        children?: Snippet<[string, number]>;
        titles: string[];

        enableKeyInput?: boolean;
        focusFirst?: boolean;
        
        class?: string;
        listClass?: string;
    }

    let {
        children = $bindable(),
        titles,

        enableKeyInput = false,
        focusFirst = true,

        class: className,
        listClass
    }: Props = $props();

    const listContainers: HTMLDivElement[] = $state(Array(titles.length).fill(null));

    let listFocusIdx: number = $state(0);
    let inListKeyTransition: boolean = $state(false);

    function getListElements(i: number): HTMLElement[] {
        return ([...(listContainers[i].lastElementChild as HTMLDivElement).children] as HTMLElement[]).filter(({ tabIndex }) => tabIndex >= 0);
    }
    
    function updateListIdx(i: number) {
        listFocusIdx = MoreMath.clamp(i, 0, listContainers.length - 1);
    }
    
    function updateListFocus(offset: number, isValid: boolean, i: number) {
        if (!MoreMath.isInRange(listFocusIdx + offset, 0, listContainers.length - 1)) offset = 0;
        updateListIdx(listFocusIdx + offset * +!isValid);

        inListKeyTransition = offset > 0 && !isValid;
        const elements = getListElements(listFocusIdx);

        let nextIdx = isValid ? i : (elements.length - 1) * +(offset <= 0);
        if (!isValid && listFocusIdx - offset <= 0) nextIdx = 0;
        
        elements[MoreMath.clamp(nextIdx, 0, elements.length - 1)].focus();
    }
</script>

<div class={twMerge("flex flex-col gap-2 w-full", className)}>
    {#each titles as title, i (i)}
        <div bind:this={listContainers[i]} class="flex flex-col gap-0.5">
            <DividerTitle class="text-lg" {title} />
            
            <List class={twMerge("items-center", listClass)} enableKeyInput={enableKeyInput && i === listFocusIdx} autoFocus={false} focusFirst={!i && focusFirst} onfocus={(_i, fromKeys) => !fromKeys && updateListIdx(i)} onkeyfocus={(offset, isValid, i) => inListKeyTransition ? inListKeyTransition = false : updateListFocus(offset, isValid, i)}>
                {@render children?.(title, i) }
            </List>
        </div>
    {/each}
</div>