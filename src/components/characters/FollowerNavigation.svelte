<script lang="ts" module>
    const STARTING_NAMES: string[] = ["Ja", "Jul", "Na", "No", "Gre", "Bre", "Tre", "Mer", "Ty", "Ar", "An", "Yar", "Fe", "Fi", "The", "Thor", "Al", "Ha", "He", "Joo", "Ma", "Me", "Pa", "Pu"];
    const MIDDLE_NAMES: string[] = ["na"].concat(...STARTING_NAMES.slice(1, 11).map((name) => name.toLowerCase()));
    const ENDING_NAMES: string[] = ["on"].concat(...STARTING_NAMES.slice(1, 10).map((name) => name.toLowerCase()));

    export function getRandomFollowerName(): string {
        return Random.item(STARTING_NAMES) + (Random.bool() ? Random.item(MIDDLE_NAMES) : "") + Random.item(ENDING_NAMES);
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
</script>

<script  lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BannerButton, Dropdown, Header, Label, LabelTitle, NumberInput, Toggle } from "../base";
    import { MultiList } from "../utils";

    import type { FollowerMenuNames } from "./FollowerMenus.svelte";

    import type { Follower, FollowerObject } from "../../scripts/characters";
    
    import { followerData, forbiddenAnimations } from "../../data";
    import { FOLLOWER_IDS, type FollowerId } from "../../data/types";
    
    import { Random, Vector, type VectorObject } from "../../utils";

    interface Props {
        follower: Follower;
        obj: FollowerObject;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;

        onproceed?: (menu: FollowerMenuNames) => void;
        onexit?: (removeFollower: boolean) => void;
    }

    const {
        follower,
        obj,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},

        onproceed: proceed = () => {},
        onexit: exit = () => {}
    }: Props = $props();

    function randomizeAppearance() {
        const [form, formVariantIdx, formColorSetIdx] = getRandomFollowerAppearance();

        follower.form = form;
        follower.formVariantIdx = formVariantIdx;
        follower.formColorSetIdx = formColorSetIdx;

        obj.form = form;
        obj.formVariantIdx = formVariantIdx;
        obj.formColorSetIdx = formColorSetIdx;

        update();
    }

    function updateName(name: string) {
        follower.label = name;
        obj.label = name;

        update();
    }

    function updatePosition(pos: VectorObject = obj.pos) {
        follower.pos.copyObj(pos);
        !follower.pos.equalsObj(obj.pos) && follower.pos.cloneObj(obj.pos);

        update();
    }

    function updateScaleX(x: number) {
        x /= 100;

        follower.scale.x = x;
        obj.scale.x = x;

        update();
    }

    function updateScaleY(y: number) {
        y /= 100;

        follower.scale.y = y;
        obj.scale.y = y;

        update();
    }

    function resetScale() {
        follower.scale.copyObj(Vector.One).cloneObj(obj.scale);
        update();
    }

    function updateAnimation(animation: string) {
        follower.setAnimation(animation);
        update();
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center", className)}>
    <Header title="Follower Customization" />

    <MultiList class="w-70" titles={["Name", "Appearance", "Settings"]} {enableKeyInput}>
        {#snippet children(_, i)}
            {#if i == 0}
                <BannerButton label="Name" bind:value={obj.label} editable oninput={(name) => updateName(name)} />
                <BannerButton label="Randomize" src="/static/ui/dice-6.png" onclick={() => updateName(Random.percent(1) ? getSpecialFollowerName(obj.form, obj.formVariantIdx, true) : getRandomFollowerName())} />
            {:else if i === 1}
                <BannerButton label="Choose Form" onclick={() => proceed("form")} />
                <BannerButton label="Choose Robes" onclick={() => proceed("clothing")} />
                <BannerButton label="Choose Accessory" onclick={() => proceed("accessory")} />
                <BannerButton label="Choose Color" onclick={() => proceed("color")} />
                <BannerButton label="Choose Variant" onclick={() => proceed("variant")} />

                <BannerButton label="Randomize" src="/static/ui/dice-6.png" onclick={randomizeAppearance} />
            {:else if i === 2}
                <div class="flex flex-col gap-6 pt-6 pb-8" tabindex="-1">
                    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                    <div class="flex flex-col items-center gap-6 mx-8" tabindex="0">
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

                    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                    <div class="flex flex-col items-center gap-6 mx-8" tabindex="0">
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
                            <Toggle label="Flip Character" bind:enabled={obj.flipX} oninput={(flipX) => follower.flipX = flipX} />
                        </Label>

                        <Label label="Hide Character">
                            <Toggle label="Hide Character" bind:enabled={obj.hidden} oninput={(hidden) => follower.hidden = hidden} />
                        </Label>

                        <Label class="h-24" label="Selected Animation">
                            <Dropdown options={follower.animationNames.filter((name) => !(forbiddenAnimations.follower.includes(`!${name}`) || forbiddenAnimations.follower.some((keyword) => !keyword.startsWith("!") && name.includes(keyword)))).sort()} bind:value={obj.animation} label="Select Animation" oninput={updateAnimation} />
                        </Label>
                    </div>
                </div>

                <BannerButton label="Accept" onclick={() => exit(false)} />
                <BannerButton label="Remove" onclick={() => exit(true)} />
            {/if}
        {/snippet}
    </MultiList>
</div>