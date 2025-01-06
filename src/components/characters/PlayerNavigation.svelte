<script lang="ts" module>
    export function getRandomPlayerAppearance(): [PlayerCreatureId, PlayerFleeceId] {
        const creature = Random.item(PLAYER_CREATURE_IDS);
        const fleece = Random.item(PLAYER_FLEECE_IDS);

        return [creature, fleece];
    }
</script>

<script  lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BannerButton, Dropdown, Header, Label, LabelTitle, NumberInput, Toggle } from "../base";
    import { MultiList } from "../utils";

    import type { PlayerMenuNames } from "./PlayerMenus.svelte";
    
    import { forbiddenAnimations } from "../../data";
    import { PLAYER_CREATURE_IDS, PLAYER_FLEECE_IDS, type PlayerCreatureId, type PlayerFleeceId } from "../../data/types";

    import type { Player, PlayerObject } from "../../scripts/characters";
    import { Random, Vector, type VectorObject } from "../../utils";

    interface Props {
        player: Player;
        obj: PlayerObject;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;

        onproceed?: (menu: PlayerMenuNames) => void;
        onexit?: (removePlayer: boolean) => void;
    }

    const {
        player,
        obj = $bindable(),

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},

        onproceed: proceed = () => {},
        onexit: exit = () => {}
    }: Props = $props();

    function updateName(name: string) {
        player.label = name;
        obj.label = name;
    }

    function randomizeAppearance() {
        const [creature, fleece] = getRandomPlayerAppearance();
    
        player.creature = creature;
        player.fleece = fleece;
        
        obj.creature = creature;
        obj.fleece = fleece;

        update();
    }

    function updatePosition(pos: VectorObject = obj.pos) {
        player.pos.copyObj(pos);
        !player.pos.equalsObj(obj.pos) && player.pos.cloneObj(obj.pos);

        update();
    }

    function updateScaleX(x: number) {
        x /= 100;

        player.scale.x = x;
        obj.scale.x = x;

        update();
    }

    function updateScaleY(y: number) {
        y /= 100;

        player.scale.y = y;
        obj.scale.y = y;

        update();
    }

    function resetScale() {
        player.scale.copyObj(Vector.One).cloneObj(obj.scale);
        update();
    }

    function updateAnimation(animation: string) {
        player.setAnimation(animation);
        update();
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center", className)}>
    <Header title="Player Customization" />

    <MultiList class="w-70" titles={["Name", "Appearance", "Settings"]} {enableKeyInput}>
        {#snippet children(_, i)}
            {#if i == 0}
                <BannerButton label="Name" bind:value={obj.label} editable oninput={(name) => updateName(name)} />
            {:else if i === 1}
                <BannerButton label="Choose Creature" onclick={() => proceed("creature")} />
                <BannerButton label="Choose Fleece" onclick={() => proceed("fleece")} />
                
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
                            <Toggle label="Flip Character" bind:enabled={obj.flipX} oninput={(flipX) => player.flipX = flipX} />
                        </Label>

                        <Label label="Hide Character">
                            <Toggle label="Hide Character" bind:enabled={obj.hidden} oninput={(hidden) => player.hidden = hidden} />
                        </Label>

                        <Label label="Selected Animation">
                            <Dropdown options={player.animationNames.filter((name) => !(forbiddenAnimations.player.includes(`!${name}`) || forbiddenAnimations.player.some((keyword) => !keyword.startsWith("!") && name.includes(keyword)))).sort()} bind:value={obj.animation} label="Select Animation" oninput={updateAnimation} />
                        </Label>
                    </div>
                </div>

                <BannerButton label="Accept" onclick={() => exit(false)} />
                <BannerButton label="Remove" onclick={() => exit(true)} />
            {/if}
        {/snippet}
    </MultiList>
</div>