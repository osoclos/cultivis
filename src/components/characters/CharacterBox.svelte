<script lang="ts">
    import type { Action } from "svelte/action";
    import { twMerge } from "tailwind-merge";

    import { SpritesheetImage } from "../utils";

    import type { ActorObject } from "../../scripts";
    import { isBishopObj, isFollowerObj, isTOWW_Obj, isPlayerObj } from "../../scripts/characters";

    import { bishopData, followerData, towwData, playerData } from "../../data";
    import { BISHOP_IDS, FOLLOWER_CATEGORIES, followerIdsByCategory, PLAYER_CREATURE_IDS } from "../../data/types";

    interface Props {
        actor: ActorObject;

        class?: string;
        onclick?: VoidFunction;
    }

    const {
        actor = $bindable(),

        class: className,
        onclick = () => {}
    }: Props = $props();

    const { label } = $derived(actor);
    
    function getType(): string {
        switch (true) {
            case isFollowerObj(actor): return "Follower";
            case isPlayerObj(actor): return "Player";
            case isBishopObj(actor): return "Bishop";
            case isTOWW_Obj(actor): return "T.O.W.W.";
            
            default: return "Actor";
        }
    }

    function getInfo(): string {
        switch (true) {
            case isFollowerObj(actor): return `Form: ${followerData.forms[actor.form].name}`;
            case isPlayerObj(actor): return `Creature: ${playerData.creature[actor.creature].name}`;
            case isBishopObj(actor): return `Bishop: ${bishopData[actor.bishop].name}`;
            case isTOWW_Obj(actor): return `Form: ${towwData[actor.form].name}`;
            
            default: return "";
        }
    }

    function getSrc(): string {
        switch (true) {
            case isFollowerObj(actor): return "/static/assets/followers.png";
            case isPlayerObj(actor): return "/static/assets/player.png";

            case isBishopObj(actor):
            case isTOWW_Obj(actor): return "/static/assets/crowns.png";
            
            default: return "/static/ui/cancel.png";
        }
    }isTOWW_Obj

    function getX(): number {
        switch (true) {
            case isFollowerObj(actor): return followerIdsByCategory[FOLLOWER_CATEGORIES[getY()]].indexOf(actor.form);
            case isPlayerObj(actor): return PLAYER_CREATURE_IDS.indexOf(actor.creature);

            case isBishopObj(actor): return BISHOP_IDS.indexOf(actor.bishop);
            case isTOWW_Obj(actor): return BISHOP_IDS.length;

            default: return 0;
        }
    }

    function getY(): number {
        switch (true) {
            case isFollowerObj(actor): return followerData.forms[actor.form].category;

            case isPlayerObj(actor):

            case isBishopObj(actor):
            case isTOWW_Obj(actor):
            
            default: return 0;
        }
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

<button use:focusEvent class={twMerge("flex flex-row justify-between items-center px-6 py-4 w-90 bg-dark rounded-xs outline-0 focus:outline-3 outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75", className)} aria-label={label} {onclick}>
    <div class="w-20 h-20">
        <SpritesheetImage {label} src={getSrc()} x={getX()} y={getY()} width={80} height={80} tileWidth={getSrc() === "/static/ui/cancel.png" ? 100 : 64} tileHeight={getSrc() === "/static/ui/cancel.png" ? 100 : 64} />
    </div>
    
    <div class="flex flex-col gap-2 text-center text-active text-nowrap">
        <p class="text-xl">{label}</p>
        <p class="font-subtitle text-sm italic">Type: {getType()}{getInfo() ? ` | ${getInfo()}` : ""}</p>
    </div>
</button>