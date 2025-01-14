<script lang="ts">
    import { onMount } from "svelte";
    import { Markdown, type Plugin } from "svelte-exmarkdown";

    import { Header, LabelTitle } from "../base";

    import { changelogPlugin } from "./changelog";
    import { blogPreviewPlugin } from "./blog";

    import { GitManager } from "../../scripts/managers";

    interface Props { gitManager: GitManager; }
    const { gitManager = $bindable() }: Props = $props();

    const { news } = $derived(gitManager);
    const folderData: Record<string, [string, Plugin]> = {
        "Changelog": [GitManager.CHANGELOG_FOLDER_NAME, changelogPlugin],
        "Blog": [GitManager.BLOG_FOLDER_NAME, blogPreviewPlugin]
    };

    onMount(() => gitManager.updateNewsLocalStorage());
</script>

<div class="flex flex-col gap-12 w-84 sm:w-96">
    {#each Object.entries(folderData) as [title, [name, plugin]], i (i)}
        <div class="flex flex-col gap-2">
            <Header {title} />
            {#if news.get(name)}
                <div>
                    {#each news.get(name)! as md, i (i)}
                        <Markdown {md} plugins={[plugin]} />
                    {/each}
                </div>
            {:else}
                <LabelTitle title={gitManager ? "No content available" : "Loading..."} />
            {/if}
        </div>
    {/each}
</div>