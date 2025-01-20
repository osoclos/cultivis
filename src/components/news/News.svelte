<script lang="ts">
    import { Markdown, type Plugin } from "svelte-exmarkdown";
    import { Header, LabelTitle } from "../base";

    import { changelogPlugin } from "./changelog";
    import { blogPreviewPlugin } from "./blog";

    import { GitManager } from "../../scripts/managers";

    interface Props { gitManager: GitManager; }
    const { gitManager }: Props = $props();

    const folderData: Record<string, [string, Plugin]> = {
        "Changelog": [GitManager.CHANGELOG_FOLDER_NAME, changelogPlugin],
        "Blog": [GitManager.BLOG_FOLDER_NAME, blogPreviewPlugin]
    };
</script>

<div class="flex flex-col gap-12 w-84 sm:w-96">
    {#await gitManager.getNews()}
        <LabelTitle title="Loading..." />
    {:then news} 
        {#each Object.entries(folderData) as [title, [name, plugin]], i (i)}
            <div class="flex flex-col gap-2">
                <Header {title} />
                
                {#if name in news}
                    <div>
                        {#each news[name] as md, i (i)}
                            <Markdown {md} plugins={[plugin]} />
                        {/each}
                    </div>
                {:else}
                    <LabelTitle title="No content available" />
                {/if}
            </div>
        {/each}
    {/await}
</div>