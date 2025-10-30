import UPNG from "@pdf-lib/upng";

export class APNG_Manager {
    private frames: ArrayBuffer[];
    constructor(private width: number, private height: number, private delayMs: number, private performOptimisation: boolean) {
        this.frames = [];
    }

    addFrame(pixels: Uint8Array) {
        this.frames.push(<ArrayBuffer>pixels.buffer);
    }

    end() {
        const { frames, width, height, delayMs, performOptimisation } = this;
        const delayArr = Array(frames.length).fill(delayMs);

        return performOptimisation ? UPNG.encode(frames, width, height, 0, delayArr) : UPNG.encodeLL(frames, width, height, 3, 1, 8, delayArr);
    }

    reset(width: number, height: number, delayMs: number, performOptimisation: boolean) {
        this.frames = [];

        this.width = width;
        this.height = height;

        this.delayMs = delayMs;

        this.performOptimisation = performOptimisation;
    }
}