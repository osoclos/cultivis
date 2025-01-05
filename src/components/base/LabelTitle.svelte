<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        title: string;
        class?: string;
    }

    const { title, class: className }: Props = $props();
</script>

<h2 class={twMerge("font-subtitle italic tracking-widest text-center text-inactive", className)}>{title}</h2>