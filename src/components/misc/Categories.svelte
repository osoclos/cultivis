<script lang="ts">
    import { onMount } from "svelte";
    import { twMerge } from "tailwind-merge";

    import { NavTip, Tab } from "../base";
    import { Pagination } from "../utils";

    import { NewsManager, newsManager } from "../../scripts/managers";

    interface Props {
        selectedIdx?: number;

        hasNoticedTutorial?: boolean;
        hasPetNarinder?: boolean;

        enableKeyInput?: boolean;

        class?: string;
        onclick?: (i: number) => void;
    }

    let {
        selectedIdx = $bindable(0),

        hasNoticedTutorial = $bindable(false),
        hasPetNarinder = $bindable(false),

        enableKeyInput = false,

        class: className,
        onclick: click = () => {}
    }: Props = $props();

    const LABELS = ["Characters", "Exporting", "News", "Credits"] as const;

    let hasCheckedNews: boolean = $state(false);
    let newsUnix: number = 0;

    onMount(async () => {
        hasCheckedNews = await newsManager.areNewsUpdated(true);
        newsUnix = await newsManager.getNewsUnix();
    });

    async function onclick(i: number) {
        if (!hasCheckedNews && LABELS[i] === "News") {
            hasCheckedNews = true;
            localStorage.setItem(NewsManager.NEWS_LAST_CHECKED_LOCAL_STORAGE_NAME, `${newsUnix}`);
        }

        click(i);
    }
</script>

<div class={twMerge("flex flex-row gap-1 bg-secondary scale-75 sm:scale-100", className)}>
    <NavTip key="Q" class="not-sm:hidden" />
        <Pagination bind:selectedIdx label="Categories" {enableKeyInput} {onclick}>
            {#snippet children(i)}
                {#each LABELS as label, j (j)}
                    <Tab {label} selected={j === i} style="z-index: {(LABELS.length - j) * 10}" hasNotice={(label === "News" && !hasCheckedNews) || (label === "Credits" && (!hasNoticedTutorial || !hasPetNarinder))} />
                {/each}
            {/snippet}
        </Pagination>
    <NavTip key="R" class="not-sm:hidden" />
</div>
