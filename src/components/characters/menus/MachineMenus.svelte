<script lang="ts" module>
    export const MACHINE_MENU_NAME: string = "machine";
</script>

<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { BoxOption } from "..";
    import { Header } from "../../base";
    import { MultiGrid, SpritesheetImage } from "../../utils";

    import { machineData } from "../../../data/files";
    import { machineIdsByCategory, type MachineCategoryName, type MachineData, type MachineId } from "../../../data/types";

    import { Factory } from "../../../scripts";
    import { Machine, type MachineObject } from "../../../scripts/characters";

    import { Random } from "../../../utils";
    
    interface Props {
        obj: MachineObject;
        factory: Factory;

        class?: string;
        enableKeyInput?: boolean;

        onupdate?: VoidFunction;
        onchange?: (machine: Machine) => void;
    }

    let {
        obj = $bindable(),
        factory,

        class: className,
        enableKeyInput = false,

        onupdate: update = () => {},
        onchange: change = () => {}
    }: Props = $props();

    async function updateMachine(machineId: MachineId) {
        const { id, label } = obj;

        if (!factory.hasLoadedMachine(machineId)) await factory.loadMachine(machineId);
        const machine = factory.machine(machineId, id, label);

        obj.machine = machineId;
        machine.copyFromObj(obj);

        const { animation } = machineData[machineId];

        machine.setRawAnimation(animation);
        obj.animation = machine.animation;

        update();
        change(machine);
    }
</script>

<div class={twMerge("flex flex-col gap-2 items-center w-full", className)}>
    <Header title="Choose Machine" />

    <MultiGrid gridClass="mx-1" titles={Object.keys(machineIdsByCategory)} minColumns={4} maxColumns={6} tileWidth={64} tileHeight={64} gapWidth={20} gapHeight={12} {enableKeyInput} focusFirst>
        {#snippet children(category, y)}
            <BoxOption label="Select Random Machine" hideBackground onclick={() => updateMachine(Random.item(machineIdsByCategory[category as MachineCategoryName]))}>
                <img src="/static/ui/dice-6.png" alt="" width="64" height="64" draggable="false" role="presentation" aria-hidden="true" />
            </BoxOption>

            {#each Object.values(machineIdsByCategory)[y].map<[MachineId, MachineData]>((id) => [id, machineData[id]]) as [id, { name }], x (id) }
                <BoxOption label={name} selected={id === obj.machine} onclick={() => updateMachine(id as MachineId)}>
                    <SpritesheetImage src="/static/assets/characters/machines.png" label={name} class="m-1" {x} {y} tileWidth={64} tileHeight={64} width={56} height={56} />
                </BoxOption>
            {/each}
        {/snippet}
    </MultiGrid>
</div>