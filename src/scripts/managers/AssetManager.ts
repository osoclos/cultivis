import { fetchAndCache, resolvePath } from "../../utils";

export class AssetManager {
    static readonly TEXTURE_CACHE_NAME: string = "textures";
    static readonly ATLAS_CACHE_NAME: string = "atlases";
    static readonly SKELETON_CACHE_NAME: string = "skeletons";

    private constructor(public textureCache: Cache, public atlasCache: Cache, public skeletonCache: Cache, public gl: WebGLRenderingContext, readonly root: string = "/") {}
    static async create(gl: WebGLRenderingContext, root: string = "/") {
        const textureCache = await caches.open(this.TEXTURE_CACHE_NAME);
        const atlasCache = await caches.open(this.ATLAS_CACHE_NAME);
        const skeletonCache = await caches.open(this.SKELETON_CACHE_NAME);
        
        return new AssetManager(textureCache, atlasCache, skeletonCache, gl, root);
    }

    fetch<T>(path: string, cache: Cache, callback: (res: Response) => T): Promise<T> {
        return fetchAndCache(resolvePath(path, this.root), cache).then(callback);
    }

    async fetchTexture(path: string) {
        const blob = await this.fetch(path, this.textureCache, (res) => res.blob());
        const url = URL.createObjectURL(blob);

        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.src = url;

            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", () => reject(`Encountered an error while creating image: ${path}`));
        });

        return new spine.webgl.GLTexture(this.gl, image);
    }

    async fetchAtlas(path: string, textures: Record<string, spine.webgl.GLTexture>) {
        const text = await this.fetch(path, this.atlasCache, (res) => res.text());
        return new spine.TextureAtlas(text, (path) => textures[path]);
    }

    async fetchSkeletonData(path: string, atlas: spine.TextureAtlas) {
        const buffer = await this.fetch(path, this.skeletonCache, (res) => res.arrayBuffer());
        const arr = new Uint8Array(buffer);

        const loader = new spine.AtlasAttachmentLoader(atlas);
        
        const skeletonLoader = new spine[path.endsWith(".json") ? "SkeletonJson" : "SkeletonBinary"](loader);
        return skeletonLoader.readSkeletonData(arr);
    }
}