import { MoreMath } from "./MoreMath";

export class Vector implements VectorObject {
    static readonly DEFAULT_STR_FORMAT: string = "({x}, {y})";
    
    constructor();
    constructor(val: number);
    constructor(x: number, y: number);
    constructor(public x: number = 0, public y: number = x) {}

    *[Symbol.iterator](): Generator<number, undefined, number | undefined> {
        const { x, y } = this;
        yield x;
        yield y;

        return undefined;
    }

    static create(): Vector;
    static create(val: number): Vector;
    static create(x: number, y: number): Vector;
    static create(x: number = 0, y: number = x) {
        return new Vector(x, y);
    }

    static fromObj(obj: Partial<VectorObject>) {
        const {
            x = 0,
            y = 0
        } = obj;

        return new Vector(x, y);
    }

    static fromArr(arr: number[]) {
        const [
            x = 0,
            y = 0
        ] = arr;

        return new Vector(x, y);
    }

    static valToObj(obj: Partial<VectorObject>, val: number): VectorObject;
    static valToObj(obj: Partial<VectorObject>, x: number, y: number): VectorObject;
    static valToObj(obj: Partial<VectorObject>, x: number, y: number = x) {
        return new Vector(x, y).cloneObj(obj);
    }

    static valToArr(arr: number[], val: number): number[];
    static valToArr(arr: number[], x: number, y: number): number[];
    static valToArr(arr: number[], x: number, y: number = x): number[] {
        return new Vector(x, y).cloneArr(arr);
    }

    static valToStr(val: number): string;
    static valToStr(x: number, y: number): string;
    static valToStr(x: number, y: number, format: string): string;
    static valToStr(x: number, y: number = x, format: string = this.DEFAULT_STR_FORMAT): string {
        return new Vector(x, y).toStr(format);
    }

    static objToObj(src: Partial<VectorObject>, dest: Partial<VectorObject> = {}) {
        return Vector.fromObj(src).cloneObj(dest);
    }

    static objToArr(obj: Partial<VectorObject>, arr: number[] = []): number[] {
        return Vector.fromObj(obj).cloneArr(arr);
    }

    static objToStr(obj: Partial<VectorObject>, format: string = this.DEFAULT_STR_FORMAT): string {
        return Vector.fromObj(obj).toStr(format);
    }

    static arrToObj(arr: number[], obj: Partial<VectorObject> = {}) {
        return Vector.fromArr(arr).cloneObj(obj);
    }

    static arrToArr(src: number[], dest: number[] = []): number[] {
        return Vector.fromArr(src).cloneArr(dest);
    }

    static arrToStr(arr: number[], format: string = this.DEFAULT_STR_FORMAT): string {
        return Vector.fromArr(arr).toStr(format);
    }

    static get Zero() {
        return this.create();
    }

    static get One() {
        return this.create(1);
    }

    static get Half() {
        return this.create(0.5);
    }

    static get NegOne() {
        return this.One.neg();
    }

    static get NegHalf() {
        return this.Half.neg();
    }

    static get North() {
        return this.Zero.setY(1);
    }

    static get South() {
        return this.North.neg();
    }

    static get East() {
        return this.Zero.setX(1);
    }

    static get West() {
        return this.East.neg();
    }

    static get NE() {
        return this.North.add(this.East);
    }

    static get NW() {
        return this.North.add(this.West);
    }

    static get SE() {
        return this.South.add(this.East);
    }

    static get SW() {
        return this.South.add(this.West);
    }

    static get Min() {
        return this.Max.neg();
    }

    static get Max() {
        return this.create(Infinity);
    }

    get 0(): number {
        return this.x;
    }

    get 1(): number {
        return this.y;
    }

    setX(x: number) {
        this.x = x;
        return this;
    }

    setY(y: number) {
        this.y = y;
        return this;
    }

    set(val: number): Vector;
    set(x: number, y: number): Vector;
    set(x: number, y: number, dest: Vector): Vector;
    set(x: number, y: number = x, dest: Vector = this) {
        return this.clone(dest).setX(x).setY(y);
    }

    copyX(src: Vector) {
        return this.setX(src.x);
    }

    copyY(src: Vector) {
        return this.setY(src.y);
    }

    copy(src: Vector) {
        return this.copyX(src).copyY(src);
    }

    copyObj(src: Partial<VectorObject>) {
        const { x, y } = src;

        x !== undefined && this.setX(x);
        y !== undefined && this.setY(y);

        return this;
    }

    copyArr(src: number[]) {
        const [x, y] = src;

        x !== undefined && this.setX(x);
        y !== undefined && this.setY(y);

        return this;
    }

    cloneX(dest: Vector = new Vector()) {
        return dest.copyX(this);
    }

    cloneY(dest: Vector = new Vector()) {
        return dest.copyY(this);
    }

    clone(dest: Vector = new Vector()) {
        return dest.copy(this);
    }

    cloneObj(dest: Partial<VectorObject> = {}, replaceExisting: boolean = true): VectorObject {
        const { x, y } = this;
        if (replaceExisting || !("x" in dest)) dest.x = x;
        if (replaceExisting || !("y" in dest)) dest.y = y;

        return dest as VectorObject;
    }

    cloneArr(dest: number[] = Array(2), offset: number = 0) {
        dest.splice(offset, offset + 2, ...this);
        return dest;
    }

    toObj(): VectorObject {
        const { x, y } = this;
        return { x, y };
    }

    toArr(): number[] {
        return [...this];
    }

    toStr(format: string = Vector.DEFAULT_STR_FORMAT): string {
        let str: string = format;
        ["x", "y"].forEach((name, i) => str = str.replace(`{${name}}`, `${this[i as 0 | 1]}`));
        
        return str;
    }

    addX(x: number) {
        return this.setX(this.x + x);
    }

    addY(y: number) {
        return this.setY(this.y + y);
    }

    addVal(val: number): Vector;
    addVal(x: number, y: number): Vector;
    addVal(x: number, y: number, dest: Vector): Vector;
    addVal(x: number, y: number = x, dest: Vector = this) {
        return this.clone(dest).addX(x).addY(y);
    }

    add(vec: Vector, dest: Vector = this) {
        const { x, y } = vec;
        return this.addVal(x, y, dest);
    }

    addObj(obj: Partial<VectorObject>, dest: Vector = this) {
        return this.add(Vector.fromObj(obj), dest);
    }

    addArr(arr: number[], dest: Vector = this) {
        return this.add(Vector.fromArr(arr), dest);
    }

    static addX(vec: Vector, x: number, dest: Vector = new Vector()) {
        return vec.clone(dest).addX(x);
    }

    static addY(vec: Vector, y: number, dest: Vector = new Vector()) {
        return vec.clone(dest).addY(y);
    }

    static addVal(vec: Vector, val: number): Vector;
    static addVal(vec: Vector, x: number, y: number): Vector;
    static addVal(vec: Vector, x: number, y: number, dest: Vector): Vector;
    static addVal(vec: Vector, x: number, y: number = x, dest: Vector = new Vector()) {
        return vec.addVal(x, y, dest);
    }

    static add(a: Vector, b: Vector, dest: Vector = new Vector()) {
        return a.add(b, dest);
    }

    static addObj(vec: Vector, obj: Partial<VectorObject>, dest: Vector = new Vector()) {
        return vec.addObj(obj, dest);
    }

    static addArr(vec: Vector, arr: number[], dest: Vector = new Vector()) {
        return vec.addArr(arr, dest);
    }

    subX(x: number) {
        return this.setX(this.x - x);
    }

    subY(y: number) {
        return this.setY(this.y - y);
    }

    subVal(val: number): Vector;
    subVal(x: number, y: number): Vector;
    subVal(x: number, y: number, dest: Vector): Vector;
    subVal(x: number, y: number = x, dest: Vector = this) {
        return this.clone(dest).subX(x).subY(y);
    }

    sub(vec: Vector, dest: Vector = this) {
        const { x, y } = vec;
        return this.subVal(x, y, dest);
    }

    subObj(obj: Partial<VectorObject>, dest: Vector = this) {
        return this.sub(Vector.fromObj(obj), dest);
    }

    subArr(arr: number[], dest: Vector = this) {
        return this.sub(Vector.fromArr(arr), dest);
    }

    static subX(vec: Vector, x: number, dest: Vector = new Vector()) {
        return vec.clone(dest).subX(x);
    }

    static subY(vec: Vector, y: number, dest: Vector = new Vector()) {
        return vec.clone(dest).subY(y);
    }

    static subVal(vec: Vector, val: number): Vector;
    static subVal(vec: Vector, x: number, y: number): Vector;
    static subVal(vec: Vector, x: number, y: number, dest: Vector): Vector;
    static subVal(vec: Vector, x: number, y: number = x, dest: Vector = new Vector()) {
        return vec.subVal(x, y, dest);
    }

    static sub(a: Vector, b: Vector, dest: Vector = new Vector()) {
        return a.sub(b, dest);
    }

    static subObj(vec: Vector, obj: Partial<VectorObject>, dest: Vector = new Vector()) {
        return vec.subObj(obj, dest);
    }

    static subArr(vec: Vector, arr: number[], dest: Vector = new Vector()) {
        return vec.subArr(arr, dest);
    }

    mulX(x: number) {
        return this.setX(this.x * x);
    }

    mulY(y: number) {
        return this.setY(this.y * y);
    }

    mulVal(val: number): Vector;
    mulVal(x: number, y: number): Vector;
    mulVal(x: number, y: number, dest: Vector): Vector;
    mulVal(x: number, y: number = x, dest: Vector = this) {
        return this.clone(dest).mulX(x).mulY(y);
    }

    mul(vec: Vector, dest: Vector = this) {
        const { x, y } = vec;
        return this.mulVal(x, y, dest);
    }

    mulObj(obj: Partial<VectorObject>, dest: Vector = this) {
        return this.mul(Vector.fromObj(obj), dest);
    }

    mulArr(arr: number[], dest: Vector = this) {
        return this.mul(Vector.fromArr(arr), dest);
    }

    static mulX(vec: Vector, x: number, dest: Vector = new Vector()) {
        return vec.clone(dest).mulX(x);
    }

    static mulY(vec: Vector, y: number, dest: Vector = new Vector()) {
        return vec.clone(dest).mulY(y);
    }

    static mulVal(vec: Vector, val: number): Vector;
    static mulVal(vec: Vector, x: number, y: number): Vector;
    static mulVal(vec: Vector, x: number, y: number, dest: Vector): Vector;
    static mulVal(vec: Vector, x: number, y: number = x, dest: Vector = new Vector()) {
        return vec.mulVal(x, y, dest);
    }

    static mul(a: Vector, b: Vector, dest: Vector = new Vector()) {
        return a.mul(b, dest);
    }

    static mulObj(vec: Vector, obj: Partial<VectorObject>, dest: Vector = new Vector()) {
        return vec.mulObj(obj, dest);
    }

    static mulArr(vec: Vector, arr: number[], dest: Vector = new Vector()) {
        return vec.mulArr(arr, dest);
    }

    divX(x: number) {
        return this.setX(this.x / x);
    }

    divY(y: number) {
        return this.setY(this.y / y);
    }

    divVal(val: number): Vector;
    divVal(x: number, y: number): Vector;
    divVal(x: number, y: number, dest: Vector): Vector;
    divVal(x: number, y: number = x, dest: Vector = this) {
        return this.clone(dest).divX(x).divY(y);
    }

    div(vec: Vector, dest: Vector = this) {
        const { x, y } = vec;
        return this.divVal(x, y, dest);
    }

    divObj(obj: Partial<VectorObject>, dest: Vector = this) {     
        return this.div(Vector.fromObj(obj), dest);
    }

    divArr(arr: number[], dest: Vector = this) {
        return this.div(Vector.fromArr(arr), dest);
    }

    static divX(vec: Vector, x: number, dest: Vector = new Vector()) {
        return vec.clone(dest).divX(x);
    }

    static divY(vec: Vector, y: number, dest: Vector = new Vector()) {
        return vec.clone(dest).divY(y);
    }

    static divVal(vec: Vector, val: number): Vector;
    static divVal(vec: Vector, x: number, y: number): Vector;
    static divVal(vec: Vector, x: number, y: number, dest: Vector): Vector;
    static divVal(vec: Vector, x: number, y: number = x, dest: Vector = new Vector()) {
        return vec.divVal(x, y, dest);
    }

    static div(a: Vector, b: Vector, dest: Vector = new Vector()) {
        return a.div(b, dest);
    }

    static divObj(vec: Vector, obj: Partial<VectorObject>, dest: Vector = new Vector()) {
        return vec.divObj(obj, dest);
    }

    static divArr(vec: Vector, arr: number[], dest: Vector = new Vector()) {
        return vec.divArr(arr, dest);
    }

    dist(vec: Vector): number {
        const { x, y } = Vector.sub(this, vec);
        return Math.hypot(x, y);
    }

    length(): number {
        return this.dist(Vector.Zero);
    }

    normalize(dest: Vector = this) {
        return this.div(new Vector(this.length()), dest);
    }

    static normalize(vec: Vector, dest: Vector = new Vector()) {
        return vec.normalize(dest);
    }

    normMul(val: number, dest: Vector = this) {
        return this.normalize(dest).mulVal(val);
    }

    static normMul(vec: Vector, val: number, dest: Vector = new Vector()) {
        return vec.normMul(val, dest);
    }

    dot(vec: Vector): number {
        const { x, y } = Vector.mul(this, vec);
        return x + y;
    }

    grad(origin: Vector = Vector.Zero): number {
        const { x, y } = Vector.sub(this, origin);
        return y / x;
    }

    ang(origin: Vector = Vector.Zero): number {
        const { x, y } = Vector.sub(this, origin);
        return Math.atan2(y, x);
    }

    static fromAng(ang: number, mag: number = 1, origin: Vector = Vector.Zero) {
        return new Vector(Math.cos(ang), Math.sin(ang)).mulVal(mag).add(origin);
    }

    negX() {
        return this.setX(-this.x);
    }

    static negX(vec: Vector, dest: Vector = new Vector()) {
        return vec.clone(dest).negX();
    }

    negY() {
        return this.setY(-this.y);
    }

    static negY(vec: Vector, dest: Vector = new Vector()) {
        return vec.clone(dest).negY();
    }

    neg(dest: Vector = this) {
        return this.clone(dest).negX().negY();
    }

    static neg(vec: Vector, dest: Vector = new Vector()) {
        return vec.neg(dest);
    }

    swap(dest: Vector = this) {
        const { x, y } = this;
        return this.set(y, x, dest);
    }

    static swap(vec: Vector, dest: Vector = new Vector()) {
        return vec.swap(dest);
    }

    equalsX(vec: Vector): boolean {
        return this.x === vec.x;
    }

    equalsY(vec: Vector): boolean {
        return this.y === vec.y;
    }

    equals(vec: Vector): boolean {
        return this.equalsX(vec) && this.equalsY(vec);
    }

    equalsObj(obj: Partial<VectorObject>): boolean {
        const vec = Vector.fromObj(obj);
        return this.equals(vec);
    }

    equalsArr(arr: number[]): boolean {
        const vec = Vector.fromArr(arr);
        return this.equals(vec);
    }

    sum(...vectors: Vector[]) {
        return this.copy(Vector.sum(this, ...vectors));
    }

    static sum(...vectors: Vector[]) {
        return vectors.reduce((v1, v2) => v1.add(v2), Vector.Zero);
    }

    min(...vectors: Vector[]) {
        return this.copy(Vector.min(this, ...vectors));
    }

    static min(...vectors: Vector[]) {
        return vectors.reduce((vec, { x, y }) => {
            const [vx, vy] = vec;
            return vec.set(Math.min(x, vx), Math.min(y, vy));
        }, Vector.Max);
    }

    max(...vectors: Vector[]) {
        return this.copy(Vector.max(this, ...vectors));
    }

    static max(...vectors: Vector[]) {
        return vectors.reduce((vec, { x, y }) => {
            const [vx, vy] = vec;
            return vec.set(Math.max(x, vx), Math.max(y, vy));
        }, Vector.Min);
    }

    avg(...vectors: Vector[]) {
        return this.copy(Vector.avg(this, ...vectors));
    }

    static avg(...vectors: Vector[]) {
        return this.sum(...vectors).divVal(vectors.length);
    }

    floor(dest: Vector = this) {
        const { x, y } = this;
        return this.set(Math.floor(x), Math.floor(y), dest);
    }

    static floor(vec: Vector, dest: Vector = new Vector()) {
        return vec.floor(dest);
    }

    ceil(dest: Vector = this) {
        const { x, y } = this;
        return this.set(Math.ceil(x), Math.ceil(y), dest);
    }

    static ceil(vec: Vector, dest: Vector = new Vector()) {
        return vec.ceil(dest);
    }

    round(decimalPoints: number = 0, dest: Vector = this) {
        const { x, y } = this;
        return this.set(MoreMath.round(x, decimalPoints), MoreMath.round(y, decimalPoints), dest);
    }

    static round(vec: Vector, decimalPoints: number = 0, dest: Vector = new Vector()) {
        return vec.round(decimalPoints, dest);
    }
}

export interface VectorObject {
    x: number;
    y: number;
}
