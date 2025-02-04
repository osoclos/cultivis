export class APNG_Manager {
    encode(pixels: Uint8Array[], width: number, height: number, delay: number = 1000 / 60) {
        const buffer = UPNG.encode(pixels.map(({ buffer }) => buffer), width, height, 0, Array(pixels.length).fill(delay));
        return new Uint8Array(buffer);
    }
}