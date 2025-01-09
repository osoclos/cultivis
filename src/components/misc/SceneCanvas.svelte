<script lang="ts">
    import { onDestroy } from "svelte";
    import { twMerge } from "tailwind-merge";

    import { InteractiveCanvas } from "../utils";
    
    import { Factory, Scene } from "../../scripts";
    import { Follower, Player } from "../../scripts/characters";

    import { Vector } from "../../utils";

    let canvas: HTMLCanvasElement;
    let gl: WebGLRenderingContext;

    let scene: Scene;
    let factory: Factory;

    interface Props {
        disableManipulation?: boolean;
        manipulationIdx?: number;

        class?: string;
        style?: string;

        onload?: (scene: Scene, factory: Factory, canvas: HTMLCanvasElement) => void;
        
        onshift?: (delta: Vector) => void;
        onscroll?: (delta: Vector) => void;

        onzoom?: (factor: number, origin: Vector) => void;
        onpinch?: (factor: number, pos: Vector) => void;
    }

    const {
        disableManipulation = false,
        manipulationIdx = -1,
        
        class: className,
        style,

        onload: load = () => {},

        onshift: shift = () => {},
        onscroll: scroll = () => {},

        onzoom: zoom = () => {},
        onpinch: pinch = () => {}
    }: Props = $props();

    let drawId: number;

    let lastTime: number;
    function draw(time: number) {
        const deltaTime = time - (lastTime ?? time);
        scene.render(deltaTime / 1000);

        lastTime = time;
        drawId = requestAnimationFrame(draw);
    }

    onDestroy(() => gl.getExtension("WEBGL_lose_context")?.loseContext());
    async function onload(tempCanvas: HTMLCanvasElement) {
        canvas = tempCanvas;

        const tempGL = canvas.getContext("webgl");
        if (!tempGL) throw new Error("Unable to retrieve context from canvas");
        
        gl = tempGL;
        scene = new Scene(gl);
        
        factory = await Factory.create(gl, "assets");
        await factory.load(Follower, Player)

        load(scene, factory, canvas);
        requestAnimationFrame(draw);
    }

    function onresize(_size: Vector, renderSize: Vector) {
        drawId && cancelAnimationFrame(drawId);
        scene.renderSize.copy(renderSize);

        drawId = requestAnimationFrame(draw);
    }

    function onshift(delta: Vector) {
        if (disableManipulation) return;
        const { clientWidth, clientHeight } = canvas;

        const sceneDelta = Vector.negY(delta).mul(Vector.divVal(scene.size, clientWidth, clientHeight)).mulVal(scene.scale);
        manipulationIdx < 0 ? scene.translation.sub(sceneDelta) : scene.actors[manipulationIdx].pos.add(sceneDelta);

        shift(delta);
    }

    function onscroll(delta: Vector) {
        if (disableManipulation) return;

        const sceneDelta = Vector.mulVal(delta, scene.scale / 6);
        manipulationIdx < 0 ? scene.translation.sub(sceneDelta) : scene.actors[manipulationIdx].pos.add(sceneDelta);

        scroll(delta);
    }

    function onzoom(factor: number, origin: Vector) {
        if (disableManipulation) return;

        const delta = Vector.mulVal(origin, scene.scale * factor).negX();
        const sceneFactor = factor / 600;

        if (manipulationIdx < 0) {
            scene.translation.add(delta);
            scene.scale *= sceneFactor + 1;
        } else {
            const actor = scene.actors[manipulationIdx];

            actor.pos.sub(delta);
            actor.scale.sub(Vector.mulVal(actor.scale, sceneFactor));
        }

        zoom(factor, origin);
    }

    function onpinch(factor: number, pos: Vector) {
        if (disableManipulation) return;

        const delta = Vector.mulVal(pos, scene.scale).negY();
        
        if (manipulationIdx < 0) {
            scene.translation.add(delta);
            scene.scale /= factor;
        } else {
            const actor = scene.actors[manipulationIdx];

            actor.pos.add(delta);
            actor.scale.mulVal(factor);
        }
        
        pinch(factor, pos);
    }
</script>

<InteractiveCanvas class={twMerge("w-full rounded-xl border border-gray-200 dark:border-night-border shadow-lg", className)} {style} setSize={false} {onload} {onresize} {onshift} {onscroll} {onzoom} {onpinch} />