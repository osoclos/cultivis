import { Color, Vector, type ColorObject, type VectorObject } from "../utils";
import { Actor, type ActorObject } from "./Actor";

export class Scene implements SceneObject {
    renderer: spine.webgl.SceneRenderer;
    #actors: Set<Actor>;

    translation: Vector;
    #scale: number;

    size: Vector;
    renderSize: Vector;

    #sceneOffset: Vector;
    #sceneSize: Vector;

    backgroundColor: Color;
    drawDebug: boolean;
    
    constructor(public gl: WebGLRenderingContext) {
        this.renderer = new spine.webgl.SceneRenderer(this.canvas as HTMLCanvasElement, gl, true);
        this.#actors = new Set();

        this.translation = Vector.Zero;
        this.#scale = 1;

        const { width, height } = this.canvas;
        let clientWidth = width;
        let clientHeight = height;

        if (this.canvas instanceof HTMLCanvasElement) ({ clientWidth, clientHeight } = this.canvas);
            
        this.size = new Vector(clientWidth, clientHeight);
        this.renderSize = new Vector(width, height);

        this.#sceneOffset = Vector.Min;
        this.#sceneSize = Vector.Zero;

        this.backgroundColor = new Color(0, 0, 0, 0);
        this.drawDebug = false;
    }

    get canvas() {
        return this.gl.canvas;
    }

    get actors(): Actor[] {
        return [...this.#actors];
    }

    get scale(): number {
        return this.#scale;
    }

    set scale(scale: number) {
        this.#scale = Math.max(scale, Number.EPSILON);
    }

    get sceneOffset() {
        return this.#sceneOffset.clone();
    }

    get sceneSize() {
        return this.#sceneSize.clone();
    }

    render(delta: number) {
        const { r, g, b, a } = this.backgroundColor.normalize();
        this.gl.clearColor(r, g, b, a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        const [width, height] = this.renderSize;
        const [canvasWidth, canvasHeight] = this.size;

        this.renderer.camera.setViewport(canvasWidth, canvasHeight);
        this.gl.viewport(0, 0, width, height);

        const { x, y } = this.translation;
        this.renderer.camera.position.set(x, y, 0);
        this.renderer.camera.zoom = this.scale;
        this.renderer.camera.update();

        this.renderer.begin();
        this.actors.forEach((actor) => this.renderActor(actor, delta, false, false, false));
        this.renderer.end();
    }

    renderActor(actor: Actor, delta: number, updateCamera: boolean = true, startRenderer: boolean = true, endRenderer: boolean = true) {
        const { skeleton, hidden } = actor;
        actor.tick(delta);

        if (updateCamera) {
            const [width, height] = this.renderSize;
            const [canvasWidth, canvasHeight] = this.size;

            this.renderer.camera.setViewport(canvasWidth, canvasHeight);
            this.gl.viewport(0, 0, width, height);

            const { x, y } = this.translation;
            this.renderer.camera.position.set(x, y, 0);
            this.renderer.camera.zoom = this.scale;
            this.renderer.camera.update();
        }
        
        startRenderer && this.renderer.begin();

        !hidden && this.renderer.drawSkeleton(skeleton, false);
        this.drawDebug && this.renderer.drawSkeletonDebug(skeleton, false);

        endRenderer && this.renderer.end();
    }

    toObj(): SceneObject {
        const { actors, translation, scale, size, renderSize, backgroundColor, drawDebug } = this;
        return {
            actors: actors.map((actor) => actor.toObj()),
            
            translation: translation.toObj(),
            scale,

            size: size.toObj(),
            renderSize: renderSize.toObj(),

            backgroundColor: backgroundColor.toObj(),
            drawDebug
        };
    }

    addActors(...actors: Actor[]) {
        actors.forEach((actor) => this.#actors.add(actor));
    }

    removeActors(...actors: Actor[]) {
        actors.forEach((actor) => this.#actors.delete(actor));
    }

    replaceActor(actor: Actor, newActor: Actor) {
        const newActors = this.actors;
        newActors.splice(newActors.indexOf(actor), 1, newActor);

        this.#actors = new Set(newActors);
    }

    findActor(id: string) {
        return this.actors.find(({ id: key }) => key === id);
    }

    findActorsByLabel(label: string) {
        return this.actors.filter(({ label: name }) => name === label);
    }

    // TODO: set custom scenarios in-game
    // setScenario() {

    // }

    resetCamera() {
        this.updateBounds();

        const [width, height] = this.size;
        const [boundsWidth, boundsHeight] = this.sceneSize;

        this.translation.copy(this.sceneOffset.add(this.sceneSize.divVal(2)));
        this.scale = Math.max(boundsWidth / width, boundsHeight / height);
    }

    private updateBounds() {
        if (!this.actors.length) {
            this.#sceneOffset.copy(Vector.Zero);
            this.#sceneSize.copy(this.size);

            return;
        }

        const min = Vector.Max;
        const max = Vector.Min;

        for (const actor of this.actors) {
            const { hidden } = actor;
            if (hidden) continue;

            actor.updateBounds();
            const { size, pos } = actor;

            const halfSize = Vector.divVal(size, 2);
            const bottomLeft = Vector.sub(pos, halfSize);
            const topRight = Vector.add(pos, halfSize);

            min.min(bottomLeft);
            max.max(topRight);
        }

        this.#sceneOffset.copy(min);
        this.#sceneSize.copy(Vector.sub(max, min));
    }
}

export interface SceneObject {
    actors: ActorObject[];

    translation: VectorObject;
    scale: number;

    size: VectorObject;
    renderSize: VectorObject;

    backgroundColor: ColorObject;
    drawDebug: boolean;
}