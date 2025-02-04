<script lang="ts">
    import { Markdown, type Plugin } from "svelte-exmarkdown";
    import { Header, LabelTitle } from "../base";

    import { changelogPlugin } from "./changelog";
    import { blogPreviewPlugin } from "./blog";

    import { NewsManager } from "../../scripts/managers";

    interface Props { news: Record<string, string[]>; }
    const { news }: Props = $props();

    const folderData: Record<string, [string, Plugin]> = {
        "Changelog": [NewsManager.CHANGELOG_FOLDER_NAME, changelogPlugin],
        "Blog": [NewsManager.BLOG_FOLDER_NAME, blogPreviewPlugin]
    };
</script>

<div class="flex flex-col gap-12 w-84 sm:w-96">
    {#each Object.entries(folderData) as [title, [name, plugin]], i (i)}
        <div class="flex flex-col gap-2">
            <Header {title} />
            
            {#if name in news}
                <div class="flex flex-col gap-10">
                    {#each [...news[name]].reverse() as md, i (i)}
                        <div>
                            <Markdown {md} plugins={[plugin]} />
                        </div>
                    {/each}
                </div>
            {:else}
                <LabelTitle title="No content available" />
            {/if}
        </div>
    {/each}
</div>