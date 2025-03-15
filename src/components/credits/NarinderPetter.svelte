<script lang="ts" module>
    export const HAS_PET_NARINDER_LOCAL_STORAGE_NAME: string = "has-pet-narinder";
</script>

<script lang="ts">
    import { soundManager } from "../../scripts/managers";
    import { SpritesheetImage } from "../utils";

    const NARINDER_FRAME_LENGTHS: number[] = [59, 121];
    const NARINDER_FRAME_WIDTH: number = 77;
    const NARINDER_FRAME_HEIGHT: number = 80;

    const LAMB_FRAME_LENGTHS: number[] = [181, 110];
    const LAMB_FRAME_WIDTH: number = 86;
    const LAMB_FRAME_HEIGHT: number = 101;

    const LAUGH_SOUND_FRAME_INDEX_START: number = 48;

    interface Props {
        hasPetNarinder?: boolean;
        onclick?: VoidFunction;
    }

    let {
        hasPetNarinder = $bindable(false),
        onclick: click = () => {}
    }: Props = $props();

    let isPettingNarinder: boolean = $state(false);
    let isLambPetting: boolean = $state(false);

    let hasPlayedSound: boolean = $state(true);

    let narinderCount: number = $state(0);
    let lambCount: number = $state(0);

    setInterval(() => {
        narinderCount++;
        lambCount++;

        if (isPettingNarinder && narinderCount >= NARINDER_FRAME_LENGTHS[1]) {
            isPettingNarinder = false;
            narinderCount = 0;
        }

        if (isLambPetting && lambCount >= LAMB_FRAME_LENGTHS[1]) {
            isLambPetting = false;
            lambCount = 0;
        }

        if (!hasPlayedSound && narinderCount >= LAUGH_SOUND_FRAME_INDEX_START) {
            hasPlayedSound = true;
            soundManager.play("Laugh");
        }
    }, 1000 / 60);

    function onclick() {
        if (isPettingNarinder || isLambPetting) return;
        isPettingNarinder = true;
        isLambPetting = true;

        hasPetNarinder = true;
        localStorage.setItem(HAS_PET_NARINDER_LOCAL_STORAGE_NAME, "PET");

        hasPlayedSound = false;

        narinderCount = 0;
        lambCount = 0;

        click();
    }
</script>

<button class="relative ml-12 w-38 h-24 outline-none" {onclick}>
    <SpritesheetImage src="/static/assets/credits/narinder-petting.png" label={isPettingNarinder ? "Narinder Being Pet" : "Narinder Idling"} class="absolute top-0 left-0 scale-125" x={narinderCount % NARINDER_FRAME_LENGTHS[+isPettingNarinder]} y={+isPettingNarinder} tileWidth={NARINDER_FRAME_WIDTH} tileHeight={NARINDER_FRAME_HEIGHT} />
    <SpritesheetImage src="/static/assets/credits/lamb-petting.png" label={isLambPetting ? "Lamb Petting" : "Lamb Idling"} class="absolute -top-7 right-0 scale-125" x={lambCount % LAMB_FRAME_LENGTHS[+isLambPetting]} y={+isLambPetting} tileWidth={LAMB_FRAME_WIDTH} tileHeight={LAMB_FRAME_HEIGHT} />
</button>