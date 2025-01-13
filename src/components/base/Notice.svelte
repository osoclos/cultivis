<script lang="ts">
    import { twMerge } from "tailwind-merge";
    import NoticeIcon from "./NoticeIcon.svelte";

    interface Props {
        label: string;
        class?: string;
    }

    const { label, class: className }: Props = $props();
</script>

<div class={twMerge("flex flex-row gap-4 items-center", className)}>
    <NoticeIcon />
    <p class="font-subtitle italic text-bright">{label}</p>
</div>