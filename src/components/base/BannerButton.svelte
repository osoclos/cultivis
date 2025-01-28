<script lang="ts">
    import { prefersReducedMotion } from "svelte/motion";
    import { twMerge } from "tailwind-merge";
    
    import NoticeIcon from "./NoticeIcon.svelte";

    import { soundManager } from "../../scripts/managers";
    import { Random, Vector } from "../../utils";

    interface Props {
        label: string;
        editable?: boolean;
        
        value?: string;
        placeholder?: string;

        disabled?: boolean;
        hasNotice?: boolean;

        playClickSound?: boolean;

        href?: string;
        src?: string;

        class?: string;

        onclick?: VoidFunction;
        oninput?: (val: string) => void;
        onnotice?: VoidFunction;
    }
    
    let button: HTMLButtonElement;
    let inputElement: HTMLInputElement = $state(document.createElement("input"));

    let {
        label,
        editable = false,

        value = $bindable(label),
        placeholder = label,

        disabled = false,
        hasNotice = false,

        playClickSound = true,

        href,
        src,

        class: className,

        onclick: click = () => {},
        oninput: input = () => {},
        onnotice: notice = () => {}
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

        if (href) {
            const link = document.createElement("a");
            link.href = href;
            link.target = "_blank";

            link.click();
        }

        playClickSound && !editable && soundManager.play("Click");

        (editable ? inputElement : button).focus();
        click();
    }

    function onfocus() {
        Vector.One.cloneObj(scale);
        soundManager.play("Flicker");
        
        if (!hasNotice) return;
        hasNotice = false;

        notice();
    }

    function onInputFocus() {
        Vector.One.cloneObj(scale);
        playClickSound && soundManager.play("Click");
    }
</script>

<button bind:this={button} class={twMerge("group aspect-[410_/_100] relative w-[205px] h-12.5 text-xl tracking-wide text-inactive disabled:text-disabled text-nowrap outline-none", editable ? "focus-within:text-active" : "focus:text-active", className)} {disabled} aria-label={label} {onclick} onpointerenter={() => document.hasFocus() && button.focus()} {onfocus} onblur={resetScale}>
    <img src="/static/ui/banner.png" srcset="/static/ui/banner.webp, /static/ui/banner.png" alt="" class="opacity-0 {editable ? "group-focus-within:opacity-100" : "group-focus:opacity-100"} transition-transform duration-75 ease-linear" style:transform={Vector.objToStr(scale, `scale(${Vector.DEFAULT_STR_FORMAT})`)} width="205" height="50" draggable="false" role="presentation" aria-hidden="true" />
    
    <div class={["absolute top-1/2 left-1/2 text-center -translate-1/2", { "flex flex-row gap-2 justify-center items-center text-sm": src }]}>
        {#if editable}
            <input bind:this={inputElement} type="text" bind:value class="{src ? "w-24" : "w-36"} text-center placeholder-inactive group-focus:placeholder-active focus:placeholder-active disabled:placeholder-disabled text-ellipsis outline-none" name={label} placeholder={placeholder} {disabled} autocomplete="off" oninput={() => input(value)} onfocus={onInputFocus} onblur={resetScale} />
        {:else}
            <p role={href ? "link" : "text"} aria-label={href}>{label}</p>
        {/if}

        {#if src}
            <img {src} alt="" width="24" height="24" draggable="false" role="presentation" aria-hidden="true" />
        {/if}
    </div>

    {#if hasNotice}
        <NoticeIcon class="absolute top-0 right-0 z-10 w-6 h-6 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    {/if}
</button>