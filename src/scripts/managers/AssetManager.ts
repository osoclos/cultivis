import { fetchAndCache, resolvePath } from "../../utils";

export class AssetManager {
    static readonly TEXTURE_CACHE_NAME: string = "textures";
    static readonly ATLAS_CACHE_NAME: string = "atlases";
    static readonly SKELETON_CACHE_NAME: string = "skeletons";

    private constructor(private textureCache: Cache, private atlasCache: Cache, private skeletonCache: Cache, public gl: WebGLRenderingContext, readonly root: string = "/") {}
    static async create(gl: WebGLRenderingContext, root: string = "/") {
        const textureCache = await caches.open(this.TEXTURE_CACHE_NAME);
        const atlasCache = await caches.open(this.ATLAS_CACHE_NAME);
        const skeletonCache = await caches.open(this.SKELETON_CACHE_NAME);
        
        return new AssetManager(textureCache, atlasCache, skeletonCache, gl, root);
    }

    async fetchTexture(path: string) {
        const blob = await fetchAndCache(resolvePath(path, this.root), this.textureCache).then((res) => res.blob()).catch((err) => {
            throw err instanceof Error ? new Error(`Unable to fetch image: ${err.message}, caused by: ${err.cause}`) : new Error(`Unable to fetch image: ${err}, caused by: ${import.meta.url}`);
        });

        const url = URL.createObjectURL(blob);
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.src = url;

            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", () => reject("Encountered an error while creating image"));
            image.addEventListener("abort", () => reject("Image creation was aborted"));
        });

        return new spine.webgl.GLTexture(this.gl, image);
    }

    async fetchAtlas(path: string, textures: Record<string, spine.webgl.GLTexture>) {
        const text = await fetchAndCache(resolvePath(path, this.root), this.atlasCache).then((res) => res.text()).catch((err) => {
            throw err instanceof Error ? new Error(`Unable to fetch atlas: ${err.message}, caused by: ${err.cause}`) : new Error(`Unable to fetch atlas: ${err}, caused by: ${import.meta.url}`);
        });

        return new spine.TextureAtlas(text, (path) => textures[path]);
    }

    async fetchSkeleton(path: string, atlas: spine.TextureAtlas) {
        const buffer = await fetchAndCache(resolvePath(path, this.root), this.skeletonCache).then((res) => res.arrayBuffer()).catch((err) => {
            throw err instanceof Error ? new Error(`Unable to fetch skeleton: ${err.message}, caused by: ${err.cause}`) : new Error(`Unable to fetch skeleton: ${err}, caused by: ${import.meta.url}`);
        });

        const arr = new Uint8Array(buffer);

        const loader = new spine.AtlasAttachmentLoader(atlas);
        
        const binary = new spine.SkeletonBinary(loader);
        const data = binary.readSkeletonData(arr);

        return new spine.Skeleton(data);
    }

    async fetchJSON(path: string, atlas: spine.TextureAtlas) {
        const buffer = await fetchAndCache(resolvePath(path, this.root), this.skeletonCache).then((res) => res.arrayBuffer()).catch((err) => {
            throw err instanceof Error ? new Error(`Unable to fetch JSON: ${err.message}, caused by: ${err.cause}`) : new Error(`Unable to fetch JSON: ${err}, caused by: ${import.meta.url}`);
        });

        const arr = new Uint8Array(buffer);

        const loader = new spine.AtlasAttachmentLoader(atlas);

        const json = new spine.SkeletonJson(loader);
        const data = json.readSkeletonData(arr);

        return new spine.Skeleton(data);
    }
}