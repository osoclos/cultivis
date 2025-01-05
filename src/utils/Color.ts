import { MoreMath } from "./MoreMath";

export class Color implements ColorObject {
    static readonly DEFAULT_STR_NON_ALPHA_FORMAT: string = "rgb({r}, {g}, {b})";
    static readonly DEFAULT_STR_ALPHA_FORMAT: string = "rgba({r}, {g}, {b}, {a})";

    #r!: number;
    #g!: number;
    #b!: number;
    #a!: number;

    constructor();
    constructor(val: number);
    constructor(r: number, g: number, b: number);
    constructor(r: number, g: number, b: number, a: number);
    constructor(r: number = 0x00, g: number = r, b: number = r * +(r !== g), a: number = 0xff) {
        this.r = this.checkForNormalization(r);
        this.g = this.checkForNormalization(g);
        this.b = this.checkForNormalization(b);
        this.a = this.checkForNormalization(a);
    }

    *[Symbol.iterator](): Generator<number, undefined, number | undefined> {
        const { r, g, b, a } = this;
        yield r;
        yield g;
        yield b;
        yield a;

        return undefined;
    }

    static create(): Color;
    static create(val: number): Color;
    static create(r: number, g: number, b: number): Color;
    static create(r: number, g: number, b: number, a: number): Color;
    static create(r: number = 0x00, g: number = r, b: number = r * +(r !== g), a: number = 0xff) {
        return new Color(r, g, b, a);
    }

    static fromObj(obj: Partial<ColorObject>) {
        const {
            r = 0x00,
            g = 0x00,
            b = 0x00,
            a = 0xff
        } = obj;

        return new Color(r, g, b, a);
    }

    static fromArr(arr: number[]) {
        const [
            r = 0x00,
            g = 0x00,
            b = 0x00,
            a = 0xff
        ] = arr;

        return new Color(r, g, b, a);
    }

    static valToObj(obj: Partial<ColorObject>, val: number): ColorObject;
    static valToObj(obj: Partial<ColorObject>, r: number, g: number, b: number): ColorObject;
    static valToObj(obj: Partial<ColorObject>, r: number, g: number, b: number, a: number): ColorObject;
    static valToObj(obj: Partial<ColorObject>, r: number, g: number = r, b: number = r * +(r !== g), a: number = 0xff) {
        return new Color(r, g, b, a).cloneObj(obj);
    }

    static valToArr(arr: number[], val: number): number[];
    static valToArr(arr: number[], r: number, g: number, b: number): number[];
    static valToArr(arr: number[], r: number, g: number, b: number, a: number): number[];
    static valToArr(arr: number[], r: number, g: number = r, b: number = r * +(r !== g), a: number = 0xff): number[] {
        return new Color(r, g, b, a).cloneArr(arr);
    }

    static valToStr(val: number): string;
    static valToStr(r: number, g: number, b: number): string;
    static valToStr(r: number, g: number, b: number, a: number): string;
    static valToStr(r: number, g: number, b: number, a: number, format: string): string;
    static valToStr(r: number, g: number = r, b: number = r * +(r !== g), a: number = 0xff, format: string = !a || a < 0xff ? this.DEFAULT_STR_ALPHA_FORMAT : this.DEFAULT_STR_NON_ALPHA_FORMAT): string {
        return new Color(r, g, b, a).toStr(format);
    }

    static objToObj(src: Partial<ColorObject>, dest: Partial<ColorObject> = {}) {
        return Color.fromObj(src).cloneObj(dest);
    }

    static objToArr(obj: Partial<ColorObject>, arr: number[] = []): number[] {
        return Color.fromObj(obj).cloneArr(arr);
    }

    static objToStr(obj: Partial<ColorObject>, format: string = !obj.a || obj.a < 0xff ? this.DEFAULT_STR_ALPHA_FORMAT : this.DEFAULT_STR_NON_ALPHA_FORMAT): string {
        return Color.fromObj(obj).toStr(format);
    }

    static arrToObj(arr: number[], obj: Partial<ColorObject> = {}) {
        return Color.fromArr(arr).cloneObj(obj);
    }

    static arrToArr(src: number[], dest: number[] = []): number[] {
        return Color.fromArr(src).cloneArr(dest);
    }

    static arrToStr(arr: number[], format: string = !arr[3] || arr[3] < 0xff ? this.DEFAULT_STR_ALPHA_FORMAT : this.DEFAULT_STR_NON_ALPHA_FORMAT): string {
        return Color.fromArr(arr).toStr(format);
    }

    static get Black() {
        return this.create();
    }

    static get White() {
        return this.create(0xff);
    }

    static get Red() {
        return this.Black.setR(0xff);
    }

    static get Green() {
        return this.Black.setG(0xff);
    }

    static get Blue() {
        return this.Black.setB(0xff);
    }

    static get Transparent() {
        return this.Black.setA(0x00);
    }

    static get Cyan() {
        return this.White.setR(0x00);
    }

    static get Magenta() {
        return this.White.setG(0x00);
    }
    
    static get Yellow() {
        return this.White.setB(0x00);
    }

    get r(): number {
        return this.#r;
    }

    set r(r: number) {
        this.#r = this.clampVal(r);
    }

    get g(): number {
        return this.#g;
    }

    set g(g: number) {
        this.#g = this.clampVal(g);
    }

    get b(): number {
        return this.#b;
    }

    set b(b: number) {
        this.#b = this.clampVal(b);
    }

    get a(): number {
        return this.#a;
    }

    set a(a: number) {
        this.#a = this.clampVal(a);
    }

    get 0(): number {
        return this.r;
    }

    get 1(): number {
        return this.g;
    }
    
    get 2(): number {
        return this.b;
    }

    get 3(): number {
        return this.a;
    }

    get isTransparent(): boolean {
        return !this.a;
    }

    get isSeeThrough(): boolean {
        return this.isTransparent || this.a < 0xff;
    }

    setR(r: number) {
        this.r = r;
        return this;
    }

    setG(g: number) {
        this.g = g;
        return this;
    }

    setB(b: number) {
        this.b = b;
        return this;
    }

    setA(a: number) {
        this.a = a;
        return this;
    }

    set(r: number, g: number = r, b: number = r * +(r !== g), a: number = 255) {
        return this.setR(r).setG(g).setB(b).setA(a);
    }

    copyR(src: Color) {
        return this.setR(src.r);
    }

    copyG(src: Color) {
        return this.setG(src.g);
    }

    copyB(src: Color) {
        return this.setB(src.b);
    }

    copyA(src: Color) {
        return this.setA(src.a);
    }

    copy(src: Color) {
        return this.copyR(src).copyG(src).copyB(src).copyA(src);
    }

    copyObj(src: Partial<ColorObject>) {
        const { r, g, b, a } = src;
        r !== undefined && this.setR(r);
        g !== undefined && this.setG(g);
        b !== undefined && this.setB(b);
        a !== undefined && this.setA(a);

        return this;
    }

    copyArr(src: number[]) {
        const [r, g, b, a] = src;
        r !== undefined && this.setR(r);
        g !== undefined && this.setG(g);
        b !== undefined && this.setB(b);
        a !== undefined && this.setA(a);

        return this;
    }

    cloneR(dest: Color) {
        return dest.copyR(this);
    }

    cloneG(dest: Color) {
        return dest.copyG(this);
    }

    cloneB(dest: Color) {
        return dest.copyB(this);
    }

    cloneA(dest: Color) {
        return dest.copyA(this);
    }

    clone(dest: Color) {
        return dest.copy(this);
    }

    cloneObj(dest: Partial<ColorObject> = {}, replaceExisting: boolean = true): ColorObject {
        return dest = replaceExisting ? this.toObj() : { ...this.toObj(), ...dest };
    }

    cloneArr(dest: number[] = Array(2), offset: number = 0) {
        dest.splice(offset, offset + 2, ...this);
        return dest;
    }

    toObj(forceAlpha: boolean = false): ColorObject {
        const { r, g, b, a } = this;
        
        const obj: ColorObject = { r, g, b };
        if (forceAlpha || this.isSeeThrough) obj.a = a;

        return obj;
    }

    toArr(forceAlpha: boolean = false): number[] {
        return [...this].slice(0, 2 + +(forceAlpha || this.isSeeThrough));
    }

    toStr(format: string = this.isSeeThrough ? Color.DEFAULT_STR_ALPHA_FORMAT : Color.DEFAULT_STR_NON_ALPHA_FORMAT): string {
        let str: string = format;
        ["r", "g", "b", "a"].forEach((name, i) => str = str.replace(`{${name}}`, `${this[i as 0 | 1 | 2 | 3]}`));
        
        return str;
    }

    normalize(): Required<ColorObject> {
        const [r, g, b, a] = [...this].map((val) => val / 0xff);
        return { r, g, b, a };
    }

    equalsR(color: Color): boolean {
        return this.r === color.r;
    }

    equalsG(color: Color): boolean {
        return this.g === color.g;
    }

    equalsB(color: Color): boolean {
        return this.b === color.b;
    }

    equalsA(color: Color): boolean {
        return this.a === color.a;
    }

    equals(color: Color): boolean {
        return this.equalsR(color) && this.equalsG(color) && this.equalsB(color) && this.equalsA(color);
    }

    equalsObj(obj: Partial<ColorObject>): boolean {
        const color = Color.fromObj(obj);
        return this.equals(color);
    }

    equalsArr(arr: number[]): boolean {
        const color = Color.fromArr(arr);
        return this.equals(color);
    }

    private clampVal(val: number): number {
        return MoreMath.clamp(val, 0x00, 0xff) | 0;
    }

    private checkForNormalization(val: number): number {
        return val < 1.0 ? val * 0xff : val;
    }
}

export interface ColorObject {
    r: number;
    g: number;
    b: number;
    a?: number;
}