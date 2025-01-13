<script lang="ts" module>
    import type { HastElement, HastNode } from "svelte-exmarkdown/types";
    declare const $astCtx: HastElement;
</script>

<script lang="ts">
    import { getAstNode } from "svelte-exmarkdown/contexts";

    const astCtx = getAstNode();
</script>

{#if $astCtx.type === "element" && $astCtx.tagName === "h1" && $astCtx.children.every(({ type }) => Array<HastNode["type"]>("text", "comment").includes(type))}
    <h1>
        {#each $astCtx.children as child, i (i)}
            {child}
        {/each}
    </h1>
{/if}