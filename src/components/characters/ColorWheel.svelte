<script lang="ts">
    import type { Action } from "svelte/action";
    import { MoreMath, Vector } from "../../utils";

    interface Props { oninput?: (color: string) => void; }
    const { oninput: input = () => {} }: Props = $props();

    let triangle: HTMLDivElement;

    let hue: number = $state(0);
    let saturation: number = $state(1.0);
    let brightness: number = $state(0.5);

    const color = $derived(`hsl(${((hue % 360) + 360) % 360}deg ${saturation * 100}% ${brightness * 100}%)`);

    const pointerEvents: Action<HTMLDivElement> = (container) => {
        const pointerPos = new Vector();

        const containerCenter = new Vector(container.clientWidth, container.clientHeight).divVal(2);
        const triangleCenter = new Vector(triangle.clientWidth, triangle.clientHeight).divVal(2);

        let pointerTarget: HTMLElement | null = null;

        function updateHue() {
            hue = MoreMath.radToDeg(pointerPos.ang(containerCenter)) + 90;
            input(color);
        }

        function onPointerDown({ pointerId, offsetX, offsetY, target }: PointerEvent) {
            if (pointerTarget) return;
            container.setPointerCapture(pointerId);

            pointerTarget = target as HTMLElement;
            pointerPos.set(offsetX, offsetY);
            
            updateHue();
        }

        function onPointerMove({ offsetX, offsetY }: PointerEvent) {
            if (pointerTarget !== container) return;
            pointerPos.set(offsetX, offsetY);

            updateHue();
        }

        function onPointerUp({ pointerId }: PointerEvent) {
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

            const [minBrightness, minSaturation] = Vector.fromAng(MoreMath.degToRad(150), 40, triangleCenter); // 240 - 90 === 150 deg
            const [maxBrightness, maxSaturation] = Vector.fromAng(MoreMath.degToRad(-60), 40, triangleCenter); // 30 - 90 === -60 deg

            saturation = (MoreMath.clamp(offsetY, maxSaturation, minSaturation) - minSaturation) / (maxSaturation - minSaturation);
            brightness = (MoreMath.clamp(offsetX, minBrightness, maxBrightness) - minBrightness) / (maxBrightness - minBrightness);

            input(color);
        }

        $effect(() => {
            container.addEventListener("pointerdown", onPointerDown);
            container.addEventListener("pointermove", onPointerMove);
            container.addEventListener("pointerup", onPointerUp);

            triangle.addEventListener("pointerdown", onTrianglePointerDown);
            triangle.addEventListener("pointermove", onTrianglePointerMove);

            return () => {
                container.removeEventListener("pointerdown", onPointerDown);
                container.removeEventListener("pointermove", onPointerMove);
                container.removeEventListener("pointerup", onPointerUp);

                triangle.removeEventListener("pointerdown", onTrianglePointerDown);
                triangle.removeEventListener("pointermove", onTrianglePointerMove);
            };
        });
    };
</script>

<div>
    <div use:pointerEvents class="rainbow-gradient aspect-square grid place-items-center w-24 rounded-full">
        <div bind:this={triangle} class="aspect-square grid relative justify-center w-20 bg-secondary rounded-full" style:transform="rotate({hue}deg)">
            <div class="triangle aspect-square w-16" style:background-color="hsl({hue}deg 100% 50%)"></div>
            <div class="triangle aspect-square absolute top-0 left-1/2 w-16 bg-gradient-to-br from-transparent from-33% to-white -translate-x-1/2"></div>
            <div class="triangle aspect-square absolute top-0 left-1/2 w-16 bg-gradient-to-bl from-transparent from-33% to-black -translate-x-1/2"></div>
        </div>
    </div>
</div>

<style>
    .triangle { clip-path: polygon(50% 0%, 100% 100%, 0% 100%); }
    .rainbow-gradient { background-image: conic-gradient(hsl(0deg 100% 50%), hsl(30deg 100% 50%), hsl(60deg 100% 50%), hsl(90deg 100% 50%), hsl(120deg 100% 50%), hsl(150deg 100% 50%), hsl(180deg 100% 50%), hsl(210deg 100% 50%), hsl(240deg 100% 50%), hsl(270deg 100% 50%), hsl(300deg 100% 50%), hsl(360deg 100% 50%)) }
</style>