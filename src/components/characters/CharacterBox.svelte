<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { Tickbox } from "../base";
    import { SpritesheetImage } from "../utils";

    import type { ActorObject } from "../../scripts";
    import { isBishopObj, isFollowerObj, isGuardObj, isHereticObj, isKnucklebonesPlayerObj, isMachineObj, isMiniBossObj, isModdedFollowerObj, isOccultistObj, isPlayerObj, isQuestGiverObj, isShopkeeperObj, isSoldierObj, isTOWW_Obj, isWitnessObj } from "../../scripts/characters";
    import { soundManager } from "../../scripts/managers";

    import { bishopData, followerData, guardData, hereticData, knucklebonesPlayerData, machineData, miniBossData, occultistData, playerData, questGiverData, shopkeeperData, soldierData, towwData, witnessData } from "../../data/files";
    import { BISHOP_IDS, followerIdsByCategory, FOLLOWER_CATEGORIES, guardIdsByCategory, GUARD_CATEGORIES, hereticIdsByCategory, HERETIC_CATEGORIES, KNUCKLEBONES_PLAYER_IDS, machineIdsByCategory, MACHINE_CATEGORIES, miniBossIdsByCategory, MINI_BOSS_CATEGORIES, OCCULTIST_IDS, PLAYER_CREATURE_IDS, SOLDIER_IDS, WITNESS_IDS, QUEST_GIVER_IDS, shopkeeperIdsByCategory, SHOPKEEPER_CATEGORIES } from "../../data/types";

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
            case isFollowerObj(actor):
            case isModdedFollowerObj(actor): return "Follower";

            case isPlayerObj(actor): return "Player";

            case isSoldierObj(actor): return "Soldier";
            case isOccultistObj(actor): return "Occultist";
            case isGuardObj(actor): return "Guard";

            case isHereticObj(actor): return "Heretic";
            case isMachineObj(actor): return "Machine";

            case isBishopObj(actor): return "Bishop";
            case isTOWW_Obj(actor): return "T.O.W.W.";

            case isMiniBossObj(actor): return "Mini Boss";
            case isWitnessObj(actor): return "Witness";

            case isKnucklebonesPlayerObj(actor): return "K.B. Player";
            case isQuestGiverObj(actor): return "Quest Giver";
            case isShopkeeperObj(actor): return "Shopkeeper";
            
            default: return "Actor";
        }
    });

    const info: string = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor):
            case isModdedFollowerObj(actor): return `Form: ${followerData.forms[actor.form].name}`;

            case isPlayerObj(actor): return `Creature: ${playerData.creatures[actor.creature].name}`;

            case isSoldierObj(actor): return `Role: ${soldierData[actor.soldier].name}`;
            case isOccultistObj(actor): return `Role: ${occultistData[actor.occultist].name}`;
            case isGuardObj(actor): return `Role ${guardData[actor.guard].name}`;

            case isHereticObj(actor): return `Enemy: ${hereticData[actor.heretic].name}`;
            case isMachineObj(actor): return `Mechanic: ${machineData[actor.machine].name}`;

            case isBishopObj(actor): return `Bishop: ${bishopData[actor.bishop].name}`;
            case isTOWW_Obj(actor): return `Form: ${towwData[actor.form].name}`;

            case isMiniBossObj(actor): return `Boss: ${miniBossData[actor.miniBoss].name}`;
            case isWitnessObj(actor): return `Witness: ${witnessData[actor.witness].name}`;

            case isKnucklebonesPlayerObj(actor): return `Player: ${knucklebonesPlayerData[actor.player].name}`;
            case isQuestGiverObj(actor): return `Giver: ${questGiverData[actor.giver].name}`;
            case isShopkeeperObj(actor): return `Keeper: ${shopkeeperData[actor.shopkeeper].name}`;

            default: return "";
        }
    });

    const src: string = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor):
            case isModdedFollowerObj(actor): return "/static/assets/characters/followers.png";

            case isPlayerObj(actor): return "/static/assets/characters/player.png";

            case isSoldierObj(actor): return "/static/assets/characters/soldiers.png";
            case isOccultistObj(actor): return "/static/assets/characters/occultists.png";
            case isGuardObj(actor): return "/static/assets/characters/guards.png";

            case isHereticObj(actor): return "/static/assets/characters/heretics.png";
            case isMachineObj(actor): return "/static/assets/characters/machines.png";

            case isBishopObj(actor):
            case isTOWW_Obj(actor): return "/static/assets/characters/crowns.png";

            case isMiniBossObj(actor): return "/static/assets/characters/mini-bosses.png";
            case isWitnessObj(actor): return "/static/assets/characters/witnesses.png";

            case isKnucklebonesPlayerObj(actor): return "/static/assets/characters/knucklebones-players.png";
            case isQuestGiverObj(actor): return "/static/assets/characters/quest-givers.png";
            case isShopkeeperObj(actor): return "/static/assets/characters/shopkeepers.png";

            default: return "/static/ui/cancel.png";
        }
    });

    const x: number = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor):
            case isModdedFollowerObj(actor): return followerIdsByCategory[FOLLOWER_CATEGORIES[y]].indexOf(actor.form);

            case isPlayerObj(actor): return PLAYER_CREATURE_IDS.indexOf(actor.creature);

            case isSoldierObj(actor): return SOLDIER_IDS.indexOf(actor.soldier);
            case isOccultistObj(actor): return OCCULTIST_IDS.indexOf(actor.occultist);
            case isGuardObj(actor): return guardIdsByCategory[GUARD_CATEGORIES[y]].indexOf(actor.guard);

            case isHereticObj(actor): return hereticIdsByCategory[HERETIC_CATEGORIES[y]].indexOf(actor.heretic);
            case isMachineObj(actor): return machineIdsByCategory[MACHINE_CATEGORIES[y]].indexOf(actor.machine);

            case isBishopObj(actor): return BISHOP_IDS.indexOf(actor.bishop);
            case isTOWW_Obj(actor): return BISHOP_IDS.length;

            case isMiniBossObj(actor): return miniBossIdsByCategory[MINI_BOSS_CATEGORIES[y]].indexOf(actor.miniBoss);
            case isWitnessObj(actor): return WITNESS_IDS.indexOf(actor.witness);

            case isKnucklebonesPlayerObj(actor): return KNUCKLEBONES_PLAYER_IDS.indexOf(actor.player);
            case isQuestGiverObj(actor): return QUEST_GIVER_IDS.indexOf(actor.giver);
            case isShopkeeperObj(actor): return shopkeeperIdsByCategory[SHOPKEEPER_CATEGORIES[y]].indexOf(actor.shopkeeper);

            default: return 0;
        }
    });

    const y: number = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor):
            case isModdedFollowerObj(actor): return followerData.forms[actor.form].category;
            
            case isGuardObj(actor): return guardData[actor.guard].category;

            case isHereticObj(actor): return hereticData[actor.heretic].category;
            case isMachineObj(actor): return machineData[actor.machine].category;

            case isMiniBossObj(actor): return miniBossData[actor.miniBoss].category;

            case isShopkeeperObj(actor): return shopkeeperData[actor.shopkeeper].category;

            case isPlayerObj(actor):

            case isSoldierObj(actor):
            case isOccultistObj(actor):

            case isBishopObj(actor):
            case isTOWW_Obj(actor):
                
            case isWitnessObj(actor):

            case isKnucklebonesPlayerObj(actor):
            case isQuestGiverObj(actor):
            
            default: return 0;
        }
    });

    const tileWidth: number = $derived.by(() => {
        switch (src) {
            case "/static/ui/cancel.png": return 100;
            case "/static/assets/characters/crowns.png": return 200;

            default: return 64;
        }
    });

    const tileHeight: number = $derived.by(() => {
        switch (src) {
            case "/static/ui/cancel.png": return 100;
            case "/static/assets/characters/crowns.png": return 200;

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

        soundManager.play("Click");
    }
</script>

<button bind:this={button} class={twMerge("flex flex-row justify-between items-center py-4 w-90 bg-dark rounded-xs outline-0 focus:outline-3 outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75", hasTickbox ? "px-4 sm:w-100" : "px-6", className)} aria-label={label} {onclick} onpointerenter={() => button.focus()} onfocus={() => soundManager.play("Flicker")}>
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