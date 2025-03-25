<script lang="ts" module>
    export const KNUCKLEBONES_PLAYER_MENU_NAME: string = "knucklebones-player";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { Grid, SpritesheetImage } from "../../utils";

    import { knucklebonesPlayerData } from "../../../data/files";
    import { KNUCKLEBONES_PLAYER_IDS, type KnucklebonesPlayerId } from "../../../data/types";

    import { Factory } from "../../../scripts";
    import { KnucklebonesPlayer, type KnucklebonesPlayerObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";
    
    interface Props {
        obj: KnucklebonesPlayerObject;
        factory: Factory;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
        onchange?: (knucklebonesPlayer: KnucklebonesPlayer) => void;
    }

    let {
        obj = $bindable(),
        factory,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},
        onchange: change = () => {}
    }: Props = $props();

    async function updateKnucklebonesPlayer(player: KnucklebonesPlayerId) {
        const { id, label } = obj;

        if (!factory.hasLoadedKnucklebonesPlayer(player)) await factory.loadKnucklebonesPlayer(player);
        const knucklebonesPlayer = factory.knucklebonesPlayer(player, id, label);

        obj.player = player;
        knucklebonesPlayer.copyFromObj(obj);

        const { animation } = knucklebonesPlayerData[player];

        knucklebonesPlayer.setRawAnimation(animation);
        obj.animation = knucklebonesPlayer.animation;

        update();
        change(knucklebonesPlayer);
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Player" />

    <Grid class="mx-1" label="List of Players" minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        <BoxOption label="Select Random Player" hideBackground onclick={() => updateKnucklebonesPlayer(Random.item(KNUCKLEBONES_PLAYER_IDS))}>
            <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
        </BoxOption>

        {#each Object.entries(knucklebonesPlayerData) as [id, { name }], i (id) }
            <BoxOption label={name} selected={id === obj.player} onclick={() => updateKnucklebonesPlayer(id as KnucklebonesPlayerId)}>
                <SpritesheetImage src="/static/assets/characters/knucklebones-players.png" label={name} class="m-1" x={i} y={0} tileWidth={64} tileHeight={64} width={56} height={56} />
            </BoxOption>
        {/each}
    </Grid>
</div>