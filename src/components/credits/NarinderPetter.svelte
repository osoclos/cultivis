<script lang="ts">
    import { soundManager } from "../../scripts/managers";

    interface Props { onclick?: VoidFunction; }
    const { onclick: click = () => {} }: Props = $props();

    let isPettingNarinder: boolean = $state(false);
    let isLambPetting: boolean = $state(false);

    function onclick() {
        if (isPettingNarinder || isLambPetting) return;
        isPettingNarinder = true;
        isLambPetting = true;

        click();

        setTimeout(() => isPettingNarinder = false, 1917);
        setTimeout(() => isLambPetting = false, 1800);

        setTimeout(() => soundManager.play("Pet_Laugh"), 783);
    }
</script>

<button class="relative ml-8 w-50 h-30" {onclick}>
    <img src="/static/assets/credits/narinder-{isPettingNarinder ? "pet" : "idle"}.apng" alt="Narinder" class="absolute top-0 left-0 h-30" draggable="false" role="presentation" aria-hidden="true" />
    <img src="/static/assets/credits/lamb-{isLambPetting ? "pet" : "idle"}.apng" alt="Lamb" class="absolute -top-6 right-0 h-36" draggable="false" role="presentation" aria-hidden="true" />
</button>