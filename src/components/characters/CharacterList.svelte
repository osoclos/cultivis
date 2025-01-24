<script lang="ts">
    import { CharacterBox, CharacterItem } from ".";
    import { BannerButton, Header } from "../base";
    import { List } from "../utils";

    import type { Actor, ActorObject } from "../../scripts";
    import { Bishop, Follower, MiniBoss, Player, TOWW, Witness } from "../../scripts/characters";

    interface Props {
        actors: ActorObject[] | null;
        loadingActor?: typeof Actor | null;

        enableKeyInput?: boolean;
        
        onadd?: (actor: typeof Actor) => void;
        
        onremove?: (indexes: Set<number>) => void;
        onclone?: (indexes: Set<number>) => void;

        onactorclick?: (i: number) => void;
    }

    let {
        actors = $bindable(null),
        loadingActor = $bindable(null),

        enableKeyInput = false,

        onadd: add = () => {},

        onremove: remove = () => {},
        onclone: clone = () => {},

        onactorclick: click = () => {}
    }: Props = $props();

    const MANIPULATE_STATES = ["REMOVE", "CLONE"] as const;
    let manipulateState: number = $state(-1);

    const manipulateIndexes: Set<number> = $state(new Set());
    const isRemoving: boolean = $derived(manipulateState === MANIPULATE_STATES.indexOf("REMOVE"));
    const isCloning: boolean = $derived(manipulateState === MANIPULATE_STATES.indexOf("CLONE"));

    function onButtonClick(i: number) {
        if (manipulateIndexes.size) (isRemoving ? remove : clone)(manipulateIndexes);
        manipulateIndexes.clear();
        
        manipulateState = manipulateState === i ? -1 : i;
    }
</script>

<div class="flex flex-col gap-8">
    <div class="flex flex-col gap-4 items-center">
        <Header title="Add Character" />

        <List class="no-scrollbar overflow-x-auto flex-row gap-4 p-2 w-90 sm:w-100" {enableKeyInput} isHorizontal>
            {#each [Follower, Player, Bishop, TOWW] as actor, i (i)} 
                <CharacterItem {actor} isLoading={actor === loadingActor} onclick={() => add(actor)} />
            {/each}
        </List>

        <BannerButton label={isRemoving ? "Confirm Selection" : "Remove Characters"} onclick={() => onButtonClick(MANIPULATE_STATES.indexOf("REMOVE"))}/>
        <BannerButton label={isCloning ? "Confirm Selection" : "Clone Characters"} onclick={() => onButtonClick(MANIPULATE_STATES.indexOf("CLONE"))}/>
    </div>

    <div class="flex flex-col gap-6 items-center">
        <Header title="Choose Character" />

        <List class="gap-4" {enableKeyInput}>
            {#if Array.isArray(actors)}
                {#each actors.keys() as i (i)}
                    <CharacterBox bind:actor={actors[i]} hasTickbox={isRemoving || isCloning} onclick={() => click(i)} oninput={(ticked) => ticked ? manipulateIndexes?.add(i) : manipulateIndexes?.delete(i)} />
                {/each}
            {:else}
                <p class="font-subtitle text-center text-active">Loading...</p>
            {/if}
        </List>
    </div>
</div>