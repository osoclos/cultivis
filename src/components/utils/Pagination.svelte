<script lang="ts">
    import { onDestroy, onMount, type Snippet } from "svelte";
    import { twMerge } from "tailwind-merge";

    import { soundManager } from "../../scripts/managers";
    import { MoreMath } from "../../utils";

    interface Props {
        children?: Snippet<[number]>;

        label: string;

        enableKeyInput?: boolean;
        selectedIdx?: number;
        
        class?: string;
        onclick?: (i: number) => void;
    }

    let {
        children,

        label,

        enableKeyInput = false,
        selectedIdx = $bindable(+!!children - 1),

        class: className,
        onclick: click = () => {}
    }: Props = $props();

    let container: HTMLDivElement;

    function onclick({ target }: MouseEvent) {
        const elements = [...container.children] as HTMLElement[];
        
        const i = elements.findIndex((element) => element.contains(target as HTMLElement));
        if (i < 0 || i === selectedIdx) return;
        
        selectedIdx = i;
        click(selectedIdx);
    }

    const abortController = new AbortController();

    onMount(() => addEventListener("keydown", (evt: KeyboardEvent) => {
        if (!children) return;

        const { code, ctrlKey, altKey } = evt;
        if (!["KeyQ", "KeyR"].includes(code) || ctrlKey || altKey || document.activeElement instanceof HTMLInputElement || !enableKeyInput) return;

        evt.preventDefault();

        const toNextElement = code === "KeyR";
        const idxOffset = +toNextElement || -1;

        const elements = [...container.children] as HTMLElement[];

        const i = MoreMath.clamp(selectedIdx + idxOffset, 0, elements.length - 1);
        if (i !== selectedIdx + idxOffset) return;

        selectedIdx = i;

        soundManager.play("Option_Change");
        click(selectedIdx);
    }, { signal: abortController.signal }));

    onDestroy(() => abortController.abort());
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div bind:this={container} class={twMerge("flex flex-row", className)} role="navigation" aria-label={label} {onclick}>
    {@render children?.(selectedIdx)}
</div>