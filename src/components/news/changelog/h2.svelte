<script lang="ts" module>
    import type { HastElement } from "svelte-exmarkdown/types";
    declare const $ctx: HastElement;
</script>

<script lang="ts">
    import { getAstNode } from "svelte-exmarkdown/contexts";
    import { LabelTitle } from "../../base";
    
    const ctx = getAstNode();
    const { children } = $derived($ctx);
</script>

<LabelTitle class="mt-4 -mb-2" title={children?.filter(({ type }) => type === "text").map(({ value }) => value).join(" ") ?? ""} />