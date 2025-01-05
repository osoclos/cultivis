<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        key: string;
        label?: string;

        class?: string;
    }

    const { key, label, class: className }: Props = $props();
</script>

<div class={twMerge("flex flex-row gap-3 items-center", className)}>
    <div class="aspect-square grid place-items-center w-7 bg-active rounded">
        <p class="text-[17px] text-undertone">{key}</p>
    </div>

    {#if label}
        <p class="text-xs text-active">{label}</p>
    {/if}
</div>