<script lang="ts">
    import { getAstNode } from "svelte-exmarkdown";
    import { LabelTitle } from "../../base";

    const ctx = getAstNode();
    const { children } = $derived(ctx.current);
</script>

<LabelTitle class="mt-4 -mb-2" title={children?.filter(({ type }) => type === "text").map(({ value }) => value).join(" ") ?? ""} />
