import { Scene, Factory, type SceneObject, type ActorObject, Actor } from ".";
import { Vector } from "../utils";

import { Follower, isBishopObj, isFollowerObj, isTOWW_Obj, isPlayerObj, Player } from "./characters";
import { GIFManager } from "./managers";

export class Exporter {
    static readonly ASSETS_ROOT: string = "assets";

    private constructor(public canvas: HTMLCanvasElement | OffscreenCanvas, public gl: WebGLRenderingContext, public scene: Scene, public factory: Factory, private gifManager: GIFManager) {}
    static async create(scene?: Scene, initFactory?: Factory) {
        if (!scene) {
            const canvas = new OffscreenCanvas(300, 150);

            const gl = canvas.getContext("webgl") as WebGLRenderingContext;
            if (!gl) throw new Error("Unable to retrieve context from canvas");

            scene = new Scene(gl);
        }

        const { canvas, gl } = scene;

        const factory = initFactory ?? await Factory.create(gl, this.ASSETS_ROOT);
        const gifManager = new GIFManager();

        return new Exporter(canvas, gl, scene, factory, gifManager);
    }

    async exportScene(obj: SceneObject, duration: number, size: Vector, onProgress: (progress: number) => void = () => {}) {
        const [width, height] = size;

        this.resetScene();
        await this.setupScene(obj, size);

        return new Promise<Uint8Array>((resolve) => {
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
                if (!this.factory.hasLoadedFollower) await this.factory.load(Follower);
                const { form, clothing } = obj;
                
                const follower = this.factory.follower(form, clothing, id, label);
                follower.copyFromObj(obj);

                actor = follower;
                break;
            }

            case isPlayerObj(obj): {
                if (!this.factory.hasLoadedPlayer) await this.factory.load(Player);
                const { creature, fleece } = obj;
                
                const player = this.factory.player(creature, fleece, id, label);
                player.copyFromObj(obj);

                actor = player;
                break;
            }

            case isBishopObj(obj): {
                const { bishop: id, isBoss } = obj;
                if (!this.factory.hasLoadedBishop(id, isBoss)) await this.factory.loadBishop(id, isBoss);

                const bishop = this.factory.bishop(id, isBoss, id, label);
                bishop.copyFromObj(obj);

                actor = bishop;
                break;
            }

            case isTOWW_Obj(obj): {
                const { form } = obj;
                if (!this.factory.hasLoadedTOWW(form)) await this.factory.loadTOWW(form);

                const toww = this.factory.TOWW(form, id, label);
                toww.copyFromObj(obj);

                actor = toww;
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