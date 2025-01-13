<script lang="ts">
    import { prefersReducedMotion } from "svelte/motion";
    import { twMerge } from "tailwind-merge";

    import { Random, Vector } from "../../utils";

    interface Props {
        label: string;
        editable?: boolean;
        
        value?: string;
        placeholder?: string;

        oninput?: (val: string) => void;

        href?: string;
        src?: string;

        class?: string;
        onclick?: VoidFunction;
    }
    
    let button: HTMLButtonElement;
    
    // svelte-ignore non_reactive_update
    let inputElement: HTMLInputElement;

    // svelte-ignore non_reactive_update
    let link: HTMLAnchorElement;

    let {
        label,
        editable = false,

        value = $bindable(label),
        placeholder = label,

        oninput: input = () => {},

        href,
        src,

        class: className,
        onclick: click = () => {}
    }: Props = $props();

    const scale = $state(Vector.One.toObj());
    resetScale();

    function resetScale() {
        if (prefersReducedMotion.current) {
            Vector.valToObj(scale, 1.0);
            return;
        }

        const values: number[] = [];
        for (const _ of Array(2).keys()) {
            const expandBanner = Random.percent(75);
            const factor = expandBanner ? 1 / Random.float(0.72, 0.92) : Math.log(Random.float(2.1, 2.6));
            
            values.push(factor);
        }

        Vector.arrToObj(values, scale);
    }

    function onclick() {
        // if people complain that they need to double click on mobile, tell them its a feature ;)
        (href
            ? link
            : editable
                ? inputElement
                : button
        ).focus();
        
        click();
    }
</script>

<button bind:this={button} class={twMerge("group aspect-[410_/_100] relative w-[205px] h-12.5 text-xl tracking-wide text-inactive text-nowrap outline-none", editable ? "focus-within:text-active" : "focus:text-active", className)} aria-label={label} {onclick} onpointerenter={() => document.hasFocus() && button.focus()} onfocus={() => Vector.One.cloneObj(scale)} onblur={resetScale}>
    <img src="/static/ui/banner.png" alt="" class="opacity-0 {editable ? "group-focus-within:opacity-100" : "group-focus:opacity-100"} transition-transform duration-75 ease-linear" style:transform={Vector.objToStr(scale, "scale({x}, {y})")} width="205" height="auto" draggable="false" role="presentation" aria-hidden="true" />
    
    <div class={["absolute top-1/2 left-1/2 text-center -translate-1/2", { "flex flex-row gap-2 justify-center items-center text-sm": src }]}>
        {#if editable}
            <input bind:this={inputElement} type="text" bind:value class="{src ? "w-24" : "w-36"} text-center placeholder-inactive text-ellipsis outline-none" name={label} placeholder={placeholder} autocomplete="off" oninput={() => input(value)} onfocus={() => Vector.One.cloneObj(scale)} onblur={resetScale} />
        {:else if href}
            <a bind:this={link} {href} target="_blank">{label}</a>
        {:else}
            <p>{label}</p>
        {/if}

        {#if src}
            <img {src} alt="" width="24" height="auto" draggable="false" role="presentation" aria-hidden="true" />
        {/if}
    </div>
</button>