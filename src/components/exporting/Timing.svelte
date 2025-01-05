<script lang="ts">
    import { Label, LabelTitle, NumberInput, Toggle } from "../base";

    interface Options {
        duration: number;
        trimLongest: boolean;
    }

    interface Props extends Options { oninput?: (options: Options) => void; }

    let {
        duration = $bindable(),
        trimLongest = $bindable(),

        oninput: input = () => {}
    }: Props = $props();

    function oninput() {
        input({ duration, trimLongest });
    }
</script>

<div class="flex flex-col items-center gap-6 mx-8">
    <LabelTitle title="Timing" />

    <div class="flex flex-col gap-2 w-80 sm:w-90">
        {#if !trimLongest}
            <Label label="Duration">
                <NumberInput label="Duration" bind:value={duration} unit="s" step={0.01} max={Infinity} {oninput} />
            </Label>
        {/if}

        <Label class="my-2" label="Trim to Longest">
            <Toggle label="Trim to Longest" bind:enabled={trimLongest} {oninput} />
        </Label>
    </div>
</div>