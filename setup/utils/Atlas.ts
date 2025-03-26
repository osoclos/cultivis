import type { Atlas, AtlasFilter, AtlasFormat, AtlasPage, AtlasRect, AtlasRegion, AtlasRepeatOptions } from "../types";

export function from(str: string): Atlas {
    let i: number = 0;
    const lines = str.split(/\r?\n/);

    const readLine = (): string => lines[i++];

    const readKV = (line: string): string[] | null => line.includes(":") ? line.split(":").map((section) => section.trim()) : null;
    const readCSV = (values: string): string[] => values.split(",").map((val) => val.trim());

    if (readLine().length) i--;

    const atlas = <Atlas>{};
    while (i < lines.length) {
        const pagePath = readLine();
        const page = readPage();

        atlas[pagePath] = page;
    }

    return atlas;

    function readPage(): AtlasPage {
        const kvs = lines.slice(i, i += 4).map(readKV);
        
        const [_size, size] = checkKV("size", kvs);
        const [width, height] = readCSV(size).map((val) => +val);

        const [_format, formatStr] = checkKV("format", kvs);
        const format = <AtlasFormat>formatStr;

        const [_filters, filtersStr] = checkKV("filter", kvs);
        const filters = <AtlasFilter[]>readCSV(filtersStr).slice(0, 2);

        const [_repeat, repeatStr] = checkKV("repeat", kvs);
        const repeat = <AtlasRepeatOptions>repeatStr;

        const regions: AtlasRegion[] = [];
        while (lines[i].length) regions.push(readRegion());

        i++;

        return { regions, width, height, format, filters, repeat };
    }

    function readRegion(): AtlasRegion {
        const name = readLine();

        const kvs: string[][] = [];
        while (lines[i][0] === " ") {
            const kv = readKV(readLine());
            if (!kv) throw new Error("Line is not a key-value item");

            kvs.push(kv);
        }

        const [_rotate, rotate] = checkKV("rotate", kvs);
        const isRotated = Boolean(rotate);

        const [_xy, xy] = checkKV("xy", kvs);
        const [x, y] = readCSV(xy).map((val) => +val);

        const [_size, size] = checkKV("size", kvs);
        const [width, height] = readCSV(size).map((val) => +val);

        const [_originalSize, originalSize] = checkKV("orig", kvs);
        const [originalWidth, originalHeight] = readCSV(originalSize).map((val) => +val);

        const [_offset, offset] = checkKV("offset", kvs);
        const [offsetX, offsetY] = readCSV(offset).map((val) => +val);

        const [_index, indexStr] = checkKV("index", kvs);
        const index = +indexStr;

        const region: AtlasRegion = { name, index, x, y, width, height, isRotated, originalWidth, originalHeight, offsetX, offsetY };

        const splitKV = kvs.find((kv) => kv?.[0] === "split");
        if (splitKV) {
            const [_key, rect] = splitKV;
            region.split = readRect(rect);
        }

        const paddingKV = kvs.find((kv) => kv?.[0] === "pad");
        if (paddingKV) {
            const [_key, rect] = paddingKV;
            region.padding = readRect(rect);
        }

        return region;
        
        function readRect(values: string): AtlasRect {
            const [left, right, top, bottom] = readCSV(values).map((val) => +val);
            return { top, bottom, left, right };
        }
    }

    function checkKV(key: string, kvs: (string[] | null)[]): string[] {
        const kv = kvs.find((kv) => kv?.[0] === key);
        if (!kv) throw new Error(`Unable to find ${key} key-value item`);

        return kv;
    }
}

export function to(atlas: Atlas): string {
    let str: string = "\n";
    const writeLine = (line: string, padding: number = 0): string => str += `${" ".repeat(padding)}${line}\n`;

    const writeKV = (key: string, val: string, padding?: number): string => writeLine(`${key}: ${val}`, padding);
    const writeCSV = (...values: any[]): string => values.join(",");

    for (const pagePath in atlas) {
        const { regions, width, height, format, filters, repeat } = atlas[pagePath];
        const [filterX, filterY] = filters;

        writeLine(pagePath);
        
        writeKV("size", writeCSV(width, height));
        writeKV("format", format);

        writeKV("filter", writeCSV(filterX, filterY));
        writeKV("repeat", repeat);

        for (const { name, index, x, y, width, height, isRotated, originalWidth, originalHeight, offsetX, offsetY, split, padding } of regions) {
            writeLine(name);

            writeKV("rotate", `${isRotated}`, 2);

            writeKV("xy", writeCSV(x, y), 2);
            writeKV("size", writeCSV(width, height), 2);

            if (split) {
                const { top, bottom, left, right } = split;
                writeKV("split", writeCSV(left, right, top, bottom), 2);

                if (padding) {
                    const { top, bottom, left, right } = padding;
                    writeKV("pad", writeCSV(left, right, top, bottom), 2);
                }
            }

            writeKV("orig", writeCSV(originalWidth, originalHeight), 2);
            writeKV("offset", writeCSV(offsetX, offsetY), 2);

            writeKV("index", `${index}`, 2);
        }

        writeLine("");
    }

    return str;
}