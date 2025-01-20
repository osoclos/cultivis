<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { NavTip, Tab } from "../base";
    import { Pagination } from "../utils";

    import { GitManager } from "../../scripts/managers";

    interface Props {
        selectedIdx?: number;
        gitManager: GitManager

        enableKeyInput?: boolean;

        class?: string;
        onclick?: (i: number) => void;
    }

    let {
        selectedIdx = $bindable(0),
        gitManager,

        enableKeyInput = false,

        class: className,
        onclick: click = () => {}
    }: Props = $props();

    let hasCheckedNews: boolean = $state(false);

    const LABELS = ["Characters", "Exporting", "News", "Credits"] as const;
    async function onclick(i: number) {
        if (!hasCheckedNews && LABELS[i] === "News") {
            hasCheckedNews = true;
            localStorage.setItem(GitManager.NEWS_LOCAL_STORAGE_NAME, await gitManager.getNewsSha());
        }

        click(i);
    }
</script>

<div class={twMerge("flex flex-row gap-1 bg-secondary scale-75 sm:scale-100", className)}>
    {#await gitManager.areNewsUpdated() then areNewsUpdated}
        <NavTip key="Q" class="not-sm:hidden" />
        <Pagination bind:selectedIdx {enableKeyInput} {onclick}>
            {#snippet children(i)}
                {#each LABELS as label, j (j)}
                    {#if label === "News"}
                        <Tab {label} selected={j === i} style="z-index: {(LABELS.length - j) * 10}" hasNotice={!hasCheckedNews && !areNewsUpdated} />
                    {:else}
                        <Tab {label} selected={j === i} style="z-index: {(LABELS.length - j) * 10}" />
                    {/if}
                {/each}
            {/snippet}
        </Pagination>
        <NavTip key="R" class="not-sm:hidden" />
    {/await}
</div>
