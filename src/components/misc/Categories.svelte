<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { NavTip, Tab } from "../base";
    import { Pagination } from "../utils";

    import { MoreMath } from "../../utils";

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

    const labels: string[] = ["Characters", "Exporting", "News", "Credits"];
</script>

<div class={twMerge("flex flex-row sm:gap-1 bg-secondary", className)}>
    <NavTip key="Q" class="not-sm:hidden" />
    <Pagination bind:selectedIdx {enableKeyInput} {onclick}>
        {#snippet children(i)}
            {#each labels as label, j (j)}
                <Tab {label} selected={j === i} class={"scale-75 sm:scale-100".concat(
                    MoreMath.isInRange(j, 1, labels.length - 3)
                        ? " -ml-7 sm:ml-0" :
                    j === labels.length - 2
                        ? " -mx-7 sm:mx-0"
                        : ""
                )} />
            {/each}
        {/snippet}
    </Pagination>
    <NavTip key="R" class="not-sm:hidden" />
</div>
