<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        title: string;
        subtitle?: string;

        class?: string;
        style?: string;
    }
    
    const { title, subtitle, class: className, style }: Props = $props();
</script>

<span class={twMerge("-mx-2 flex flex-row justify-between font-subtitle italic text-inactive", className)} {style}>
    <h2>{title}</h2>
    {#if subtitle}
        <p>{subtitle}</p>
    {/if}
</span>
