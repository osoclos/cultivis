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

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BannerButton, Dropdown, Header, Label, LabelTitle, NumberInput, ArrowSelection, Slider, Toggle, Notice } from "../base";
    import { BISHOP_MENU_NAME, GUARD_MENU_NAME, HERETIC_MENU_NAME, KNUCKLEBONES_PLAYER_MENU_NAME, MACHINE_MENU_NAME, MINI_BOSS_MENU_NAME, OCCULTIST_MENU_NAME, SOLDIER_MENU_NAME, TOWW_MENU_NAME, WITNESS_MENU_NAME } from "./menus";
    import { MultiList } from "../utils";

    import { Actor, Factory, Scene, type ActorObject } from "../../scripts";
    import { isBishopObj, isFollowerObj, isGuardObj, isHereticObj, isKnucklebonesPlayerObj, isMachineObj, isMiniBossObj, isModdedFollowerObj, isOccultistObj, isPlayerObj, isSoldierObj, isTOWW_Obj, isWitnessObj } from "../../scripts/characters";
    import { soundManager } from "../../scripts/managers";

    import { bishopData, forbiddenAnimations, hereticData, machineData, miniBossData, soldierData } from "../../data/files";
    import { Random, Vector, type VectorObject } from "../../utils";

    interface Props {
        actor: Actor;
        obj: ActorObject;

        scene: Scene;
        actorIdx: number;

        factory: Factory;

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

        class: className,
        enableKeyInput = false,

        useExperimentalAnimations = $bindable(false),

        onupdate: update = () => {},
        onchange: change = () => {},
        onreorder: reorder = () => {},

        onproceed: proceed = () => {},
        onexit: exit = () => {}
    }: Props = $props();

    const animations: string[] = $derived.by(() => {
        const { follower, player, soldier, occultist, guard } = forbiddenAnimations;
        const { animationNames } = actor;
        
        const actorForbiddenAnimations: string[] = (() => {
            switch (true) {
                case isFollowerObj(actor): return follower;
                case isPlayerObj(actor): return player;

                case isSoldierObj(actor): return soldier;
                case isOccultistObj(actor): return occultist;
                case isGuardObj(actor): return guard;

                default: return [];
            }
        })();
        
        return animationNames.filter((name) => !(actorForbiddenAnimations.includes(`!${name}`) || actorForbiddenAnimations.some((keyword) => !keyword.startsWith("!") && name.includes(keyword)))).sort();
    });

    const experimentalAnimations: Record<string, string> = $derived.by(() => {
        switch (true) {
            case isFollowerObj(actor): return Object.fromEntries(FOLLOWER_ANIMATION_IDS.map((id) => [id, followerAnimationData[id].name]));
            default: return {};
        }
    });

    const hasAttributes: boolean = $derived.by(() => {
        switch (true) {
            case isSoldierObj(obj) && isSoldierObj(actor): return soldierData[obj.soldier].canHoldShield;
            case isOccultistObj(obj) && isOccultistObj(actor): 
            case isGuardObj(obj) && isGuardObj(actor): return false;

            case isHereticObj(obj) && isHereticObj(actor): return (hereticData[obj.heretic].skins.length > 1 && obj.heretic !== "Mega_Blue_Spider") || obj.heretic === "Mega_Blue_Spider" || "backSkins" in hereticData[obj.heretic];
            case isMachineObj(obj) && isMachineObj(actor): return machineData[obj.machine].skins.length > 1;

            default: return true;
        }
    });

    function randomizeFollowerAppearance() {
        switch (true) {
            case isFollowerObj(actor) && isFollowerObj(obj): {
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
        if (!isFollowerObj(obj) || !isFollowerObj(actor)) return;
        possessionState--;

        obj.possessionState = possessionState < 0 ? null : possessionState;
        actor.possessionState = possessionState < 0 ? null : possessionState;

        update();
    }

    function updateFollowerSickState(sickState: number) {
        if (!isFollowerObj(obj) || !isFollowerObj(actor)) return;
        sickState--;

        obj.sickState = sickState < 0 ? null : sickState;
        actor.sickState = sickState < 0 ? null : sickState;

        update();
    }

    function updateFollowerBeliefState(beliefState: number) {
        if (!isFollowerObj(obj) || !isFollowerObj(actor)) return;
        beliefState--;

        obj.beliefState = beliefState < 0 ? null : beliefState;
        actor.beliefState = beliefState < 0 ? null : beliefState;

        update();
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
        obj.animation = bishop.animation;

        change(bishop);
    }

    function updateStage(stage: number) {
        if ((!isHereticObj(obj) || !isHereticObj(actor)) && (!isMachineObj(obj) || !isMachineObj(actor)) && (!isMiniBossObj(obj) || !isMiniBossObj(actor))) return;
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

    function updateUseExperimentalAnimation(useExperimentalAnimations: boolean) {
        useExperimentalAnimations ? updateExperimentalAnimation(experimentalAnimations[0]) : updateAnimation(animations[0]);
        obj.animationId = actor.animationId;
    }

    async function updateExperimentalAnimation(animationId: string) {
        switch (true) {
            case isFollowerObj(actor): {
                const id = animationId as FollowerAnimationId;

                await soundManager.load(...followerAnimationData[id].sounds.map(({ sound }) => sound));
                actor.animationId = id;

                break;
            }
        } 

        update();
    }
    
    function updateAnimation(animation: string) {
        actor.setRawAnimation(animation);
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
                                        <ArrowSelection class="ml-6" label="Sick State" options={["Well", "Sick", "Traumatized", "Zombie", "Scared"]} oninput={(_, i) => updateFollowerSickState(i)} />
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

                                    <Label label="Is Befuddled?">
                                        <Toggle label="Is Befuddled?" bind:enabled={obj.isBefuddled} oninput={(isBefuddled) => actor.isBefuddled = isBefuddled} />
                                    </Label>
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
                                {/if}
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

                    <div class="flex flex-col gap-8 items-center mx-8 w-80 sm:w-90">
                        <LabelTitle title="Animations" />

                        {#if Object.keys(experimentalAnimations).length}
                            <Label label="Use Experimental Animations">
                                <Toggle label="Use Experimental Animations" bind:enabled={useExperimentalAnimations} oninput={updateUseExperimentalAnimation} />
                            </Label>
                        {/if}

                        <Label class="h-24" label="Selected Animation">
                            {#if useExperimentalAnimations && Object.keys(experimentalAnimations).length}
                                <Dropdown options={experimentalAnimations} bind:value={obj.animationId} label="Select Animation" oninput={updateExperimentalAnimation} />
                            {:else}
                                <Dropdown options={animations} bind:value={obj.animationId} label="Select Animation" oninput={updateAnimation} />
                            {/if}
                        </Label>

                        {#if useExperimentalAnimations && Object.keys(experimentalAnimations).length}
                            <Notice label="Experimental Animations may be buggy and introduce unforeseen issues. Use them with caution." />
                        {/if}
                    </div>

                    <div class="flex flex-col gap-8 items-center mx-8 w-80 sm:w-90">
                        <LabelTitle title="Miscellaneous" />

                        <Label label="Flip Character">
                            <Toggle label="Flip Character" bind:enabled={obj.flipX} oninput={(flipX) => actor.flipX = flipX} />
                        </Label>

                        <Label label="Hide Character">
                            <Toggle label="Hide Character" bind:enabled={obj.hidden} oninput={(hidden) => actor.hidden = hidden} />
                        </Label>

                        <Label label="Mute Character">
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