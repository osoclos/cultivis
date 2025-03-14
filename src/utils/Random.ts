export class Random {
    private static readonly VAR_ID: string = "{id}";

    static float(max: number): number;
    static float(min: number, max: number): number;
    static float(a: number, b?: number): number;
    static float(a: number, b?: number): number {
        b ??= a;
        if (a === b) a = 0;

        return a + Math.random() * (b - a);
    }

    static int(max: number): number;
    static int(min: number, max: number): number;
    static int(a: number, b?: number): number;
    static int(a: number, b?: number): number {
        return Math.floor(this.float(a, b));
    }

    static hex(max: number): string;
    static hex(min: number, max: number): string;
    static hex(a: number, b?: number): string {
        return this.int(a, b).toString(0x10);
    }

    static bool(): boolean {
        return this.float(1.0) >= 0.5;
    }

    static percent(percent: number): boolean {
        return this.int(100) < percent;
    }

    static item<T>(arr: T[] | readonly T[]): T {
        return arr[this.int(arr.length)];
    }

    static key<T extends object>(obj: T): keyof T {
        return this.item(Object.keys(obj) as (keyof T)[]);
    }

    static prop<T extends object>(obj: T): T[keyof T] {
        return obj[this.key(obj)];
    }

    static id(length: number = 6, format: string = Random.VAR_ID): string {
        if (!format.includes(Random.VAR_ID)) throw new Error(`Format is invalid as it does not contains "${Random.VAR_ID}"`);
        
        const id = Array(Math.ceil(length / 8)).fill(null).map(() => this.hex(0x10 ** Math.min(length, 8))).join("").slice(0, length);
        return format.replace(Random.VAR_ID, id).padStart(length, "0");
    }
}