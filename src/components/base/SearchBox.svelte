<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { twMerge } from "tailwind-merge";

    import { soundManager } from "../../scripts/managers";

    interface Props {
        val?: string;
        oninput?(val: string): any;

        label: string;

        class?: string;
    }

    let {
        val = $bindable(""),
        oninput: input = () => {},

        label,

        class: className = ""
    }: Props = $props();

    const isSearchTagSupported = $derived.by(() => {
        const elt = document.createElement("search");
        return elt instanceof HTMLElement && elt.nodeName.toLowerCase() === "search";
    });

    let labelElt: HTMLLabelElement;
    let inputElt: HTMLInputElement;

    let parentElt: HTMLElement;

    onMount(() => {
        if (isSearchTagSupported) parentElt = document.createElement("search");
        else {
            parentElt = document.createElement("div");
            parentElt.role = "search";
        }

        parentElt.className = twMerge("mb-4 w-full", className);

        labelElt.replaceWith(parentElt);
        parentElt.appendChild(labelElt);
    });

    onDestroy(() => parentElt.remove());

    function onInput() {
        const { value } = inputElt;

        val = value;
        input(value);
    }
</script>

<label bind:this={labelElt} class="group inline-block relative w-full h-6.5 select-none" aria-label={label}>
    <img src="/static/ui/search-magnifier.png" alt="" class="aspect-[73_/_70] absolute top-1/2 left-1 z-10 w-4.5 h-4.25 -translate-y-1/2 pointer-events-none" width="18" height="17" draggable="false" role="presentation" aria-hidden="true" />
    <span class="relative z-10 left-6.75 text-inactive {val === "" ? "opacity-100" : "opacity-0"} group-hover:text-active group-focus-within:opacity-0 not-motion-reduce:transition-opacity not-motion-reduce:duration-75 pointer-events-none">Search</span>
    <input bind:this={inputElt} class="absolute top-0 left-0 py-3.5 pl-6.75 w-full h-5 text-inactive hover:text-active focus-within:text-active bg-dark rounded-xs outline-0 focus-within:outline-3 outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75 [&::-webkit-search-cancel-button]:aspect-square [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:h-5 [&::-webkit-search-cancel-button]:bg-inactive hover:[&::-webkit-search-cancel-button]:bg-active focus-within:[&::-webkit-search-cancel-button]:bg-active [&::-webkit-search-cancel-button]:bg-blend-multiply [&::-webkit-search-cancel-button]:mask-[url('/static/ui/search-cancel.svg')] [&::-webkit-search-cancel-button]:mask-center [&::-webkit-search-cancel-button]:mask-no-repeat [&::-webkit-search-cancel-button]:mask-contain" type="search" value={val} oninput={onInput} onpointerenter={() => soundManager.play("Flicker")}>
</label>
