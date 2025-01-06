<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        key: string;
        code?: string;

        label?: string;

        class?: string;
    }

    const {
        key,
        code,

        label,
        
        class: className
    }: Props = $props();
</script>

<button class={twMerge("flex flex-row gap-3 items-center", className)} name={label ?? key} onclick={() => code && dispatchEvent(new KeyboardEvent("keydown", { code }))}>
    <div class="aspect-square grid place-items-center w-7 bg-active rounded">
        <p class="text-[17px] text-undertone">{key}</p>
    </div>

    {#if label}
        <p class="text-xs text-active">{label}</p>
    {/if}
</button>