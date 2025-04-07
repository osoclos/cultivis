<script lang="ts">
    import { CharacterBox, CharacterItem } from ".";
    import { BannerButton, Header } from "../base";
    import { List, MultiList } from "../utils";

    import type { Actor, ActorObject } from "../../scripts";
    import { Bishop, Follower, Guard, Heretic, KnucklebonesPlayer, Machine, MiniBoss, Occultist, Player, QuestGiver, Shopkeeper, Soldier, TOWW, Witness } from "../../scripts/characters";

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
    let tickedItems: boolean[] = $state([]);

    const isRemoving: boolean = $derived(manipulateState === MANIPULATE_STATES.indexOf("REMOVE"));
    const isCloning: boolean = $derived(manipulateState === MANIPULATE_STATES.indexOf("CLONE"));

    function toggleItem(ticked: boolean, i: number) {
        ticked ? manipulateIndexes?.add(i) : manipulateIndexes?.delete(i);
        tickedItems[i] = ticked;
    }

    function onButtonClick(i: number) {
        if (manipulateIndexes.size) (isRemoving ? remove : clone)(manipulateIndexes);
        manipulateState = manipulateState === i ? -1 : i;

        manipulateIndexes.clear();
        tickedItems = actors?.map(() => false) ?? [];
    }
</script>

<div class="flex flex-col gap-4">
    <div class="flex flex-col gap-4 items-center">
        <Header title="Add Character" />

        <List class="no-scrollbar overflow-x-auto flex-row gap-4 p-2 w-90 sm:w-100" label="List of Characters" {enableKeyInput} isHorizontal isTabbable={false}>
            {#each [Follower, Player, Soldier, Occultist, Guard, Heretic, Machine, Bishop, TOWW, MiniBoss, Witness, KnucklebonesPlayer, QuestGiver, Shopkeeper] as actor, i (i)} 
                <CharacterItem {actor} isLoading={actor === loadingActor} onclick={() => add(actor)} />
            {/each}
        </List>
    </div>

    <MultiList class="flex flex-col gap-6" titles={["", ""]} {enableKeyInput}>
        {#snippet children(_, i)}
            {#if i === 0}
                <BannerButton label={
                    isRemoving
                        ? tickedItems.some((item) => item)
                            ? "Confirm Selection"
                            : "Cancel Selection"
                        : "Remove Characters"
                } onclick={() => onButtonClick(MANIPULATE_STATES.indexOf("REMOVE"))}/>
                <BannerButton label={
                    isCloning
                        ? tickedItems.some((item) => item)
                            ? "Confirm Selection"
                            : "Cancel Selection"
                        : "Clone Characters"
                } onclick={() => onButtonClick(MANIPULATE_STATES.indexOf("CLONE"))}/>
            {:else if i === 1}
                <Header class="mb-6" title="Choose Character" />

                {#if Array.isArray(actors)}
                    {#each actors.keys() as i (i)}
                        <CharacterBox class={i ? "mt-4" : ""} bind:actor={actors[i]} hasTickbox={isRemoving || isCloning} bind:ticked={tickedItems[i]} onclick={() => click(i)} oninput={(ticked) => toggleItem(ticked, i)} />
                    {/each}
                {:else}
                    <p class="font-subtitle text-center text-active">Loading...</p>
                {/if}
            {/if}
        {/snippet}
    </MultiList>
</div>