<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        ticked?: boolean;
        toggleable?: boolean;

        label: string;
        
        class?: string;
        onclick?: (ticked: boolean) => void;
    }

    let {
        ticked = $bindable(false),
        toggleable = $bindable(false),

        label,

        class: className,
        onclick: click = () => {}
    }: Props = $props();

    function onclick() {
        if (toggleable || !ticked) ticked = !ticked;
        click(ticked);
    }
</script>

<button class={twMerge("relative outline-none", className)} name={label} role="checkbox" aria-checked={ticked} {onclick}>
    <img src="/static/ui/{ticked ? "tickbox-background" : "tickbox-outline"}.png" alt="" class="aspect-square w-9" width="35" height="35" draggable="false" role="presentation" aria-hidden="true" />
    {#if ticked}
        <img src="/static/ui/tick.png" alt="" class="absolute top-2/5 left-3/5 -translate-1/2" width="24" height="24" draggable="false" role="presentation" aria-hidden="true" />
    {/if}
</button>