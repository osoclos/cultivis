import { Scene, Factory, type SceneObject, type ActorObject, Actor } from ".";
import { Vector } from "../utils";

import { Follower, isBishopObj, isFollowerObj, isPlayerObj, Player } from "./characters";
import { GIFManager } from "./managers";

export class Exporter {
    private constructor(public canvas: HTMLCanvasElement | OffscreenCanvas, public gl: WebGLRenderingContext, public scene: Scene, public factory: Factory, private gifManager: GIFManager) {}
    static async create(canvas: HTMLCanvasElement | OffscreenCanvas = new OffscreenCanvas(300, 150), exporterFactory?: Factory) {
        const gl = canvas.getContext("webgl") as WebGLRenderingContext;
        if (!gl) throw new Error("Unable to retrieve context from canvas");

        const scene = new Scene(gl);

        const factory = exporterFactory ?? await Factory.create(gl, "assets");
        
        // when bishop customisation is ready uncomment this: !exporterFactory && await factory.loadAll();
        !exporterFactory && await factory.load(Follower, Player);

        const gifManager = new GIFManager();

        return new Exporter(canvas, gl, scene, factory, gifManager);
    }

    async exportScene(obj: SceneObject, duration: number, size: Vector, onProgress: (percent: number) => void = () => {}) {
        const [width, height] = size;

        this.resetScene();
        await this.setupScene(obj, size);

        const buffer = new Promise<Uint8Array>((resolve) => {
            this.gifManager.reset();

            let time: number = 0;
            const draw = (delta: number) => {
                this.scene.render(delta);

                const pixels = this.getPixels();
                this.gifManager.addFrame(pixels, width, height, delta * 1000);

                if (time > duration) {
                    const buffer = this.gifManager.end();
                    resolve(buffer);

                    onProgress(1.0);
                    return;
                }

                onProgress(time / duration);
                time += delta;
                
                setTimeout(() => draw(delta));
            };

            draw(1 / 50);
        });

        return buffer;
    }

    async dispose() {
        this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    }

    private async setupScene(obj: SceneObject, exportSize: Vector) {
        const { actors: actorObjects, translation, scale, backgroundColor } = obj;
    
        this.scene.translation.copyObj(translation);
        this.scene.scale = scale;

        this.scene.size.copyObj(exportSize);
        this.scene.renderSize.copy(exportSize);

        const [width, height] = exportSize;
        this.canvas.width = width;
        this.canvas.height = height;

        const actors = await Promise.all(actorObjects.filter(({ hidden }) => !hidden).map(this.createActor.bind(this)).filter((actor) => !!actor));
        this.scene.addActors(...actors);

        this.scene.backgroundColor.copyObj(backgroundColor);
    }

    private resetScene() {
        this.scene.removeActors(...this.scene.actors);
        this.scene.resetCamera();
    }

    private async createActor(obj: ActorObject) {
        const { id, label, animation } = obj;
        let actor: Actor;

        switch (true) {
            case isFollowerObj(obj): {
                if (!this.factory.loadedFollower) await this.factory.load(Follower);
                const { form, clothing } = obj;
                
                const follower = this.factory.follower(form, clothing, id, label);
                follower.copyFromObj(obj);

                actor = follower;
                break;
            }

            case isPlayerObj(obj): {
                if (!this.factory.loadedPlayer) await this.factory.load(Player);
                const { creature, fleece } = obj;
                
                const player = this.factory.player(creature, fleece, id, label);
                player.copyFromObj(obj);

                actor = player;
                break;
            }

            case isBishopObj(obj): {
                const { bishop: id, isBoss } = obj;
                if (!this.factory.getLoadedBishop(id, isBoss)) await this.factory.loadBishop(id, isBoss);

                const bishop = await this.factory.bishop(id, isBoss, id, label);
                bishop.copyFromObj(obj);

                actor = bishop;
                break;
            }

            default: throw new Error("Invalid or unknown actor object used to create actor");
        }
        
        actor.setAnimation(animation);
        return actor;
    }

    getPixels(x: number = 0, y: number = 0, width: number = this.gl.drawingBufferWidth, height: number = this.gl.drawingBufferHeight, flipY: boolean = true) {
        const bufferSize = width * height * 4; // width * height * 4 RGBA values
        
        const pixels = new Uint8Array(bufferSize);
        this.gl.readPixels(x, y, width, height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

        if (!flipY) return pixels;

        const flippedPixels = new Uint8Array(bufferSize);
        for (const y of Array(height).keys()) flippedPixels.set(pixels.subarray(width * (height - y - 1) * 4, width * (height - y) * 4), width * y * 4);

        return flippedPixels;
    }
}