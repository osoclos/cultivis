<script lang="ts" module>
    import { FOLLOWER_ANIMATION_IDS, FOLLOWER_IDS, type FollowerAnimationId, type FollowerId, PLAYER_BELL_IDS, PLAYER_CREATURE_IDS, PLAYER_CROWN_IDS, PLAYER_FLEECE_IDS, type PlayerBellId, type PlayerCreatureId, type PlayerCrownId, type PlayerFleeceId } from "../../data/types";
    import { followerAnimationData, followerData } from "../../data/files";

    const FOLLOWER_STARTING_NAMES: string[] = ["Ja", "Jul", "Na", "No", "Gre", "Bre", "Tre", "Mer", "Ty", "Ar", "An", "Yar", "Fe", "Fi", "The", "Thor", "Al", "Ha", "He", "Joo", "Ma", "Me", "Pa", "Pu"];
    const FOLLOWER_MIDDLE_NAMES: string[] = ["na"].concat(...FOLLOWER_STARTING_NAMES.slice(1, 11).map((name) => name.toLowerCase()));
    const FOLLOWER_ENDING_NAMES: string[] = ["on"].concat(...FOLLOWER_STARTING_NAMES.slice(1, 10).map((name) => name.toLowerCase()));

    export function getRandomFollowerName(): string {
        return Random.item(FOLLOWER_STARTING_NAMES) + (Random.bool() ? Random.item(FOLLOWER_MIDDLE_NAMES) : "") + Random.item(FOLLOWER_ENDING_NAMES);
    }

    export function getSpecialFollowerName(form: FollowerId, formVariantIdx: number, forceSpecial: boolean = false): string {
        switch (form) {
            case "Boss Death Cat":
            case "CultLeader 1":
            case "CultLeader 2":
            case "CultLeader 3":
            case "CultLeader 4":
            case "Aym":
            case "Baal":
            case "Jalala":
            case "Rinor":
            case "Webber":
            case "Boss Mama Worm":
            case "Boss Mama Maggot":
            case "Boss Burrow Worm":
            case "Boss Beholder 1":
            case "Boss Flying Burp Frog":
            case "Boss Egg Hopper":
            case "Boss Mortar Hopper":
            case "Boss Beholder 2":
            case "Boss Spiker":
            case "Boss Charger":
            case "Boss Scuttle Turret":
            case "Boss Beholder 3":
            case "Boss Spider Jump":
            case "Boss Millipede Poisoner":
            case "Boss Scorpion":
            case "Boss Beholder 4": return followerData.forms[form].name;

            // rest in peace poppy
            case "Poppy":
            case "Giraffe": return Random.percent(1) || forceSpecial
                ? form === "Giraffe"
                    ? "Sparkles" : "Poppy"
                : getRandomFollowerName();

            case "Sozo": return formVariantIdx ? "Dr. Sozonius" : "Sozo"
            default: return getRandomFollowerName();
        }
    }

    export function getRandomFollowerAppearance(): [FollowerId, number, number] {
        const form = Random.item(FOLLOWER_IDS);
        const { variants, sets } = followerData.forms[form];

        const formVariantIdx = Random.int(variants.length);
        const formColorSetIdx = Random.int(sets.length + followerData.generalColorSets.length);

        return [form, formVariantIdx, formColorSetIdx];
    }

    export function getRandomPlayerAppearance(): [PlayerCreatureId, PlayerCrownId | null, PlayerFleeceId, PlayerBellId | null] {
        const creature = Random.item(PLAYER_CREATURE_IDS);
        const crown = Random.item([...PLAYER_CROWN_IDS, null]);

        const fleece = Random.item(PLAYER_FLEECE_IDS);
        const bell = Random.item([...PLAYER_BELL_IDS, null]);

        return [creature, crown, fleece, bell];
    }
</script>

<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BannerButton, Dropdown, Header, Label, LabelTitle, NumberInput, ArrowSelection, Slider, Toggle, Notice, SearchBox } from "../base";
    import { BISHOP_MENU_NAME, GUARD_MENU_NAME, HERETIC_MENU_NAME, KNUCKLEBONES_PLAYER_MENU_NAME, MACHINE_MENU_NAME, MINI_BOSS_MENU_NAME, MODDED_FOLLOWER_SLOT_NAMES, OCCULTIST_MENU_NAME, QUEST_GIVER_MENU_NAME, SHOPKEEPER_MENU_NAME, SOLDIER_MENU_NAME, TOWW_MENU_NAME, WITNESS_MENU_NAME } from "./menus";
    import { ColorDot, ColorRows, MultiList } from "../utils";

    import { Actor, Exporter, Factory, Scene, type ActorObject } from "../../scripts";
    import { isBishopObj, isFollowerObj, isGuardObj, isHereticObj, isKnucklebonesPlayerObj, isMachineObj, isMiniBossObj, isModdedFollowerObj, isOccultistObj, isPlayerObj, isQuestGiverObj, isShopkeeperObj, isSoldierObj, isTOWW_Obj, isWitnessObj, ModdedFollower, type AllModdedFollowerSlotId } from "../../scripts/characters";
    import { soundManager } from "../../scripts/managers";

    import { bishopData, forbiddenAnimations, hereticData, machineData, miniBossData, soldierData } from "../../data/files";
    import { Color, Random, Vector, type ColorObject, type VectorObject } from "../../utils";
    import { onDestroy, onMount } from "svelte";

    interface Props {
        actor: Actor;
        obj: ActorObject;

        scene: Scene;
        actorIdx: number;

        factory: Factory;
        exporter: Exporter;

        class?: string;
        enableKeyInput?: boolean;

        useExperimentalAnimations?: boolean;

        onupdate?: VoidFunction;
        onchange?: (actor: Actor) => void;
        onreorder?: (offset: number) => void;

        onproceed?: (menu: string) => void;
        onexit?: (removeFollower: boolean) => void;
    }

    let {
        actor,
        obj,

        scene,
        actorIdx,

        factory,
        exporter,

        class: className,
        enableKeyInput = false,

        useExperimentalAnimations = $bindable(false),

        onupdate: update = () => {},
        onchange: change = () => {},
        onreorder: reorder = () => {},

        onproceed: proceed = () => {},
        onexit: exit = () => {}
    }: Props = $props();

    let selectedSlot: string | null = $state(null);
    const customSlots: Record<string, string> = $derived.by(() => {
        switch (true) {
            case isModdedFollowerObj(obj): return MODDED_FOLLOWER_SLOT_NAMES;
            default: return {};
        }
    });

    const selectedColor: ColorObject = $derived.by(() => {
        switch (true) {
            case isModdedFollowerObj(obj): return obj.colors[(selectedSlot ?? Object.keys(customSlots)[0]) as AllModdedFollowerSlotId];
            default: return Color.Black.toObj();
        }
    });

    let animationFilterTerm: string = $state("");

    const animations: string[] = $derived.by(() => {
        const { follower, player, soldier, occultist, guard } = forbiddenAnimations;
        const { animationNames } = actor;

        const actorForbiddenAnimations: string[] = (() => {
            switch (true) {
                case isFollowerObj(actor):
                case isModdedFollowerObj(actor): return follower;

                case isPlayerObj(actor): return player;

                case isSoldierObj(actor): return soldier;
                case isOccultistObj(actor): return occultist;
                case isGuardObj(actor): return guard;

                default: return [];
            }
        })();

        return animationNames.filter((name) => !(actorForbiddenAnimations.includes(`!${name}`) || actorForbiddenAnimations.some((keyword) => !keyword.startsWith("!") && name.includes(keyword)))).sort();
    });

    const experimentalAnimations: string[] = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor):
            case isModdedFollowerObj(actor): return FOLLOWER_ANIMATION_IDS;

            default: return [];
        }
    });

    const displayedAnimationNames: [string, string][] = $derived(useExperimentalAnimations && experimentalAnimations.length ? experimentalAnimations.map((id) => [id, followerAnimationData[id as FollowerAnimationId].name]).filter(([id]) => id.includes(animationFilterTerm)) as [string, string][] : animations.filter((id) => id.includes(animationFilterTerm)).map((id) => [id, id]));

    let selectedAnimationId: string | null = $state(useExperimentalAnimations && experimentalAnimations.length ? null : actor.animationId)
    let selectedExperimentalAnimationId: string | null = $state(useExperimentalAnimations && experimentalAnimations.length ? actor.animationId : null);

    let animationList: HTMLUListElement = $state(HTMLUListElement.prototype);
    let animationListAborter: AbortController;
    let animationListScrollerId: number;

    let isAnimationListScrolling: boolean = $state(false);
    let isAnimationListIdleTicks: number = 0;

    let lastAnimationListScrollTop: number = -1;
    const lastAnimationListScrollTopDiffs: number[] = [];

    const hasAttributes: boolean = $derived.by(() => {
        switch (true) {
            case isSoldierObj(obj) && isSoldierObj(actor): return soldierData[obj.soldier].canHoldShield;
            case isOccultistObj(obj) && isOccultistObj(actor):
            case isGuardObj(obj) && isGuardObj(actor): return false;

            case isHereticObj(obj) && isHereticObj(actor): return (hereticData[obj.heretic].skins.length > 1 && obj.heretic !== "Mega_Blue_Spider") || obj.heretic === "Mega_Blue_Spider" || "backSkins" in hereticData[obj.heretic];
            case isMachineObj(obj) && isMachineObj(actor): return machineData[obj.machine].skins.length > 1;

            case isQuestGiverObj(obj) && isQuestGiverObj(actor): return obj.giver === "Midas";
            case isShopkeeperObj(obj) && isShopkeeperObj(actor): return obj.shopkeeper === "Berith";

            default: return true;
        }
    });

    onMount(() => {
        animationListAborter = new AbortController();

        [...animationList.children].find(({ ariaSelected }) => ariaSelected === "true")?.scrollIntoView({
            behavior: "instant",
            block: "center"
        });

        animationList.addEventListener("scroll", () => {
            if (isAnimationListScrolling || isAnimationListIdleTicks > 3) return; // prevent flickering
            isAnimationListScrolling = true;
        }, animationListAborter);

        animationListScrollerId = setInterval(() => {
            const lastAnimationListScrollTopsDiffsAvg = lastAnimationListScrollTopDiffs.reduce((a, b) => a + b, 0) / lastAnimationListScrollTopDiffs.length;

            isAnimationListScrolling = Math.abs(lastAnimationListScrollTopsDiffsAvg) > 12;
            isAnimationListScrolling ? isAnimationListIdleTicks = 0 : isAnimationListIdleTicks++;

            lastAnimationListScrollTopDiffs.push(animationList.scrollTop - (lastAnimationListScrollTop < 0 ? 0 : lastAnimationListScrollTop));
            lastAnimationListScrollTop = animationList.scrollTop;

            if (lastAnimationListScrollTopDiffs.length > 5) lastAnimationListScrollTopDiffs.shift();
        }, 50);
    });

    onDestroy(() => {
        clearInterval(animationListScrollerId);
        animationListAborter.abort();
    });

    function randomizeFollowerAppearance() {
        switch (true) {
            case isFollowerObj(actor) && isFollowerObj(obj):
            case isModdedFollowerObj(actor) && isModdedFollowerObj(obj): {
                const [form, formVariantIdx, formColorSetIdx] = getRandomFollowerAppearance();

                actor.form = form;
                actor.formVariantIdx = formVariantIdx;
                actor.formColorSetIdx = formColorSetIdx;

                obj.form = form;
                obj.formVariantIdx = formVariantIdx;
                obj.formColorSetIdx = formColorSetIdx;

                break;
            }

            case isPlayerObj(actor) && isPlayerObj(obj): {
                const [creature, crown, fleece, bell] = getRandomPlayerAppearance();

                actor.creature = creature;
                actor.crown = crown;

                actor.fleece = fleece;
                actor.bell = bell;

                obj.creature = creature;
                obj.crown = crown;

                obj.fleece = fleece;
                obj.bell = bell;

                break;
            }
        }

        update();
    }

    function updateFollowerPossessionState(possessionState: number) {
        if ((!isFollowerObj(obj) || !isFollowerObj(actor)) && (!isModdedFollowerObj(obj) || !isModdedFollowerObj(actor))) return;
        possessionState--;

        obj.possessionState = possessionState < 0 ? null : possessionState;
        actor.possessionState = possessionState < 0 ? null : possessionState;

        update();
    }

    function updateFollowerSickState(sickState: number) {
        if ((!isFollowerObj(obj) || !isFollowerObj(actor)) && (!isModdedFollowerObj(obj) || !isModdedFollowerObj(actor))) return;
        sickState--;

        obj.sickState = sickState < 0 ? null : sickState;
        actor.sickState = sickState < 0 ? null : sickState;

        update();
    }

    function updateFollowerBeliefState(beliefState: number) {
        if ((!isFollowerObj(obj) || !isFollowerObj(actor)) && (!isModdedFollowerObj(obj) || !isModdedFollowerObj(actor))) return;
        beliefState--;

        obj.beliefState = beliefState < 0 ? null : beliefState;
        actor.beliefState = beliefState < 0 ? null : beliefState;

        update();
    }

    async function updateToModdedFollower() {
        if (!isFollowerObj(obj) || !isFollowerObj(actor)) return;

        const { form, clothing, animation, animationId } = obj;
        !factory.hasLoadedModdedFollower() && await factory.loadModdedFollower() && await exporter.factory.loadModdedFollower();

        const follower = factory.moddedFollower(form, clothing);
        follower.copyFromObj({ ...obj, colors: follower.colors });

        if (useExperimentalAnimations && experimentalAnimations.length) {
            switch (true) {
                case isFollowerObj(actor):
                case isModdedFollowerObj(actor): {
                    const id = animationId as FollowerAnimationId;

                    await soundManager.load(...followerAnimationData[id].sounds.map(({ sound }) => sound));
                    follower.animationId = id;

                    break;
                }
            }
        } else follower.setRawAnimation(animation.name);
        change(follower);

        obj.animation = follower.animation;
    }

    async function updateBishopIsBoss(isBoss: boolean) {
        if (!isBishopObj(obj) || !isBishopObj(actor)) return;
        const { bishop: id, label } = obj;

        if (!factory.hasLoadedBishop(id, isBoss)) await factory.loadBishop(id, isBoss);
        const bishop = factory.bishop(id, isBoss);

        obj.isBoss = isBoss;

        bishop.copyFromObj(obj);
        bishop.label = label;

        const { animation, bossAnimation = animation } = bishopData[id];

        bishop.setRawAnimation(isBoss ? bossAnimation : animation);
        change(bishop);

        obj.animation = bishop.animation;
    }

    function updateCustomSlotColor() {
        if (!isModdedFollowerObj(obj) || !isModdedFollowerObj(actor)) return;
        (actor as ModdedFollower).setColor((selectedSlot ?? Object.keys(customSlots)[0]) as AllModdedFollowerSlotId, Color.fromObj(selectedColor));
    }

    function updateStage(stage: number) {
        if ((!isHereticObj(obj) || !isHereticObj(actor)) && (!isMachineObj(obj) || !isMachineObj(actor)) && (!isMiniBossObj(obj) || !isMiniBossObj(actor)) && (!isQuestGiverObj(obj) || !isQuestGiverObj(actor)) && (!isShopkeeperObj(obj) || !isShopkeeperObj(actor))) return;
        stage--;

        obj.stage = stage;
        actor.stage = stage;

        update();
    }

    function updateName(name: string) {
        actor.label = name;
        obj.label = name;

        update();
    }

    function updatePosition(pos: VectorObject = obj.pos) {
        actor.pos.copyObj(pos);
        !actor.pos.equalsObj(obj.pos) && actor.pos.cloneObj(obj.pos);

        update();
    }

    function updateScaleX(x: number) {
        x /= 100;

        actor.scale.x = x;
        obj.scale.x = x;

        update();
    }

    function updateScaleY(y: number) {
        y /= 100;

        actor.scale.y = y;
        obj.scale.y = y;

        update();
    }

    function resetScale() {
        actor.scale.copyObj(Vector.One).cloneObj(obj.scale);
        update();
    }

    async function updateUseExperimentalAnimation(useExperimentalAnimations: boolean) {
        useExperimentalAnimations && experimentalAnimations.length ? await updateExperimentalAnimation(selectedExperimentalAnimationId ?? experimentalAnimations[0]) : updateAnimation(selectedAnimationId ?? animations[0]);
        obj.animationId = actor.animationId;
    }

    async function updateExperimentalAnimation(animationId: string) {
        switch (true) {
            case isFollowerObj(actor):
            case isModdedFollowerObj(actor): {
                const id = animationId as FollowerAnimationId;

                await soundManager.load(...followerAnimationData[id].sounds.map(({ sound }) => sound));
                actor.animationId = id;

                break;
            }
        }

        selectedExperimentalAnimationId = actor.animationId;
        obj.animation = actor.animation;

        update();
    }

    function updateAnimation(animation: string) {
        actor.setRawAnimation(animation);

        selectedAnimationId = actor.animationId;
        obj.animation = actor.animation;

        update();
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center", className)}>
    <Header title="Follower Customization" />

    <MultiList class="w-70" titles={["Name", "Appearance", "Settings"]} {enableKeyInput}>
        {#snippet children(_, i)}
            {#if i == 0}
                <BannerButton label="Name" bind:value={obj.label} editable oninput={(name) => updateName(name)} />
                {#if isFollowerObj(obj)}
                    <BannerButton label="Randomize" src="/static/ui/dice-6.png" onclick={() => updateName(Random.percent(1) ? getSpecialFollowerName(obj.form, obj.formVariantIdx, true) : getRandomFollowerName())} />
                {/if}
            {:else if i === 1}
                {#if isFollowerObj(obj) || isModdedFollowerObj(obj)}
                    <BannerButton label="Choose Form" playClickSound={false} onclick={() => proceed("form")} />
                    <BannerButton label="Choose Robes" playClickSound={false} onclick={() => proceed("clothing")} />
                    <BannerButton label="Choose Accessory" playClickSound={false} onclick={() => proceed("accessory")} />
                    <BannerButton label="Choose Color" playClickSound={false} onclick={() => proceed("color")} />
                    <BannerButton label="Choose Variant" playClickSound={false} onclick={() => proceed("variant")} />

                    <BannerButton label="Randomize" src="/static/ui/dice-6.png" onclick={randomizeFollowerAppearance} />
                {:else if isPlayerObj(obj)}
                    <BannerButton label="Choose Creature" playClickSound={false} onclick={() => proceed("creature")} />
                    <BannerButton label="Choose Crown" playClickSound={false} onclick={() => proceed("crown")} />
                    <BannerButton label="Choose Fleece" playClickSound={false} onclick={() => proceed("fleece")} />
                    <BannerButton label="Choose Bell" playClickSound={false} onclick={() => proceed("bell")} />

                    <BannerButton label="Randomize" src="/static/ui/dice-6.png" onclick={randomizeFollowerAppearance} />
                {:else if isSoldierObj(obj)}
                    <BannerButton label="Choose Role" playClickSound={false} onclick={() => proceed(SOLDIER_MENU_NAME)} />
                {:else if isOccultistObj(obj)}
                    <BannerButton label="Choose Role" playClickSound={false} onclick={() => proceed(OCCULTIST_MENU_NAME)} />
                {:else if isGuardObj(obj)}
                    <BannerButton label="Choose Role" playClickSound={false} onclick={() => proceed(GUARD_MENU_NAME)} />
                {:else if isHereticObj(obj)}
                    <BannerButton label="Choose Heretic" playClickSound={false} onclick={() => proceed(HERETIC_MENU_NAME)} />
                {:else if isMachineObj(obj)}
                    <BannerButton label="Choose Machine" playClickSound={false} onclick={() => proceed(MACHINE_MENU_NAME)} />
                {:else if isBishopObj(obj)}
                    <BannerButton label="Choose Bishop" playClickSound={false} onclick={() => proceed(BISHOP_MENU_NAME)} />
                {:else if isTOWW_Obj(obj)}
                    <BannerButton label="Choose Form" playClickSound={false} onclick={() => proceed(TOWW_MENU_NAME)} />
                {:else if isMiniBossObj(obj)}
                    <BannerButton label="Choose Boss" playClickSound={false} onclick={() => proceed(MINI_BOSS_MENU_NAME)} />
                {:else if isWitnessObj(obj)}
                    <BannerButton label="Choose Witness" playClickSound={false} onclick={() => proceed(WITNESS_MENU_NAME)} />
                {:else if isKnucklebonesPlayerObj(obj)}
                    <BannerButton label="Choose Player" playClickSound={false} onclick={() => proceed(KNUCKLEBONES_PLAYER_MENU_NAME)} />
                {:else if isQuestGiverObj(obj)}
                    <BannerButton label="Choose Giver" playClickSound={false} onclick={() => proceed(QUEST_GIVER_MENU_NAME)} />
                {:else if isShopkeeperObj(obj)}
                    <BannerButton label="Choose Shopkeeper" playClickSound={false} onclick={() => proceed(SHOPKEEPER_MENU_NAME)} />
                {/if}
            {:else if i === 2}
                <div class="flex flex-col gap-12 pt-6 pb-8">
                    {#if hasAttributes}
                        <div class="flex flex-col gap-6 items-center">
                            <LabelTitle title="Attributes" />

                            <div class="flex flex-col gap-8 items-center mx-8 w-80 sm:w-90">
                                {#if (isFollowerObj(obj) && isFollowerObj(actor)) || (isModdedFollowerObj(obj) && isModdedFollowerObj(actor))}
                                    <Label label="Level">
                                        <Slider class="ml-12" label="Level" bind:value={obj.level} min={1} max={10} step={1} displayValues={["O", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]} oninput={(level) => actor.level = level} />
                                    </Label>

                                    <Label label="Age State">
                                        <ArrowSelection class="ml-6" label="Age State" options={["Baby", "Adult", "Elder"]} bind:i={obj.ageState} oninput={(_, i) => actor.ageState = i} />
                                    </Label>

                                    <Label label="Emotion State">
                                        <ArrowSelection class="ml-6" label="Emotion State" options={["Normal", "Happy", "Sad", "Angry", "Scared"]} bind:i={obj.emotionState} oninput={(_, i) => actor.emotionState = i} />
                                    </Label>

                                    <Label label="Possession State">
                                        <ArrowSelection class="ml-6" label="Possession State" options={["Normal", "Enlightened", "Sinned"]} oninput={(_, i) => updateFollowerPossessionState(i)} />
                                    </Label>

                                    <Label label="Sick State">
                                        <ArrowSelection class="ml-6" label="Sick State" options={["Well", "Sick", "Traumatized", "Zombie", "Possessed"]} oninput={(_, i) => updateFollowerSickState(i)} />
                                    </Label>

                                    <Label label="Belief State">
                                        <ArrowSelection class="ml-6" label="Belief State" options={["Normal", "Brainwashed", "Dissenting"]} oninput={(_, i) => updateFollowerBeliefState(i)} />
                                    </Label>

                                    <Label label="Is a Disciple?">
                                        <Toggle label="Is a Disciple?" bind:enabled={obj.isDisciple} oninput={(isDisciple) => actor.isDisciple = isDisciple} />
                                    </Label>

                                    <Label label="Is Wearing a Hood?">
                                        <Toggle label="Is Wearing a Hood?" bind:enabled={obj.isHooded} oninput={(isHooded) => actor.isHooded = isHooded} />
                                    </Label>

                                    <Label label="Is Tired?">
                                        <Toggle label="Is Tired?" bind:enabled={obj.isTired} oninput={(isTired) => actor.isTired = isTired} />
                                    </Label>

                                    <Label label="Is Sweating?">
                                        <Toggle label="Is Sweating?" bind:enabled={obj.isSweating} oninput={(isSweating) => actor.isSweating = isSweating} />
                                    </Label>

                                    <Label label="Is Injured?">
                                        <Toggle label="Is Injured?" bind:enabled={obj.isInjured} oninput={(isInjured) => actor.isInjured = isInjured} />
                                    </Label>

                                    <Label label="Is Befuddled?">
                                        <Toggle label="Is Befuddled?" bind:enabled={obj.isBefuddled} oninput={(isBefuddled) => actor.isBefuddled = isBefuddled} />
                                    </Label>

                                    {#if isFollowerObj(obj) && isFollowerObj(actor)}
                                        <BannerButton label="Add Colors++" onclick={updateToModdedFollower} />
                                    {/if}
                                {:else if isPlayerObj(obj) && isPlayerObj(actor)}
                                    <Label label="Hurt State">
                                        <ArrowSelection class="ml-6" label="Hurt State" options={["Normal", "Bruised", "Injured"]} bind:i={obj.hurtState} oninput={(_, i) => actor.hurtState = i} />
                                    </Label>

                                    <Label label="Show Head Only?">
                                        <Toggle label="Show Head Only?" bind:enabled={obj.isOnlyHead} oninput={(isOnlyHead) => actor.isOnlyHead = isOnlyHead} />
                                    </Label>
                                {:else if isSoldierObj(obj) && isSoldierObj(actor)}
                                    {#if soldierData[obj.soldier].canHoldShield}
                                        <Label label="Is Holding Shield?">
                                            <Toggle label="Is Holding Shield?" bind:enabled={obj.isHoldingShield!} oninput={(isHoldingShield) => actor.isHoldingShield = isHoldingShield} />
                                        </Label>
                                    {/if}
                                {:else if isOccultistObj(obj) && isOccultistObj(actor)}
                                    <!-- NO CUSTOMIZABLE ATTRIBUTES  -->
                                {:else if isGuardObj(obj) && isGuardObj(actor)}
                                    <!-- NO CUSTOMIZABLE ATTRIBUTES  -->
                                {:else if isHereticObj(obj) && isHereticObj(actor)}
                                    {#if hereticData[obj.heretic].skins.length > 1 && obj.heretic !== "Mega_Blue_Spider"}
                                        <Label label={obj.heretic === "Horned_Spikefish" ? "Number of Angry Eyes" : "Body Part Number"}>
                                            <Slider class="ml-4" label="Body Part Number" value={obj.stage + 1} min={1} max={hereticData[obj.heretic].skins.length} step={1} oninput={updateStage} />
                                        </Label>
                                    {/if}

                                    {#if obj.heretic === "Mega_Blue_Spider"}
                                        <Label label="Has Eggs?">
                                            <Toggle label="Has Eggs?" enabled={!!obj.stage} oninput={(hasEggs) => updateStage(+hasEggs + 1)} />
                                        </Label>
                                    {/if}

                                    {#if "backSkins" in hereticData[obj.heretic]}
                                        <Label label="Is Facing the Back?">
                                            <Toggle label="Is Facing the Back?" bind:enabled={obj.isBackFacing!} oninput={(isBackFacing) => actor.isBackFacing = isBackFacing} />
                                        </Label>
                                    {/if}
                                {:else if isMachineObj(obj) && isMachineObj(actor)}
                                    {#if machineData[obj.machine].skins.length > 1}
                                        {#if obj.machine === "Frog_Egg"}
                                            <Label label="Maturity Stage">
                                                <Slider class="ml-4" label="Maturity Stage" value={obj.stage + 1} min={1} max={machineData[obj.machine].skins.length} step={1} oninput={updateStage} />
                                            </Label>
                                        {:else if obj.machine === "Spider_Egg"}
                                            <Label label="Size">
                                                <ArrowSelection class="ml-6" label="Size" options={["I", "II", "III", "Max"]} bind:i={obj.stage} oninput={(_, i) => actor.stage = i} />
                                            </Label>
                                        {/if}
                                    {/if}
                                {:else if isBishopObj(obj) && isBishopObj(actor)}
                                    {#if "bossSrc" in bishopData[obj.bishop]}
                                        <Label label="Is in Boss Form?">
                                            <Toggle label="Is in Boss Form?" bind:enabled={obj.isBoss} oninput={updateBishopIsBoss} />
                                        </Label>
                                    {/if}

                                    <Label label="Is Purged?">
                                        <Toggle label="Is Purged?" bind:enabled={obj.isPurged} oninput={(isPurged) => actor.isPurged = isPurged} />
                                    </Label>

                                    {#if obj.bishop === "Spider"}
                                        <Label label="Is Bandaged?">
                                            <Toggle label="Is Bandaged?" bind:enabled={obj.isBandaged!} oninput={(isBandaged) => actor.isBandaged = isBandaged} />
                                        </Label>
                                    {/if}
                                {:else if isTOWW_Obj(obj) && isTOWW_Obj(actor)}
                                    {#if obj.form === "Bishop"}
                                        <Label label="Has Crown?">
                                            <Toggle label="Has Crown?" bind:enabled={obj.hasCrown!} oninput={(hasCrown) => actor.hasCrown = hasCrown} />
                                        </Label>

                                        <Label label="Has Chains?">
                                            <Toggle label="Has Chains?" bind:enabled={obj.hasChains!} oninput={(hasChains) => actor.hasChains = hasChains} />
                                        </Label>
                                    {:else if obj.form === "Boss"}
                                        <Label label="Has Crown?">
                                            <Toggle label="Has Crown?" bind:enabled={obj.hasCrown!} oninput={(hasCrown) => actor.hasCrown = hasCrown} />
                                        </Label>
                                    {:else if obj.form === "Mega_Boss"}
                                        <Label label="Number of Missing Eyes">
                                            <Slider class="ml-4" label="Number of Missing Eyes" bind:value={obj.eyeState!} min={0} max={3} step={1} oninput={(eyeState) => actor.eyeState = eyeState} />
                                        </Label>
                                    {:else if obj.form === "Eyeball"}
                                        <Label label="Is Injured?">
                                            <Toggle label="Is Injured?" bind:enabled={obj.isInjured!} oninput={(isInjured) => actor.isInjured = isInjured} />
                                        </Label>
                                    {/if}
                                {:else if isMiniBossObj(obj) && isMiniBossObj(actor)}
                                    {#if miniBossData[obj.miniBoss].skins.length > 1}
                                        <Label label="Body Part Number">
                                            <Slider class="ml-4" label="Body Part Number" value={obj.stage + 1} min={1} max={miniBossData[obj.miniBoss].skins.length} step={1} oninput={updateStage} />
                                        </Label>
                                    {/if}

                                    <Label label="Is Upgraded?">
                                        <Toggle label="Is Upgraded?" bind:enabled={obj.isUpgraded} oninput={(isUpgraded) => actor.isUpgraded = isUpgraded} />
                                    </Label>

                                    {#if ["backSkins", "backUpgradedSkins"].every((key) => key in miniBossData[obj.miniBoss])}
                                        <Label label="Is Facing the Back?">
                                            <Toggle label="Is Facing the Back?" bind:enabled={obj.isBackFacing!} oninput={(isBackFacing) => actor.isBackFacing = isBackFacing} />
                                        </Label>
                                    {/if}
                                {:else if isWitnessObj(obj) && isWitnessObj(actor)}
                                    <Label label="Is Upgraded?">
                                        <Toggle label="Is Upgraded?" bind:enabled={obj.isUpgraded} oninput={(isUpgraded) => actor.isUpgraded = isUpgraded} />
                                    </Label>

                                    <Label label="Is Purged?">
                                        <Toggle label="Is Purged?" bind:enabled={obj.isPurged} oninput={(isPurged) => actor.isPurged = isPurged} />
                                    </Label>
                                {:else if isKnucklebonesPlayerObj(obj) && isKnucklebonesPlayerObj(actor)}
                                    <Label label="Show Head Only?">
                                        <Toggle label="Show Head Only?" bind:enabled={obj.isOnlyHead} oninput={(isOnlyHead) => actor.isOnlyHead = isOnlyHead} />
                                    </Label>
                                {:else if isQuestGiverObj(obj) && isQuestGiverObj(actor)}
                                    {#if obj.giver === "Midas"}
                                        <Label label="Is Hurt?">
                                            <Toggle label="Is Hurt?" enabled={!!obj.stage} oninput={(isHurt) => updateStage(+isHurt + 1)} />
                                        </Label>
                                    {/if}
                                {:else if isShopkeeperObj(obj) && isShopkeeperObj(actor)}
                                    {#if obj.shopkeeper === "Berith"}
                                        <Label label="Clothing Style">
                                            <ArrowSelection class="ml-6" label="Clothing Style" options={["Flowery", "Autumn", "Fantasy", "Natural"]} bind:i={obj.stage} oninput={(_, i) => actor.stage = i} />
                                        </Label>
                                    {/if}
                                {/if}
                            </div>
                        </div>
                    {/if}

                    {#if Object.keys(customSlots).length}
                        <div class="flex flex-col gap-6 items-center mx-8">
                            <LabelTitle title="Colors++" />

                            <div class="flex flex-col gap-8 items-center mx-8 w-80 sm:w-90">
                                <Label class="h-24" label="Selected Part">
                                    <Dropdown class="ml-4"  options={customSlots} value={selectedSlot ?? Object.keys(customSlots)[0]} label="Selected Part" oninput={(slot) => selectedSlot = slot} />
                                </Label>

                                <Label label="Preview Color">
                                    <ColorDot color={selectedColor} />
                                </Label>

                                <ColorRows class="w-80 sm:w-90" bind:r={selectedColor.r} bind:g={selectedColor.g} bind:b={selectedColor.b} oninput={updateCustomSlotColor} />
                            </div>
                        </div>
                    {/if}

                    <div class="flex flex-col gap-6 items-center mx-8">
                        <LabelTitle title="Positioning" />

                        <div class="flex flex-col gap-2 w-80 sm:w-90">
                            <Label label="X Position">
                                <NumberInput label="X Position" bind:value={obj.pos.x} unit="px" min={-Infinity} max={Infinity} oninput={() => updatePosition()} />
                            </Label>

                            <Label label="Y Position">
                                <NumberInput label="Y Position" bind:value={obj.pos.y} unit="px" min={-Infinity} max={Infinity} oninput={() => updatePosition()} />
                            </Label>
                        </div>
                    </div>

                    <div class="flex flex-col gap-6 items-center mx-8">
                        <LabelTitle title="Scaling" />

                        <div class="flex flex-col gap-2 w-80 sm:w-90">
                            <Label label="Scale X">
                                <NumberInput label="Scale X" value={obj.scale.x * 100} unit="%" step={0.01} max={Infinity} oninput={updateScaleX} />
                            </Label>

                            <Label label="Scale Y">
                                <NumberInput label="Scale Y" value={obj.scale.y * 100} unit="%" step={0.01} max={Infinity} oninput={updateScaleY} />
                            </Label>
                        </div>
                    </div>

                    <div class="flex flex-col gap-8 items-center mx-8">
                        <LabelTitle title="Animations" />

                        <Label class="group w-80 sm:w-90" label="Selected Animation">
                            <span class="w-48 font-subtitle text-inactive hover:text-active group-hover:text-active text-ellipsis">{useExperimentalAnimations && experimentalAnimations.length ? selectedExperimentalAnimationId : selectedAnimationId}</span>
                        </Label>

                        <div class="w-full" role="search">
                            <SearchBox label="Search Animations" bind:val={animationFilterTerm} />

                            <ul bind:this={animationList} class="no-scrollbar overflow-x-clip overflow-y-auto px-2 py-1 h-30 font-subtitle text-sm text-center {isAnimationListScrolling ? "text-active outline-3" : "text-inactive outline-0"}  hover:text-active focus:text-active text-ellipsis bg-dark rounded-xs hover:outline-3 focus:outline-3 outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75" role={animationFilterTerm === "" ? "list" : "listbox"}>
                                {#if displayedAnimationNames.length}
                                    {#each displayedAnimationNames as [id, name], i}
                                        <li role="option" aria-selected={id === (useExperimentalAnimations && experimentalAnimations.length ? selectedExperimentalAnimationId : selectedAnimationId)}>
                                            <button class="p-1 my-1 w-full {id === (useExperimentalAnimations && experimentalAnimations.length ? selectedExperimentalAnimationId : selectedAnimationId) ? "text-active bg-gradient-to-r from-highlight to-highlight" : `${i % 2 ? "bg-secondary" : "bg-dark"} hover:outline-3`} rounded-xs outline-0 outline-highlight not-motion-reduce:transition-[outline] not-motion-reduce:duration-75" onclick={() => useExperimentalAnimations && experimentalAnimations.length ? updateExperimentalAnimation(id) : updateAnimation(id)}>{name}</button>
                                        </li>
                                    {/each}
                                {:else}
                                    <li>
                                        <p class="font-heading text-[1rem]">No Animations Found</p>
                                    </li>
                                {/if}
                            </ul>
                        </div>

                        {#if experimentalAnimations.length}
                            <Label class="mt-2 w-80 sm:w-90" label="Use Experimental Animations">
                                <Toggle label="Use Experimental Animations" bind:enabled={useExperimentalAnimations} oninput={updateUseExperimentalAnimation} />
                            </Label>

                            {#if useExperimentalAnimations}
                                <Notice label="Development on Experimental Animations have stopped and is no longer being worked on. It may be removed in the near future." />
                            {/if}
                        {/if}
                    </div>

                    <div class="flex flex-col gap-8 items-center mx-8">
                        <LabelTitle title="Miscellaneous" />

                        <Label class="w-80 sm:w-90" label="Flip Character">
                            <Toggle label="Flip Character" bind:enabled={obj.flipX} oninput={(flipX) => actor.flipX = flipX} />
                        </Label>

                        <Label class="w-80 sm:w-90" label="Hide Character">
                            <Toggle label="Hide Character" bind:enabled={obj.hidden} oninput={(hidden) => actor.hidden = hidden} />
                        </Label>

                        <Label class="w-80 sm:w-90" label="Mute Character">
                            <Toggle label="Mute Character" bind:enabled={obj.muted} oninput={(muted) => actor.muted = muted} />
                        </Label>
                    </div>
                </div>

                <BannerButton label="Reset Position" onclick={() => updatePosition(Vector.Zero.toObj())} />
                <BannerButton class="mb-6" label="Reset Scale" onclick={resetScale} />

                <BannerButton label="Increase Priority" disabled={actorIdx >= scene.actors.length - 1} onclick={() => reorder(1)} />
                <BannerButton class="mb-6" label="Decrease Priority" disabled={!actorIdx} onclick={() => reorder(-1)} />

                <BannerButton label="Accept" playClickSound={false} onclick={() => exit(false)} />
                <BannerButton label="Remove" playClickSound={false} onclick={() => exit(true)} />
            {/if}
        {/snippet}
    </MultiList>
</div>