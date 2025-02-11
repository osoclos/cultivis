<script lang="ts">
    import { MoreMath, Vector } from "../../utils";

    interface Props { oninput?: (color: string) => void; }
    const { oninput: input = () => {} }: Props = $props();

    let container: HTMLDivElement;
    let triangle: HTMLDivElement;

    let hue: number = $state(0);
    let saturation: number = $state(1.0);
    let brightness: number = $state(0.5);

    const color = $derived(`hsl(${((hue % 360) + 360) % 360}deg ${saturation * 100}% ${brightness * 100}%)`);

    const pointerPos = new Vector();
    let pointerTarget: HTMLElement | null = null;

    function updateHue() {
        const containerCenter = new Vector(container.clientWidth, container.clientHeight).divVal(2);

        hue = MoreMath.radToDeg(pointerPos.ang(containerCenter)) + 90;
        input(color);
    }

    function onpointerdown({ pointerId, offsetX, offsetY, target }: PointerEvent) {
        if (pointerTarget) return;
        container.setPointerCapture(pointerId);

        pointerTarget = target as HTMLElement;
        pointerPos.set(offsetX, offsetY);
        
        updateHue();
    }

    function onpointermove({ offsetX, offsetY }: PointerEvent) {
        if (pointerTarget !== container) return;
        pointerPos.set(offsetX, offsetY);

        updateHue();
    }

    function onpointerup({ pointerId }: PointerEvent) {
        container.releasePointerCapture(pointerId);
        triangle.releasePointerCapture(pointerId);

        pointerTarget = null;
    }

    function onTrianglePointerDown({ pointerId, target }: PointerEvent) {
        triangle.setPointerCapture(pointerId);
        pointerTarget = target as HTMLElement;
    }

    function onTrianglePointerMove({ offsetX, offsetY }: PointerEvent) {
        if (![...triangle.children].includes(pointerTarget!)) return;
        const triangleCenter = new Vector(triangle.clientWidth, triangle.clientHeight).divVal(2);

        const [minBrightness, minSaturation] = Vector.fromAng(MoreMath.degToRad(150), 40, triangleCenter); // 240 - 90 === 150 deg
        const [maxBrightness, maxSaturation] = Vector.fromAng(MoreMath.degToRad(-60), 40, triangleCenter); // 30 - 90 === -60 deg

        saturation = (MoreMath.clamp(offsetY, maxSaturation, minSaturation) - minSaturation) / (maxSaturation - minSaturation);
        brightness = (MoreMath.clamp(offsetX, minBrightness, maxBrightness) - minBrightness) / (maxBrightness - minBrightness);

        input(color);
    }
</script>

<div bind:this={container} class="aspect-square grid place-items-center w-24 bg-conic-[in_hsl_longer_hue] from-[#ff0000] to-[#ff0000] rounded-full" {onpointerdown} {onpointermove} {onpointerup}>
    <div bind:this={triangle} class="aspect-square grid relative justify-center w-20 bg-secondary rounded-full" style:transform="rotate({hue}deg)" onpointerdown={onTrianglePointerDown} onpointermove={onTrianglePointerMove}>
        <div class="triangle aspect-square w-16" style:background-color="hsl({hue}deg 100% 50%)"></div>
        <div class="triangle aspect-square absolute top-0 left-1/2 w-16 bg-gradient-to-br from-transparent from-33% to-white -translate-x-1/2"></div>
        <div class="triangle aspect-square absolute top-0 left-1/2 w-16 bg-gradient-to-bl from-transparent from-33% to-black -translate-x-1/2"></div>
    </div>
</div>

<style>
    .triangle { clip-path: polygon(50% 0%, 100% 100%, 0% 100%); }
</style>