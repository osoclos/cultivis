<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        label: string;
        class?: string;
    }

    const { label, class: className }: Props = $props();
</script>

<div class={twMerge("flex flex-row gap-4 items-center", className)}>
    <img src="/static/ui/attention.png" alt="" class="not-motion-reduce:oscillate w-7 h-7" width="28" height="28" draggable="false" role="presentation" aria-hidden="true" />
    <p class="font-subtitle italic text-bright">{label}</p>
</div>

<style>
    .oscillate {
        animation: oscillate;
        animation-duration: 1500ms;
        animation-timing-function: cubic-bezier(0.455, 0.03, 0.515, 0.955);
        animation-iteration-count: infinite;
        animation-direction: alternate;
    }

    @keyframes oscillate {
        from { transform: rotate(-15deg); }
        to { transform: rotate(15deg); }
    }
</style>