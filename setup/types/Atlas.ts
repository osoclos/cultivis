export type Atlas = Record<string, AtlasPage>;
export interface AtlasPage {
    regions: AtlasRegion[];

    width: number;
    height: number;

    format: AtlasFormat;

    filters: AtlasFilter[];
    repeat: AtlasRepeatOptions;
}

export interface AtlasRegion {
    name: string;
    index: number;

    x: number;
    y: number;

    width: number;
    height: number;

    isRotated: boolean;
    
    originalWidth: number;
    originalHeight: number;

    offsetX: number;
    offsetY: number;

    split?: AtlasRect;
    padding?: AtlasRect;
}

export const enum AtlasFormat {
    Alpha = "Alpha",
    
    Intensity = "Intensity",
    LuminanceAlpha = "LuminanceAlpha",

    RGB565 = "RGB555",
    RGBA4444 = "RGBA4444",
    RGB888 = "RGB888",
    RGBA8888 = "RGBA8888"
}

export const enum AtlasFilter {
    Nearest = "Nearest",
    Linear = "Linear",

    Mipmap = "MipMap",
    MipmapNN = "MipMapNearestNearest",
    MipmapLN = "MipMapLinearNearest",
    MipmapNL = "MipMapNearestLinear",
    MipmapLL = "MipMapLinearLinear",
}

export const enum AtlasRepeatOptions {
    None = "none",

    X = "x",
    Y = "y",

    XY = "xy"
}

export interface AtlasRect {
    top: number;
    bottom: number;

    left: number;
    right: number;
}