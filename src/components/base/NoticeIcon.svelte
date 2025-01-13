<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props { class?: string; }
    const { class: className }: Props = $props();
</script>

<img src="/static/ui/attention.png" alt="" class={twMerge("oscillate w-7 h-7", className)} width="28" height="28" draggable="false" role="presentation" aria-hidden="true" />

<style>
    @media not (prefers-reduced-motion) {
        .oscillate {
            animation: oscillate;
            animation-duration: 1500ms;
            animation-timing-function: cubic-bezier(0.455, 0.03, 0.515, 0.955);
            animation-iteration-count: infinite;
            animation-direction: alternate;
        }
    }

    @keyframes oscillate {
        from { transform: rotate(-15deg); }
        to { transform: rotate(15deg); }
    }
</style>