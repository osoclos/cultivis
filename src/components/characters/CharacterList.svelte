<script lang="ts">
    import { CharacterBox } from ".";
    import { BannerButton, Header } from "../base";
    import { MultiList } from "../utils";

    import type { Actor, ActorObject } from "../../scripts";
    import { Follower, Player } from "../../scripts/characters";

    interface Props {
        actors: ActorObject[] | null;
        enableKeyInput?: boolean;

        onadd?: (actor: typeof Actor) => void;
        onactorclick?: (i: number) => void;
    }

    let {
        actors = $bindable(null),
        enableKeyInput = false,

        onadd: add = () => {},
        onactorclick: click = () => {}
    }: Props = $props();
</script>

<MultiList class="gap-8" listClass="flex flex-col gap-0 items-center" titles={["", ""]} {enableKeyInput} focusFirst={matchMedia("(max-width: 768px)").matches}>
    {#snippet children(_, i)}
        {#if i == 0}
            <Header class="mb-2" title="Add Character" />

            <BannerButton label="Add Follower" onclick={() => add(Follower)} />
            <BannerButton label="Add Player" onclick={() => add(Player)} />
        {:else if i === 1}
            <Header class="mb-6" title="Choose Character" />

            {#if actors}
                {#each actors.keys() as i (i)}
                    <CharacterBox class="mb-4 last:mb-0" bind:actor={actors[i]} onclick={() => click(i)} />
                {/each}
            {:else}
                <p class="font-subtitle text-center text-active">Loading...</p>
            {/if}
        {/if}
    {/snippet}
</MultiList>