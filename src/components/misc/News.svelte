<script lang="ts" module>
    import type { Plugin } from "svelte-exmarkdown";
    import { Title } from "./ast";

    export const cotlPlugin: Plugin = {
        renderer: {
            h1: Title
        }
    };
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import { Markdown } from "svelte-exmarkdown";

    import { GitManager } from "../../scripts/managers";

    interface Props { gitManager: GitManager; }
    const { gitManager = $bindable() }: Props = $props();

    onMount(() => gitManager.updateNewsLocalStorage());
    const plugins: Plugin[] = [cotlPlugin];
</script>

<div class="text-white">
    {#each gitManager.news.get(GitManager.CHANGELOG_FOLDER_NAME) ?? [] as md, i (i)}
        <Markdown {md} {plugins} />
    {/each}
</div>