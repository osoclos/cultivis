<script lang="ts" module>
    import type { HastElement } from "svelte-exmarkdown/types";
    declare const $ctx: HastElement;
</script>

<script lang="ts">
    import { getAstNode } from "svelte-exmarkdown/contexts";
    
    const ctx = getAstNode();
    const { children } = $derived($ctx);
</script>

<ul class="flex flex-col gap-1 font-subtitle list-disc text-active">
    {#each (children ?? []).filter(({ type }) => type === "element") as { children: texts }, i (i)}
        <li class="ml-8 text-active">{texts?.filter(({ type }) => type === "text").map(({ value }) => value).join(" ") ?? ""}</li>
    {/each}
</ul>