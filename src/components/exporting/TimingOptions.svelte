<script lang="ts">
    import { Label, LabelTitle, Notice, NumberInput, Toggle } from "../base";

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

<div class="flex flex-col gap-6 items-center mx-8">
    <LabelTitle title="Timing" />

    <div class="flex flex-col gap-8 w-80 sm:w-90">
        {#if !trimLongest}
            <Label label="Duration">
                <NumberInput label="Duration" bind:value={duration} unit="s" step={0.01} max={Infinity} {oninput} />
            </Label>

            {#if duration > 60}
                <Notice label="Your device may not be able to handle exports that are longer than a minute. Note that you may crash your browser and lose your scene if you attempt to do so." />
            {/if}
        {/if}

        <Label class="my-2" label="Auto-Trim Animation">
            <Toggle label="Auto-Trim Animation" bind:enabled={trimLongest} {oninput} />
        </Label>

        {#if duration > 60 && trimLongest}
            <Notice label="Your device may not be able to handle exports that are longer than a minute. Note that you may crash your browser and lose your scene if you attempt to do so." />
        {/if}
    </div>
</div>