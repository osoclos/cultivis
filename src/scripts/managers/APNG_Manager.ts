import APNG, { Frame } from "apng-fest";

export class APNG_Manager {
    private constructor(public apng: APNG) {}
    static async create() {
        const apng = await APNG.create(1, 1);
        return new APNG_Manager(apng);
    }

    async addFrame(pixels: Uint8Array, fps: number) {
        const { width, height } = this.apng;

        const frame = Frame.fromPixels(pixels.buffer, { width, height, delay: 1 / fps });
        await this.apng.writeFrame(frame);
    }

    end() {
        return this.apng.writeFooter();
    }

    reset(width: number, height: number) {
        this.apng.reset();

        this.apng.width = width;
        this.apng.height = height;

        this.apng.writeHeader();
    }
}