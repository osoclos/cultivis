<script lang="ts" module>
    export const PLAYER_MENU_NAMES = ["creature", "crown", "fleece", "bell"] as const;
    export type PlayerMenuName = typeof PLAYER_MENU_NAMES[number];

    export function isStrPlayerMenuName(str: string): str is PlayerMenuName {
        return PLAYER_MENU_NAMES.includes(str as PlayerMenuName);
    }
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { MultiGrid, SpritesheetImage } from "../../utils";

    import { playerData } from "../../../data/files";
    import { PLAYER_BELL_IDS, PLAYER_CREATURE_IDS, PLAYER_CROWN_IDS, PLAYER_FLEECE_IDS, playerBellIdsByCategory, playerFleeceIdsByCategory, type PlayerBellData, type PlayerBellId, type PlayerCreatureId, type PlayerCrownId, type PlayerFleeceData, type PlayerFleeceId } from "../../../data/types";

    import type { Player, PlayerObject } from "../../../scripts/characters";
    import { Random } from "../../../utils";
    
    interface Props {
        player: Player;
        obj: PlayerObject;

        menu?: PlayerMenuName;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
    }

    let {
        player,
        obj = $bindable(),

        menu = $bindable("creature"),

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {}
    }: Props = $props();

    const title: string = $derived.by(() => {
        switch (menu) {
            case "creature": return "Choose Creature";
            case "crown": return "Choose Crown";

            case "fleece": return "Choose Fleece";
            case "bell": return "Choose Bell";
        }
    });

    const dividerTitles: string[] = $derived.by(() => {
        switch (menu) {
            case "creature": return ["Creatures"];
            case "crown": return ["Crowns"];

            case "fleece": return Object.keys(playerFleeceIdsByCategory);
            case "bell": return Object.keys(playerBellIdsByCategory);
        }
    });

    function updateCreature(id: PlayerCreatureId) {
        player.creature = id;
        obj.creature = id;

        update();
    }

    function updateCrown(id: PlayerCrownId | null) {
        player.crown = id;
        obj.crown = id;

        update();
    }

    function updateFleece(id: PlayerFleeceId) {
        player.fleece = id;
        obj.fleece = id;

        update();
    }

    function updateBell(id: PlayerBellId | null) {
        player.bell = id;
        obj.bell = id;

        update();
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header {title} />

    <MultiGrid gridClass="mx-1" titles={dividerTitles} minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        {#snippet children(category, y)}
            {#if menu === "creature"}
                {#if y === 0}
                    <BoxOption label="Select Random Creature" hideBackground onclick={() => updateCreature(Random.item(PLAYER_CREATURE_IDS))}>
                        <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>

                    {#each Object.entries(playerData.creatures) as [id, { name }], x (id) }
                        <BoxOption label={name} selected={id === obj.creature} onclick={() => updateCreature(id as PlayerCreatureId)}>
                            <SpritesheetImage src="/static/assets/player.png" label={name} {x} y={0} tileWidth={64} tileHeight={64} />
                        </BoxOption>
                    {/each}
                {/if}
            {:else if menu === "crown"}
                {#if y === 0}
                    <BoxOption label="Remove Crown" hideBackground hideFocusRing onclick={() => updateCrown(null)}>
                        <img src="/static/ui/cancel.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>

                    <BoxOption label="Select Random Crown" hideBackground onclick={() => updateCrown(Random.item(PLAYER_CROWN_IDS))}>
                        <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>

                    {#each Object.entries(playerData.crowns) as [id, { name }], x (id) }
                        <BoxOption label={name} selected={id === obj.crown} onclick={() => updateCrown(id as PlayerCrownId)}>
                            <SpritesheetImage src="/static/assets/player.png" label={name} {x} y={1} tileWidth={64} tileHeight={64} />
                        </BoxOption>
                    {/each}
                {/if}
            {:else if menu === "fleece"}
                <BoxOption label="Select Random {category} Fleece" hideBackground onclick={() => updateFleece(Random.item(PLAYER_FLEECE_IDS))}>
                    <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                </BoxOption>

                {#each Object.values(playerFleeceIdsByCategory)[y].map<[PlayerFleeceId, PlayerFleeceData]>((id) => [id, playerData.fleeces[id]]) as [id, { name }], x (id) }
                    <BoxOption label={name} selected={id === obj.fleece} onclick={() => updateFleece(id as PlayerFleeceId)}>
                        <SpritesheetImage src="/static/assets/fleeces.png" label={name} {x} {y} tileWidth={64} tileHeight={64} />
                    </BoxOption>
                {/each}
            {:else if menu === "bell"}
                {#if !y}
                    <BoxOption label="Remove Bell" hideBackground hideFocusRing onclick={() => updateBell(null)}>
                        <img src="/static/ui/cancel.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                    </BoxOption>
                {/if}
                <BoxOption label="Select Random {category} Bell" hideBackground onclick={() => updateBell(Random.item(PLAYER_BELL_IDS))}>
                    <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
                </BoxOption>

                {#each Object.values(playerBellIdsByCategory)[y].map<[PlayerBellId, PlayerBellData]>((id) => [id, playerData.bells[id]]) as [id, { name }], x (id) }
                    <BoxOption label={name} selected={id === obj.bell} onclick={() => updateBell(id as PlayerBellId)}>
                        <SpritesheetImage src="/static/assets/bells.png" label={name} {x} {y} tileWidth={64} tileHeight={64} />
                    </BoxOption>
                {/each}
            {/if}
        {/snippet}
    </MultiGrid>
</div>