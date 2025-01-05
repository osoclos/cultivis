<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        title: string;
        class?: string;
    }

    const { title, class: className }: Props = $props();
</script>

<div class={twMerge("flex flex-row gap-1.5 justify-center items-center", className)} tabindex="-1">
    <img src="/static/ui/swirl.png" alt="" class="aspect-[116_/_56] w-12.5 h-6" width="58" height="28" draggable="false" role="presentation" aria-hidden="true" />
    <h1 class="text-[1.4rem] tracking-wide text-center text-active">{title}</h1>
    <img src="/static/ui/swirl.png" alt="" class="aspect-[116_/_56] w-12.5 h-6 -scale-x-100" width="58" height="28" draggable="false" role="presentation" aria-hidden="true" />
</div>