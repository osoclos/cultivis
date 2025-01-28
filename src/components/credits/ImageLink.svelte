<script lang="ts">
    import { SpritesheetImage } from "../utils";
    import { soundManager } from "../../scripts/managers";

    interface Props {
        label: string;
        href: string;
        
        src: string;
        x: number;
        y: number;
    }

    const { label, href, src, x, y }: Props = $props();
</script>

<!-- highlight color filter: hover:brightness-80 hover:hue-rotate-15 hover:saturate-240 -->
<a {href} class="outline-none brightness-360 hue-rotate-45 saturate-120 hover:brightness-185 hover:hue-rotate-168 hover:saturate-200 active:brightness-185 active:hue-rotate-168 active:saturate-200 not-motion-reduce:transition-[filter,_translate] not-motion-reduce:duration-150 hover:-translate-y-1 active:-translate-y-1" target="_blank" aria-label={label} onpointerenter={() => soundManager.play("Option_Change")}>
    <SpritesheetImage {src} {label} {x} {y} tileWidth={256} tileHeight={128} width={160} height={80} />
</a>