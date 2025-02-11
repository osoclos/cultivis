<script lang="ts">
    import { onDestroy, onMount } from "svelte";
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

    let canvas: HTMLCanvasElement;

    const pointers: Set<number> = new Set();
    const touches: Map<number, PointerEvent> = new Map();
    
    const pinchMidpoint = $state(Vector.NegOne.toObj());
    let lastPinchDist: number = -1;

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
    
    function onpointerdown(evt: PointerEvent) {
        const { pointerId, pointerType } = evt;

        canvas.setPointerCapture(pointerId);
        pointers.add(pointerId);

        const isTouch = pointerType === "touch";
        isTouch && touches.set(pointerId, evt);
    }

    function onpointermove(evt: PointerEvent) {
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

    function onpointerup(evt: PointerEvent) {
        const { pointerId, pointerType } = evt;
        
        canvas.releasePointerCapture(pointerId);
        pointers.delete(pointerId);

        const isTouch = pointerType === "touch";
        isTouch && touches.delete(pointerId);

        lastPinchDist = -1;
        Vector.NegOne.cloneObj(pinchMidpoint);
    }

    function onwheel(evt: WheelEvent) {
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

    onMount(() => {
        load(canvas);
        resizer.observe(canvas);
    });

    onDestroy(() => resizer.disconnect());
</script>

<canvas bind:this={canvas} class={twMerge("box-content block touch-none", className)} {style} {onpointerdown} {onpointermove} {onpointerup} {onwheel}></canvas>