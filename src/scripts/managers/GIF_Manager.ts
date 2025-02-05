import { applyPalette, GIFEncoder, nearestColorIndexWithDistance, quantize, type Encoder } from "gifenc";
import { Color, Random } from "../../utils";

export class GIF_Manager {
    gif: Encoder;
    constructor() {
        this.gif = GIFEncoder();
    }

    quantizeFrame(pixels: Uint8Array, hasAccurateColors: boolean = false): number[][] {
        if (!hasAccurateColors) return quantize(pixels, 256, { format: "rgba4444" });

        const palette = quantize(pixels, 255, { format: "rgb565" });
        const clearColor = new Color();

        while (palette.some((color) => clearColor.equalsArr(color)) || nearestColorIndexWithDistance(palette, clearColor.toArr() as [number, number, number])[1] <= 5 ** 2) clearColor.copyArr(Array(3).fill(null).map(Random.int.bind(Random, 255)));
        const colorArr = clearColor.toArr();

        for (let i = 0; i < pixels.length; i += 4) {
            const a = pixels.subarray(i, i + 4)[3];
            if (a > 0x7f) continue;

            pixels.set(colorArr, i);
        }
        
        return [colorArr, ...palette];
    }

    mapFrameToPalette(pixels: Uint8Array, palette: number[][], hasAccurateColors: boolean = false) {
        return applyPalette(pixels, palette, hasAccurateColors ? "rgb565" : "rgba4444");
    }

    addFrame(indices: Uint8Array, palette: number[][], width: number, height: number, delay: number = 1000 / 10, clearColorIdx: number = -1) {
        this.gif.writeFrame(indices, width, height, {
            palette,
            delay,
            
            transparent: true,
            transparentIndex: clearColorIdx < 0 ? undefined : clearColorIdx
        });
    }

    end() {
        this.gif.finish();

        const buffer = this.gif.bytes();
        return buffer;
    }

    reset() {
        this.gif.reset();
    }
}