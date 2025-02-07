<script lang="ts">
    import { Markdown, type Plugin } from "svelte-exmarkdown";
    import { BannerButton, Header, LabelTitle } from "../base";

    import { changelogPlugin } from "./changelog";
    import { blogPreviewPlugin } from "./blog";

    import { NewsManager } from "../../scripts/managers";

    interface Props {
        news: Record<string, string[]>;
        fullyLoadedFolders: string[];

        onloadmore?: (name: string) => Promise<any>;
    }

    const { news, fullyLoadedFolders, onloadmore: loadMore = async () => {} }: Props = $props();
    let isLoading: boolean = $state(false);

    const folderData: Record<string, [string, Plugin]> = {
        "Changelog": [NewsManager.CHANGELOG_FOLDER_NAME, changelogPlugin],
        "Blog": [NewsManager.BLOG_FOLDER_NAME, blogPreviewPlugin]
    };

    async function loadNews(name: string) {
        isLoading = true;
        await loadMore(name);

        isLoading = false;
    }
</script>

<div class="flex flex-col gap-12 items-center w-84 sm:w-96">
    {#each Object.entries(folderData) as [title, [name, plugin]], i (i)}
        <div class="flex flex-col gap-2">
            <Header {title} />
            
            {#if news[name]?.length}
                <div class="flex flex-col gap-10">
                    {#each news[name] as md, i (i)}
                        <div>
                            <Markdown {md} plugins={[plugin]} />
                        </div>
                    {/each}
                </div>

                
            {:else}
                <LabelTitle title="No content available" />
            {/if}
        </div>

        {#if !fullyLoadedFolders.includes(name)}
            <BannerButton class="mt-4" label={isLoading ? "Loading" : "Load More"} disabled={isLoading} onclick={() => loadNews(name)} />
        {/if}
    {/each}
</div>