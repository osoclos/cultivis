import { applyPalette, GIFEncoder, quantize, type Encoder } from "gifenc";

export class GIFManager {
    gif: Encoder;
    
    constructor() {
        this.gif = GIFEncoder();
    }

    addFrame(pixels: Uint8Array, width: number, height: number, delay: number = 1000 / 10) {
        const palette = quantize(pixels, 256, { format: "rgba4444" });
        const indices = applyPalette(pixels, palette, "rgba4444");

        this.gif.writeFrame(indices, width, height, { palette, delay, transparent: true });
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