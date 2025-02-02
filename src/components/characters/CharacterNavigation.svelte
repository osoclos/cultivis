<script lang="ts" module>
    import { FOLLOWER_IDS, type FollowerId, PLAYER_CREATURE_IDS, PLAYER_FLEECE_IDS, type PlayerCreatureId, type PlayerFleeceId } from "../../data/types";
    import { bishopData, followerData, miniBossData } from "../../data/files";

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

    export function getRandomPlayerAppearance(): [PlayerCreatureId, PlayerFleeceId] {
        const creature = Random.item(PLAYER_CREATURE_IDS);
        const fleece = Random.item(PLAYER_FLEECE_IDS);

        return [creature, fleece];
    }
</script>

<script  lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BannerButton, Dropdown, Header, Label, LabelTitle, NumberInput, ScrollList, Slider, Toggle } from "../base";
    import { BISHOP_MENU_NAME, MINI_BOSS_MENU_NAME, TOWW_MENU_NAME, WITNESS_MENU_NAME } from "./menus";
    import { MultiList } from "../utils";

    import { Actor, Factory, type ActorObject } from "../../scripts";
    import { isBishopObj, isFollowerObj, isMiniBossObj, isPlayerObj, isTOWW_Obj, isWitnessObj } from "../../scripts/characters";

    import { forbiddenAnimations } from "../../data/files";
    import { Random, Vector, type VectorObject } from "../../utils";

    interface Props {
        actor: Actor;
        obj: ActorObject;

        factory: Factory;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
        onchange?: (actor: Actor) => void;

        onproceed?: (menu: string) => void;
        onexit?: (removeFollower: boolean) => void;
    }

    let {
        actor,
        obj,

        factory,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},
        onchange: change = () => {},

        onproceed: proceed = () => {},
        onexit: exit = () => {}
    }: Props = $props();

    const animations: string[] = $derived.by(() => {
        const { follower, player } = forbiddenAnimations;
        const { animationNames } = actor;
        
        switch (true) {
            case isFollowerObj(actor): return animationNames.filter((name) => !(follower.includes(`!${name}`) || follower.some((keyword) => !keyword.startsWith("!") && name.includes(keyword)))).sort();
            case isPlayerObj(actor): return animationNames.filter((name) => !(player.includes(`!${name}`) || player.some((keyword) => !keyword.startsWith("!") && name.includes(keyword)))).sort();

            default: return animationNames;
        }
    });

    function randomizeAppearance() {
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
                const [creature, fleece] = getRandomPlayerAppearance();
    
                actor.creature = creature;
                actor.fleece = fleece;
                
                obj.creature = creature;
                obj.fleece = fleece;

                break;
            }
        }

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

        obj.animation = isBoss ? bossAnimation : animation;
        bishop.setAnimation(isBoss ? bossAnimation : animation);

        change(bishop);
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

    function updateAnimation(animation: string) {
        actor.setAnimation(animation);
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
                {#if isFollowerObj(obj)}
                    <BannerButton label="Choose Form" playClickSound={false} onclick={() => proceed("form")} />
                    <BannerButton label="Choose Robes" playClickSound={false} onclick={() => proceed("clothing")} />
                    <BannerButton label="Choose Accessory" playClickSound={false} onclick={() => proceed("accessory")} />
                    <BannerButton label="Choose Color" playClickSound={false} onclick={() => proceed("color")} />
                    <BannerButton label="Choose Variant" playClickSound={false} onclick={() => proceed("variant")} />

                    <BannerButton label="Randomize" src="/static/ui/dice-6.png" onclick={randomizeAppearance} />
                {:else if isPlayerObj(obj)}
                    <BannerButton label="Choose Creature" playClickSound={false} onclick={() => proceed("creature")} />
                    <BannerButton label="Choose Fleece" playClickSound={false} onclick={() => proceed("fleece")} />
                    
                    <BannerButton label="Randomize" src="/static/ui/dice-6.png" onclick={randomizeAppearance} />
                {:else if isBishopObj(obj)}
                    <BannerButton label="Choose Bishop" playClickSound={false} onclick={() => proceed(BISHOP_MENU_NAME)} />
                {:else if isTOWW_Obj(obj)}
                    <BannerButton label="Choose Form" playClickSound={false} onclick={() => proceed(TOWW_MENU_NAME)} />
                {:else if isMiniBossObj(obj)}
                    <BannerButton label="Choose Boss" playClickSound={false} onclick={() => proceed(MINI_BOSS_MENU_NAME)} />
                {:else if isWitnessObj(obj)}
                    <BannerButton label="Choose Witness" playClickSound={false} onclick={() => proceed(WITNESS_MENU_NAME)} />
                {/if}
            {:else if i === 2}
                <div class="flex flex-col gap-6 pt-6 pb-8">
                    <div class="flex flex-col items-center gap-6">
                        <LabelTitle title="Attributes" />
                    
                        <div class="flex flex-col gap-8 items-center mx-8 w-80 sm:w-90">
                            {#if isFollowerObj(obj) && isFollowerObj(actor)}
                                <Label label="Is a Disciple?">
                                    <Toggle label="Is a Disciple?" bind:enabled={obj.isDisciple} oninput={(isDisciple) => actor.isDisciple = isDisciple} />
                                </Label>

                                <Label label="Age State">
                                    <ScrollList class="ml-4" label="Age State" options={["Baby", "Adult", "Elder"]} bind:i={obj.ageState} oninput={(_, i) => actor.ageState = i} />
                                </Label>
                            {:else if isPlayerObj(obj) && isPlayerObj(actor)}
                                <Label label="Hurt State">
                                    <ScrollList class="ml-4" label="Hurt State" options={["Normal", "Bruised", "Injured"]} bind:i={obj.hurtState} oninput={(_, i) => actor.hurtState = i} />
                                </Label>
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
                            {/if}
                        </div>
                    </div>

                    <div class="flex flex-col items-center gap-6 mx-8">
                        <LabelTitle title="Positioning" />
                    
                        <div class="flex flex-col gap-2 w-80 sm:w-90">
                            <Label label="X Position">
                                <NumberInput label="X Position" bind:value={obj.pos.x} unit="px" min={-Infinity} max={Infinity} oninput={() => updatePosition()} />
                            </Label>

                            <Label label="Y Position">
                                <NumberInput label="Y Position" bind:value={obj.pos.y} unit="px" min={-Infinity} max={Infinity} oninput={() => updatePosition()} />
                            </Label>
                        </div>

                        <BannerButton label="Reset Position" onclick={() => updatePosition(Vector.Zero.toObj())} />
                    </div>

                    <div class="flex flex-col items-center gap-6 mx-8">
                        <LabelTitle title="Scaling" />
                    
                        <div class="flex flex-col gap-2 w-80 sm:w-90">
                            <Label label="Scale X">
                                <NumberInput label="Scale X" value={obj.scale.x * 100} unit="%" step={0.01} max={Infinity} oninput={updateScaleX} />
                            </Label>

                            <Label label="Scale Y">
                                <NumberInput label="Scale Y" value={obj.scale.y * 100} unit="%" step={0.01} max={Infinity} oninput={updateScaleY} />
                            </Label>
                        </div>

                        <BannerButton label="Reset Scale" onclick={resetScale} />
                    </div>

                    <div class="flex flex-col gap-8 items-center mx-8 w-80 sm:w-90">
                        <Label label="Flip Character">
                            <Toggle label="Flip Character" bind:enabled={obj.flipX} oninput={(flipX) => actor.flipX = flipX} />
                        </Label>

                        <Label label="Hide Character">
                            <Toggle label="Hide Character" bind:enabled={obj.hidden} oninput={(hidden) => actor.hidden = hidden} />
                        </Label>

                        <Label class="h-24" label="Selected Animation">
                            <Dropdown options={animations} bind:value={obj.animation} label="Select Animation" oninput={updateAnimation} />
                        </Label>
                    </div>
                </div>

                <BannerButton label="Accept" playClickSound={false} onclick={() => exit(false)} />
                <BannerButton label="Remove" playClickSound={false} onclick={() => exit(true)} />
            {/if}
        {/snippet}
    </MultiList>
</div>