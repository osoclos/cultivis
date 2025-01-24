<script lang="ts">
    import type { Action } from "svelte/action";
    import { twMerge } from "tailwind-merge";

    import { Vector } from "../../utils";

    interface Props {
        size?: Vector;
        setSize?: boolean;

        class?: string;
        style?: string;

        onload?: (canvas: HTMLCanvasElement) => void;
        onresize?: (size: Vector, renderSize: Vector) => void;

        onshift?: (delta: Vector) => void;
        onscroll?: (delta: Vector) => void;

        onzoom?: (factor: number, percentOrigin: Vector) => void;
        onpinch?: (factor: number, percentMidpoint: Vector) => void;
    }

    const {
        class: className,
        style,

        onload: load = () => {},
        onresize: resize = () => {},

        onshift: shift = () => {},
        onscroll: scroll = () => {},

        onzoom: zoom = () => {},
        onpinch: pinch = () => {},
    }: Props = $props();

    const pointers: Set<number> = new Set();
    const touches: Map<number, PointerEvent> = new Map();
    
    const pinchMidpoint = $state(Vector.NegOne.toObj());
    let lastPinchDist: number = -1;

    const canvasEvents: Action<HTMLCanvasElement> = (canvas) => {
        const resizer = new ResizeObserver(([canvasEntry]) => {
            const dpr = window.devicePixelRatio;
            const {
                inlineSize: clientWidth,
                blockSize: clientHeight
            } = canvasEntry.contentBoxSize[0];

            const size = new Vector(clientWidth, clientHeight);
            const renderSize = Vector.mulVal(size, dpr);

            const [width, height] = renderSize;
            canvas.width = width;
            canvas.height = height;

            resize(size, renderSize);
        });
        
        function onPointerDown(evt: PointerEvent) {
            const { pointerId, pointerType } = evt;

            canvas.setPointerCapture(pointerId);
            pointers.add(pointerId);

            const isTouch = pointerType === "touch";
            isTouch && touches.set(pointerId, evt);
        }

        function onPointerMove(evt: PointerEvent) {
            const { pointerId, pointerType } = evt;
            if (!pointers.has(pointerId)) return;

            pointerType === "touch" && touches.set(pointerId, evt);

            if (touches.size !== 2) {
                const { movementX, movementY } = evt;

                const delta = new Vector(movementX, movementY);
                shift(delta);

                return;
            }

            const [touch1, touch2] = [...touches.values()].map(({ offsetX, offsetY }) => new Vector(offsetX, offsetY));
            const dist = touch1.dist(touch2);
            const lastDist = lastPinchDist < 0 ? dist : lastPinchDist;

            const factor = dist / lastDist;
            Vector.NegOne.equalsObj(pinchMidpoint) && Vector.avg(touch1, touch2).cloneObj(pinchMidpoint);

            const { clientWidth, clientHeight } = canvas;
            const center = new Vector(clientWidth, clientHeight).divVal(2);

            const midpoint = Vector.fromObj(pinchMidpoint).sub(center).mulVal(dist - lastDist);
            pinch(factor, Vector.div(midpoint, center));

            lastPinchDist = dist;
        }

        function onPointerUp(evt: PointerEvent) {
            const { pointerId, pointerType } = evt;
            
            canvas.releasePointerCapture(pointerId);
            pointers.delete(pointerId);

            const isTouch = pointerType === "touch";
            isTouch && touches.delete(pointerId);

            lastPinchDist = -1;
            Vector.NegOne.cloneObj(pinchMidpoint);
        }

        function onWheel(evt: WheelEvent) {
            const { deltaX, deltaY, offsetX, offsetY, shiftKey, ctrlKey, altKey } = evt;
            evt.preventDefault();

            if (!ctrlKey && !altKey) {
                const delta = new Vector(deltaX, deltaY);
                shiftKey && delta.swap();

                scroll(delta);
                return;
            }

            const { clientWidth, clientHeight } = canvas;

            const center = new Vector(clientWidth, clientHeight).divVal(2);
            const pos = new Vector(offsetX, offsetY);

            const fromCenter = Vector.sub(pos, center);
            zoom(deltaY, Vector.div(fromCenter, center));
        }

        $effect(() => {
            load(canvas);
            resizer.observe(canvas);

            canvas.addEventListener("pointerdown", onPointerDown);
            canvas.addEventListener("pointermove", onPointerMove);
            canvas.addEventListener("pointerup", onPointerUp);
            
            canvas.addEventListener("wheel", onWheel, true);

            return () => {
                resizer.disconnect();

                canvas.removeEventListener("pointerdown", onPointerDown);
                canvas.removeEventListener("pointermove", onPointerMove);
                canvas.removeEventListener("pointerup", onPointerUp);

                canvas.removeEventListener("wheel", onWheel);
            };
        });
    }
</script>

<canvas use:canvasEvents class={twMerge("box-content block touch-none", className)} {style}></canvas>