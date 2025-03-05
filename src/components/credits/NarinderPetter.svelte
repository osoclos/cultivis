<script lang="ts">
    import { soundManager } from "../../scripts/managers";

    const NARINDER_PET_DURATION: number = 1917;
    const LAMB_PET_DURATION: number = 1783;

    const PET_LAUGH_START: number = 783;

    interface Props { onclick?: VoidFunction; }
    const { onclick: click = () => {} }: Props = $props();

    let isPettingNarinder: boolean = $state(false);
    let isLambPetting: boolean = $state(false);

    function onclick() {
        if (isPettingNarinder || isLambPetting) return;

        isPettingNarinder = true;
        isLambPetting = true;

        setTimeout(() => isPettingNarinder = false, NARINDER_PET_DURATION);
        setTimeout(() => isLambPetting = false, LAMB_PET_DURATION);

        setTimeout(() => soundManager.play("Pet_Laugh"), PET_LAUGH_START);

        click();
    }
</script>

<button class="relative ml-8 w-50 h-30 outline-none" {onclick}>
    <img src="/static/assets/credits/narinder-{isPettingNarinder ? "pet" : "idle"}.apng" alt="Narinder" class="absolute top-0 left-0 h-30" draggable="false" role="presentation" aria-hidden="true" />
    <img src="/static/assets/credits/lamb-{isLambPetting ? "pet" : "idle"}.apng" alt="Lamb" class="absolute -top-6 right-0 h-36" draggable="false" role="presentation" aria-hidden="true" />
</button>