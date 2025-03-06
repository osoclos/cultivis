import { Scene, Factory, type SceneObject, type ActorObject, Actor } from ".";

import { isBishopObj, isFollowerObj, isTOWW_Obj, isPlayerObj, isWitnessObj, isMiniBossObj, isSoldierObj, isHereticObj } from "./characters";
import { APNG_Manager, GIF_Manager } from "./managers";

import { Vector } from "../utils";

export class Exporter {
    static readonly ASSETS_ROOT: string = "assets";

    private constructor(public canvas: HTMLCanvasElement | OffscreenCanvas, public gl: WebGLRenderingContext, public scene: Scene, public factory: Factory, private gifManager: GIF_Manager, private apngManager: APNG_Manager) {}
    static async create(scene?: Scene, initFactory?: Factory) {
        if (!scene) {
            const canvas = new OffscreenCanvas(300, 150);

            const gl = <WebGLRenderingContext>canvas.getContext("webgl");
            if (!gl) throw new Error("Unable to retrieve context from canvas");

            scene = new Scene(gl);
        }

        const { canvas, gl } = scene;
        const factory = initFactory ?? await Factory.create(gl, this.ASSETS_ROOT);

        const gifManager = new GIF_Manager();
        const apngManager = new APNG_Manager();

        return new Exporter(canvas, gl, scene, factory, gifManager, apngManager);
    }

    async exportScene(obj: SceneObject, duration: number, size: Vector, format: FormatId, data: FormatData, onProgress: (progress: number, state: number) => void = () => {}) {
        const [width, height] = size;
        const { delay } = data;

        this.resetScene();
        await this.setupScene(obj, size);

        return new Promise<Uint8Array>((resolve) => {
            this.gifManager.reset();

            const frames: Uint8Array[] = [];
            let time: number = 0;

            const draw = async () => {
                if (time > duration) {
                    encode();
                    return;
                }

                this.scene.render(delay / 1000);

                const pixels = this.getPixels();
                frames.push(pixels);

                onProgress(time / duration / 2, EXPORTING_STATES.indexOf("ReadingPixels"));
                time += delay / 1000;
                
                setTimeout(() => draw());
            };

            let i: number = 0;
            const encode = () => {
                if (i >= frames.length) {
                    const buffer = format === "gif" ? this.gifManager.end() : this.apngManager.encode(frames, width, height, delay);
                    resolve(buffer);

                    onProgress(1.0, EXPORTING_STATES.indexOf("DownloadScene"));
                    return;
                }

                switch (true) {
                    case format === "gif" && isDataGIF_Data(data): {
                        const pixels = frames[i];
                        const { useAccurateColors } = data;

                        const palette = this.gifManager.quantizeFrame(pixels, useAccurateColors);
                        const indices = this.gifManager.mapFrameToPalette(pixels, palette, useAccurateColors);

                        this.gifManager.addFrame(indices, palette, width, height, delay, +useAccurateColors - 1);
                        break;
                    }
                }

                onProgress(i / frames.length / 2 + 0.5, EXPORTING_STATES.indexOf("EncodeFrames"));
                i++;

                setTimeout(() => encode());
            };

            draw();
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
                const { form, clothing } = obj;
                if (!this.factory.hasLoadedFollower()) await this.factory.loadFollower();
                
                const follower = this.factory.follower(form, clothing, id, label);
                actor = follower;

                break;
            }

            case isPlayerObj(obj): {
                const { creature, fleece } = obj;
                if (!this.factory.hasLoadedPlayer()) await this.factory.loadPlayer();
                
                const player = this.factory.player(creature, fleece, id, label);
                actor = player;

                break;
            }

            case isSoldierObj(obj): {
                const { soldier: soldierId } = obj;
                if (!this.factory.hasLoadedSoldier()) await this.factory.loadSoldier();

                const soldier = this.factory.soldier(soldierId, id, label);
                actor = soldier;

                break; 
            }

            case isHereticObj(obj): {
                const { heretic: hereticId } = obj;
                if (!this.factory.hasLoadedHeretic(hereticId)) await this.factory.loadHeretic(hereticId);

                const heretic = this.factory.heretic(hereticId, id, label);
                actor = heretic;

                break;
            }

            case isBishopObj(obj): {
                const { bishop: bishopId, isBoss } = obj;
                if (!this.factory.hasLoadedBishop(bishopId, isBoss)) await this.factory.loadBishop(bishopId, isBoss);

                const bishop = this.factory.bishop(bishopId, isBoss, id, label);
                actor = bishop;

                break;
            }

            case isTOWW_Obj(obj): {
                const { form } = obj;
                if (!this.factory.hasLoadedTOWW(form)) await this.factory.loadTOWW(form);

                const toww = this.factory.TOWW(form, id, label);
                actor = toww;

                break;
            }

            case isMiniBossObj(obj): {
                const { miniBoss: miniBossId, isUpgraded } = obj;
                if (!this.factory.hasLoadedMiniBoss(miniBossId)) await this.factory.loadMiniBoss(miniBossId);

                const miniBoss = this.factory.miniBoss(miniBossId, isUpgraded, id, label);
                actor = miniBoss;

                break;
            }

            case isWitnessObj(obj): {
                const { witness: witnessId, isUpgraded } = obj;
                if (!this.factory.hasLoadedWitness()) await this.factory.loadWitness();
                
                const witness = this.factory.witness(witnessId, isUpgraded, id, label);
                actor = witness;

                break;
            }

            default: throw new Error("Invalid or unknown actor object used to create actor");
        }
        
        actor.copyFromObj(obj);
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

    async getBlob(x: number = 0, y: number = 0, width: number = this.gl.drawingBufferWidth, height: number = this.gl.drawingBufferHeight) {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext("2d")!;

        const exporterCtx = <CanvasRenderingContext2D>this.canvas.getContext("2d");
        const imageData = exporterCtx.getImageData(x, y, width, height);

        ctx.putImageData(imageData, 0, 0);
        return canvas.convertToBlob({ type: "image/png" });
    }
}

export const EXPORTING_STATES = ["ReadingPixels", "EncodeFrames", "DownloadScene"] as const;
export type ExportingState = typeof EXPORTING_STATES[number];

export interface GIF_Data extends FormatData {
    type: "gif";
    useAccurateColors: boolean;
}

export interface APNG_Data extends FormatData { type: "apng"; }
export interface FormatData {
    type: FormatId;
    delay: number;
}

export function isDataGIF_Data(data: FormatData): data is GIF_Data {
    return data.type === "gif";
}

export function isDataAPNG_Data(data: FormatData): data is APNG_Data {
    return data.type === "apng";
}

export const FORMAT_IDS = ["gif", "apng"] as const; // TODO: add webp/true-color gifs when possible
export type FormatId = typeof FORMAT_IDS[number];

export function isStrFormatId(str: string): str is FormatId {
    return FORMAT_IDS.includes(<FormatId>str);
}