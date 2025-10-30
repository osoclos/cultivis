<script lang="ts">
    import { getAstNode } from "svelte-exmarkdown";
    import { DividerTitle } from "../../base";

    const ctx = getAstNode();
    const { children } = $derived(ctx.current);
</script>

<DividerTitle class="mt-4 mb-1.5" title={children?.filter(({ type }) => type === "text").map(({ value }) => value).join(" ") ?? ""} />
