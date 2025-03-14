<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        options?: string[] | Record<string, string>;
        value: string;

        label: string;

        class?: string;
        oninput?: (value: string) => void;
    }
    
    let {
        options: originalOptions = [],
        value = $bindable(),

        label,

        class: className,
        oninput: input = () => {}
    }: Props = $props();

    let dropdown: HTMLSelectElement;
    const options: Record<string, string> = $derived(Array.isArray(originalOptions) ? Object.fromEntries(originalOptions.map((option) => [option, option])) : originalOptions);
</script>

<select bind:this={dropdown} class={twMerge("no-scrollbar overflow-x-clip overflow-y-auto px-2 py-1 w-48 font-subtitle text-sm text-center text-inactive hover:text-active focus:text-active checked:text-active text-ellipsis bg-dark rounded-xs outline-0 hover:outline-3 focus:outline-3 outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75 appearance-none", className)} bind:value name={label} autocomplete="off" onchange={() => input(value)} onfocus={() => dropdown.size = 4} onblur={() => dropdown.size = 0}>
    {#each Object.entries(options) as [id, option] (id)}
        <option class="overflow-x-clip text-ellipsis p-1 my-1 text-center bg-secondary even:bg-dark checked:bg-gradient-to-r checked:from-highlight checked:to-highlight rounded-xs outline-0 not-checked:hover:outline-3 outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75" value={id}>{option}</option>
    {/each}
</select>