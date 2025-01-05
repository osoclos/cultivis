<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { NavTip, Tab } from "../base";
    import { Pagination } from "../utils";

    interface Props {
        selectedIdx?: number;
        enableKeyInput?: boolean;

        class?: string;
        onclick?: (i: number) => void;
    }

    let {
        selectedIdx = $bindable(0),
        enableKeyInput = false,

        class: className,
        onclick = () => {}
    }: Props = $props();
</script>

<div class={twMerge("flex flex-row sm:gap-1 bg-secondary", className)}>
    <NavTip key="Q" class="not-sm:-mr-2" />
    <Pagination bind:selectedIdx {enableKeyInput} {onclick}>
        {#snippet children(i)}
            {#each ["Characters", "Exporting", "Credits"] as label, j (j)}
                <Tab {label} selected={j === i} class="scale-80 sm:scale-100 nth-[2]:-mx-6 sm:nth-[2]:mx-0" />
            {/each}
        {/snippet}
    </Pagination>
    <NavTip key="R" class="not-sm:-ml-2" />
</div>
