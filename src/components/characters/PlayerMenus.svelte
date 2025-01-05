<script lang="ts" module>
    export type PlayerMenuNames = "creature" | "fleece";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from ".";
    import { Header } from "../base";
    import { Grid, SpritesheetImage } from "../utils";

    import { playerData } from "../../data";
    import { PLAYER_CREATURE_IDS, PLAYER_FLEECE_IDS, type PlayerCreatureId, type PlayerFleeceId } from "../../data/types";

    import type { Player, PlayerObject } from "../../scripts/characters";
    import { Random } from "../../utils";
    
    interface Props {
        player: Player,
        obj: PlayerObject,

        menu?: PlayerMenuNames;

        class?: string;
        enableKeyInput?: boolean;
    }

    let {
        player,
        obj = $bindable(),

        menu = $bindable("creature"),

        class: className,
        enableKeyInput = false
    }: Props = $props();

    function getTitle(menu: PlayerMenuNames): string {
        switch (menu) {
            case "creature": return "Choose Creature";
            case "fleece": return "Choose Fleece";
        }
    }

    function updateCreature(id: PlayerCreatureId) {
        player.creature = id;
        obj.creature = id;
    }

    function updateFleece(id: PlayerFleeceId) {
        player.fleece = id;
        obj.fleece = id;
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title={getTitle(menu)} />

    <Grid minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        {#if menu === "creature"}
            <BoxOption label="Select Random Creature" hideBackground onclick={() => updateCreature(Random.item(PLAYER_CREATURE_IDS))}>
                <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
            </BoxOption>

            {#each Object.entries(playerData.creature) as [id, { name }], i (id) }
                <BoxOption label={name} selected={id === obj.creature} onclick={() => updateCreature(id as PlayerCreatureId)}>
                    <SpritesheetImage label={name} src="/static/assets/player.png" x={i} y={0} tileWidth={64} tileHeight={64} />
                </BoxOption>
            {/each}
        {:else if menu === "fleece"}
            <BoxOption label="Select Random Fleece" hideBackground onclick={() => updateFleece(Random.item(PLAYER_FLEECE_IDS))}>
                <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
            </BoxOption>

            {#each Object.entries(playerData.fleece) as [id, { name }], i (id) }
                <BoxOption label={name} selected={id === obj.fleece} onclick={() => updateFleece(id as PlayerFleeceId)}>
                    <SpritesheetImage label={name} src="/static/assets/player.png" x={i} y={1} tileWidth={64} tileHeight={64} />
                </BoxOption>
            {/each}
        {/if}
    </Grid>
</div>