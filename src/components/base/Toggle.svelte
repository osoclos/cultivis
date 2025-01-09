<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        enabled?: boolean;
        label: string;

        class?: string;
        oninput?: (enabled: boolean) => void;
    }

    let {
        enabled = $bindable(false),
        label,

        class: className,
        oninput: input = () => {}
    }: Props = $props();

    function onclick() {
        enabled = !enabled;
        input(enabled);
    }
</script>

<button class={twMerge("relative outline-none", className)} name={label} role="checkbox" aria-checked={enabled} {onclick}>
    <img src="/static/ui/toggle-base.png" alt="" class="w-18.5 h-10 {enabled ? "brightness-185 saturate-200" : "brightness-140 saturate-0"} hue-rotate-168 not-motion-reduce:transition-[filter] not-motion-reduce:duration-150 ease-linear" width="74" height="40" draggable="false" role="presentation" aria-hidden="true" />
    <img src="/static/ui/toggle-lever.png" alt="" class="absolute top-1/2 {enabled ? "left-10" : "left-1"} not-motion-reduce:transition-[left] not-motion-reduce:duration-150 ease-[cubic-bezier(0.2,_0,_0.4,_1)] -translate-y-1/2" width="30" height="30" draggable="false" role="presentation" aria-hidden="true" />
</button>
