<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { NavTip, Tab } from "../base";
    import { Pagination } from "../utils";

    import { MoreMath } from "../../utils";

    interface Props {
        selectedIdx?: number;
        hasNewNews?: boolean;

        enableKeyInput?: boolean;

        class?: string;
        onclick?: (i: number) => void;
    }

    let {
        selectedIdx = $bindable(0),
        hasNewNews = $bindable(false),

        enableKeyInput = false,

        class: className,
        onclick: click = () => {}
    }: Props = $props();

    function onclick(i: number) {
        if (labels[i] === "News") hasNewNews = false;
        click(i);
    }

    const labels = ["Characters", "Exporting", "News", "Credits"] as const;
</script>

<div class={twMerge("flex flex-row sm:gap-1 bg-secondary", className)}>
    <NavTip key="Q" class="not-sm:hidden" />
    <Pagination bind:selectedIdx {enableKeyInput} {onclick}>
        {#snippet children(i)}
            {#each labels as label, j (j)}
                <Tab {label} selected={j === i} class="scale-75 sm:scale-100 {
                    MoreMath.isInRange(j, 1, labels.length - 3)
                        ? "-ml-7 sm:ml-0" :
                    j === labels.length - 2
                        ? "-mx-7 sm:mx-0"
                        : ""
                }" style="z-index: {(labels.length - j) * 10}" hasNotice={hasNewNews && label === "News"} />
            {/each}
        {/snippet}
    </Pagination>
    <NavTip key="R" class="not-sm:hidden" />
</div>
