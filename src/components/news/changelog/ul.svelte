<script lang="ts">
    import { getAstNode } from "svelte-exmarkdown";

    const ctx = getAstNode();
    const { children } = $derived(ctx.current);
</script>

<ul class="flex flex-col gap-1 font-subtitle list-image-[url('/static/ui/list-bullet.png')] text-active">
    {#each (children ?? []).filter(({ type }) => type === "element") as { children: texts }, i (i)}
        <li class="pl-2 ml-6 text-active">{texts?.filter(({ type }) => type === "text").map(({ value }) => value).join(" ") ?? ""}</li>
    {/each}
</ul>
