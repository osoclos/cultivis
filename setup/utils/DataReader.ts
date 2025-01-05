export class DataReader {
    protected byteIdx: number;
    constructor(private buffer: Buffer) {
        this.byteIdx = 0;
    }

    protected readUint32(): number {
        return this.buffer.readUint32LE((this.byteIdx += 4) - 4);
    }

    protected readFloat(): number {
        return this.buffer.readFloatLE((this.byteIdx += 4) - 4);
    }

    protected readString(): string {
        const length = this.readUint32();
        const str = this.buffer.toString("utf-8", this.byteIdx, this.byteIdx += length);

        this.byteIdx += 4 - ((this.byteIdx % 4) || 4);

        return str;
    }
}