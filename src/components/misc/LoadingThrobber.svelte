<script lang="ts">
    import { onMount } from "svelte";
    import { ProgressRing } from "../base";

    interface Props {
        percent?: number;

        isOnPhone?: boolean;
        isMobile?: boolean;
    }

    const {
        percent = 0,

        isOnPhone = false,
        isMobile = false
    }: Props = $props();

    const progress: number = $derived(percent / 100);

    let outline: HTMLImageElement;
    onMount(() => requestAnimationFrame(() => outline.classList.replace("scale-60", "scale-100")));
</script>

<div class="relative">
    <ProgressRing class="aspect-square {
        isOnPhone
            ? "w-24" :
        isMobile
            ? "w-28"
            : "w-36"
    } not-motion-reduce:animate-spin" style="animation-duration: 1500ms" label="Loading Bar" {progress} radius={72 - 16 * +isMobile - 8 * +isOnPhone} width={10 - 3 * +isMobile - +isOnPhone} showGradient />

    <div class="aspect-square absolute top-1/2 left-1/2 {
        isOnPhone
            ? "w-16" :
            isMobile
            ? "w-18"
            : "w-23"
    } -translate-1/2">
        <img src="/static/ui/crown.png" srcset="/static/ui/crown.webp, /static/ui/crown.png" alt="" class="absolute top-1/2 left-1/2 -translate-1/2" width={84 - 18 * +isMobile - 6 * +isOnPhone} height={84 - 18 * +isMobile - 6 * +isOnPhone} draggable="false" role="presentation" aria-hidden="true" />
        <img bind:this={outline} src="/static/ui/crown-outline.png" srcset="/static/ui/crown-outline.webp, /static/ui/crown-outline.png" alt="" class="absolute top-1/2 left-1/2 -z-10 transition-transform duration-450 delay-900 ease-out scale-60 motion-reduce:scale-100 -translate-1/2" width={92 - 20 * +isMobile - 4 * +isOnPhone} height={92 - 20 * +isMobile - 4 * +isOnPhone} draggable="false" role="presentation" aria-hidden="true" />

        <img src="/static/ui/open-eye.png" srcset="/static/ui/open-eye.webp, /static/ui/open-eye.png" alt="" class="absolute top-5/9 left-1/2 -translate-1/2" width={32 - 6 * +isMobile - 2 * +isOnPhone} height={16 - 3 * +isMobile - +isOnPhone} draggable="false" role="presentation" aria-hidden="true" />
    </div>
</div>