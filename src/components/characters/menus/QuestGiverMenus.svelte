<script lang="ts" module>
    export const QUEST_GIVER_MENU_NAME: string = "quest-giver";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { Grid, SpritesheetImage } from "../../utils";

    import { questGiverData } from "../../../data/files";
    import { QUEST_GIVER_IDS, type QuestGiverId } from "../../../data/types";

    import { Factory } from "../../../scripts";
    import { QuestGiver, type QuestGiverObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";
    
    interface Props {
        obj: QuestGiverObject;
        factory: Factory;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
        onchange?: (giver: QuestGiver) => void;
    }

    let {
        obj = $bindable(),
        factory,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},
        onchange: change = () => {}
    }: Props = $props();

    async function updateQuestGiver(giver: QuestGiverId) {
        const { id, label } = obj;

        if (!factory.hasLoadedQuestGiver(giver)) await factory.loadQuestGiver(giver);
        const questGiver = factory.questGiver(giver, id, label);

        obj.giver = giver;
        questGiver.copyFromObj(obj);

        const { animation } = questGiverData[giver];

        questGiver.setRawAnimation(animation);
        obj.animation = questGiver.animation;

        update();
        change(questGiver);
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Giver" />

    <Grid class="mx-1" label="List of Givers" minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        <BoxOption label="Select Random Giver" hideBackground onclick={() => updateQuestGiver(Random.item(QUEST_GIVER_IDS))}>
            <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
        </BoxOption>

        {#each Object.entries(questGiverData) as [id, { name }], i (id) }
            <BoxOption label={name} selected={id === obj.giver} onclick={() => updateQuestGiver(id as QuestGiverId)}>
                <SpritesheetImage src="/static/assets/characters/quest-givers.png" label={name} class="m-1" x={i} y={0} tileWidth={64} tileHeight={64} width={56} height={56} />
            </BoxOption>
        {/each}
    </Grid>
</div>