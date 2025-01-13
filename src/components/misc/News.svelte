<script lang="ts" module>
    // add plugin
</script>

<script lang="ts">
    import { onMount } from "svelte";
    import { NewsManager } from "../../scripts/managers";

    interface Props { newsManager: NewsManager; }
    const { newsManager = $bindable() }: Props = $props();

    onMount(() => {
        newsManager.storeLatestNewsShas();
    });
</script>

<div>
<!-- add markdown component -->
</div>