<script lang="ts">
    import { CharacterBox, CharacterItem } from ".";
    import { BannerButton, Header } from "../base";
    import { List } from "../utils";

    import type { Actor, ActorObject } from "../../scripts";
    import { Bishop, Follower, Player, TOWW } from "../../scripts/characters";

    interface Props {
        actors: ActorObject[] | null;
        loadingActor?: typeof Actor | null;

        enableKeyInput?: boolean;
        
        onadd?: (actor: typeof Actor) => void;
        onremove?: (indexes: Set<number>) => void;

        onactorclick?: (i: number) => void;
    }

    let {
        actors = $bindable(null),
        loadingActor = $bindable(null),

        enableKeyInput = false,

        onadd: add = () => {},
        onremove: remove = () => {},

        onactorclick: click = () => {}
    }: Props = $props();

    let removalIndexes: Set<number> | null = $state(null);
    const isRemoving: boolean = $derived(removalIndexes! instanceof Set);

    function onRemoveButtonClick() {
        if (isRemoving) remove(removalIndexes!);
        removalIndexes = isRemoving ? null : new Set();
    }
</script>

<div class="flex flex-col gap-8">
    <div class="flex flex-col gap-4 items-center">
        <Header title="Add Character" />

        <List class="no-scrollbar overflow-y-auto flex-row gap-4 p-2 w-90 sm:w-100" {enableKeyInput} isHorizontal>
            {#each [Follower, Player, Bishop, TOWW] as actor, i (i)} 
                <CharacterItem {actor} isLoading={actor === loadingActor} onclick={() => add(actor)} />
            {/each}
        </List>

        <BannerButton label={isRemoving ? "Confirm Selection" : "Remove Characters"} onclick={onRemoveButtonClick}/>
    </div>

    <div class="flex flex-col gap-6 items-center">
        <Header title="Choose Character" />

        <List class="gap-4" {enableKeyInput}>
            {#if Array.isArray(actors)}
                {#each actors.keys() as i (i)}
                    <CharacterBox bind:actor={actors[i]} hasTickbox={isRemoving} onclick={() => click(i)} oninput={(ticked) => ticked ? removalIndexes?.add(i) : removalIndexes?.delete(i)} />
                {/each}
            {:else}
                <p class="font-subtitle text-center text-active">Loading...</p>
            {/if}
        </List>
    </div>
</div>