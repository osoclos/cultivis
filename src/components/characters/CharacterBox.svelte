<script lang="ts">
    import type { Action } from "svelte/action";
    import { twMerge } from "tailwind-merge";

    import { Tickbox } from "../base";
    import { SpritesheetImage } from "../utils";

    import type { ActorObject } from "../../scripts";
    import { isBishopObj, isFollowerObj, isTOWW_Obj, isPlayerObj, isMiniBossObj, isWitnessObj } from "../../scripts/characters";
    import { soundManager } from "../../scripts/managers";

    import { bishopData, followerData, towwData, playerData, miniBossData, witnessData } from "../../data/files";
    import { BISHOP_IDS, MINI_BOSS_CATEGORIES, followerIdsByCategory, PLAYER_CREATURE_IDS, WITNESS_IDS, miniBossIdsByCategory, FOLLOWER_CATEGORIES } from "../../data/types";

    interface Props {
        actor: ActorObject;

        hasTickbox?: boolean;
        ticked?: boolean;

        isOnPhone?: boolean;

        class?: string;
        onclick?: VoidFunction;

        oninput?: (ticked: boolean) => void;
    }

    let {
        actor = $bindable(),

        hasTickbox = $bindable(false),
        ticked = $bindable(),

        class: className,
        onclick: click = () => {},

        oninput: input = () => {}
    }: Props = $props();

    let button: HTMLButtonElement;
    const { label } = $derived(actor);

    const typeName: string = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor): return "Follower";
            case isPlayerObj(actor): return "Player";

            case isBishopObj(actor): return "Bishop";
            case isTOWW_Obj(actor): return "T.O.W.W.";

            case isMiniBossObj(actor): return "Mini Boss";
            case isWitnessObj(actor): return "Witness";
            
            default: return "Actor";
        }
    });

    const info: string = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor): return `Form: ${followerData.forms[actor.form].name}`;
            case isPlayerObj(actor): return `Creature: ${playerData.creatures[actor.creature].name}`;

            case isBishopObj(actor): return `Bishop: ${bishopData[actor.bishop].name}`;
            case isTOWW_Obj(actor): return `Form: ${towwData[actor.form].name}`;

            case isMiniBossObj(actor): return `Boss: ${miniBossData[actor.miniBoss].name}`;
            case isWitnessObj(actor): return `Witness: ${witnessData[actor.witness].name}`;
            
            default: return "";
        }
    });

    const src: string = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor): return "/static/assets/followers.png";
            case isPlayerObj(actor): return "/static/assets/player.png";

            case isBishopObj(actor):
            case isTOWW_Obj(actor): return "/static/assets/crowns.png";

            case isMiniBossObj(actor): return "/static/assets/mini-bosses.png";
            case isWitnessObj(actor): return "/static/assets/witnesses.png";
            
            default: return "/static/ui/cancel.png";
        }
    });

    const x: number = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor): return followerIdsByCategory[FOLLOWER_CATEGORIES[y]].indexOf(actor.form);
            case isPlayerObj(actor): return PLAYER_CREATURE_IDS.indexOf(actor.creature);

            case isBishopObj(actor): return BISHOP_IDS.indexOf(actor.bishop);
            case isTOWW_Obj(actor): return BISHOP_IDS.length;

            case isMiniBossObj(actor): return miniBossIdsByCategory[MINI_BOSS_CATEGORIES[y]].indexOf(actor.miniBoss);
            case isWitnessObj(actor): return WITNESS_IDS.indexOf(actor.witness);

            default: return 0;
        }
    });

    const y: number = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor): return followerData.forms[actor.form].category;
            case isMiniBossObj(actor): return miniBossData[actor.miniBoss].category;

            case isPlayerObj(actor):

            case isBishopObj(actor):
            case isTOWW_Obj(actor):
                
            case isWitnessObj(actor):
            
            default: return 0;
        }
    });

    const tileWidth: number = $derived.by(() => {
        switch (src) {
            case "/static/ui/cancel.png": return 100;
            case "/static/assets/crowns.png": return 200;

            default: return 64;
        }
    });

    const tileHeight: number = $derived.by(() => {
        switch (src) {
            case "/static/ui/cancel.png": return 100;
            case "/static/assets/crowns.png": return 200;

            default: return 64;
        }
    });

    function onclick() {
        if (!hasTickbox) {
            click();
            return;
        }

        button.focus();

        ticked = !ticked;
        input(ticked);
    }

    const focusEvent: Action<HTMLButtonElement> = (button) => {
        function focus() {
            button.focus();
        }

        $effect(() => {
            button.addEventListener("click", focus);
            button.addEventListener("pointerenter", focus);

            return () => {
                button.removeEventListener("click", focus);
                button.removeEventListener("pointerenter", focus);
            }
        });
    };
</script>

<button bind:this={button} use:focusEvent class={twMerge("flex flex-row justify-between items-center py-4 w-90 bg-dark rounded-xs outline-0 focus:outline-3 outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75", hasTickbox ? "px-4 sm:w-100" : "px-6", className)} aria-label={label} {onclick} onfocus={() => soundManager.play("Flicker")}>
    <div class="w-20 h-20">
        <SpritesheetImage {src} {label} {x} {y} width={80} height={80} {tileWidth} {tileHeight} />
    </div>
    
    <div class="flex flex-col {hasTickbox ? "gap-1 sm:gap-2" : "gap-2"} text-center text-active text-nowrap">
        <p class="{hasTickbox ? "text-lg sm:text-xl" : "text-xl"}">{label}</p>
        <p class="font-subtitle {hasTickbox ? "text-xs sm:text-sm" : "text-sm"} italic">Type: {typeName}{info ? ` | ${info}` : ""}</p>
    </div>

    {#if hasTickbox}
        <div class="flex flex-row gap-1.5">
            <div class="flex flex-col gap-2 justify-between items-center h-10">
                <img src="/static/ui/swirl.png" alt="" class="aspect-[116_/_56] w-6 h-3 rotate-90" width="29" height="14" draggable="false" role="presentation" aria-hidden="true" />
                <img src="/static/ui/swirl.png" alt="" class="aspect-[116_/_56] w-6 h-3 -rotate-90 -scale-y-100" width="29" height="14" draggable="false" role="presentation" aria-hidden="true" />
            </div>

            <Tickbox bind:ticked toggleable label="Select Actor?" {onclick} />
        </div>
    {/if}
</button>