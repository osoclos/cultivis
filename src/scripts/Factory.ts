import { BISHOP_IDS, type BishopId, type BishopSources, type ClothingId, type FollowerId, type PlayerCreatureId, type PlayerFleeceId } from "../data/types";
import { Random } from "../utils";

import { Bishop, Follower, Player } from "./characters";
import { AssetManager } from "./managers";

import { Actor } from "./Actor";
import { bishopData } from "../data";

export class Factory {
    private _follower!: Follower;
    private _player!: Player;

    private _bishops: Map<BishopId, Bishop>;
    private _bishopBosses: Map<BishopId, Bishop>;

    private constructor(private assetManager: AssetManager) {
        this._bishops = new Map();
        this._bishopBosses = new Map();
    }

    static async create(gl: WebGLRenderingContext, root: string = "/", actorsToPreload: (typeof Actor)[] = []) {
        const assetManager = await AssetManager.create(gl, root);
        
        const factory = new Factory(assetManager);
        await factory.load(...actorsToPreload);

        return factory;
    }

    get loadedFollower(): boolean {
        return !!this._follower;
    }

    get loadedPlayer(): boolean {
        return !!this._player;
    }

    getLoadedBishop(bishop: BishopId, isBoss: boolean): boolean {
        return (isBoss ? this._bishopBosses : this._bishops).has(bishop);
    }

    async fetchData(texturePaths: string[] | Record<string, string>, atlasPath: string, skeletonPath: string): Promise<[spine.Skeleton, spine.AnimationState]> {
        if (Array.isArray(texturePaths)) texturePaths = Object.fromEntries(texturePaths.map((path) => Array<string>(2).fill(path)));
        
        const textures: Record<string, spine.webgl.GLTexture> = {};
        for (const path in texturePaths) textures[path] = await this.assetManager.fetchTexture(path);

        const atlas = await this.assetManager.fetchAtlas(atlasPath, textures);
        const skeleton = await this.assetManager.fetchSkeleton(skeletonPath, atlas);

        const animationStateData = new spine.AnimationStateData(skeleton.data);
        const animationState = new spine.AnimationState(animationStateData);

        return [skeleton, animationState];
    }

    async load(...actors: (typeof Actor)[]) {
        if (!this.loadedFollower && actors.some((actor) => actor.name === Follower.name)) {
            const [skeleton, animationState] = await this.fetchData([Follower.TEXTURE_FILENAME], Follower.ATLAS_FILENAME, Follower.SKELETON_FILENAME);
            const follower = new Follower(skeleton, animationState, "Deer", "Default_Clothing");

            this._follower = follower;
        }

        if (!this.loadedPlayer && actors.some((actor) => actor.name === Player.name)) {
            const [skeleton, animationState] = await this.fetchData([Player.TEXTURE_FILENAME], Player.ATLAS_FILENAME, Player.SKELETON_FILENAME);
            const player = new Player(skeleton, animationState, "Lamb", "Lamb");

            this._player = player;
        }
    }

    async loadBishop(id: BishopId, isBoss: boolean) {
        const data = bishopData[id];
        const loadBoss = isBoss && "bossSrc" in data;

        const { textures, atlas, skeleton: skeletonPath } = data[loadBoss ? "bossSrc" : "src"] as BishopSources;
        const [skeleton, animationState] = await this.fetchData(textures, atlas, skeletonPath);

        const bishop = new Bishop(skeleton, animationState, this, id, isBoss);
        (loadBoss ? this._bishopBosses : this._bishops).set(id, bishop);
    }

    async loadAll() {
        await this.load(Follower, Player);
        for (const id of BISHOP_IDS) await Promise.all(Array(2).fill(null).map((_, i) => this.loadBishop(id, !!i)));
    }

    async custom(texturePaths: string[] | Record<string, string>, atlasPath: string, skeletonPath: string, id: string = Random.id(), label: string = "Custom Actor") {
        const [skeleton, animationState] = await this.fetchData(texturePaths, atlasPath, skeletonPath);
        return new Actor(skeleton, animationState, id, label);
    }

    follower(form: FollowerId, clothing: ClothingId, id: string = Random.id(), label: string = "Copied Follower") {
        return this._follower.clone(id, label, form, clothing);
    }

    player(creature: PlayerCreatureId, fleece: PlayerFleeceId, id: string = Random.id(), label: string = "Copied Player") {
        return this._player.clone(id, label, creature, fleece);
    }

    async bishop(bishopId: BishopId, isBoss: boolean, id: string = Random.id(), label: string = "Copied Bishop") {
        const bishop = (isBoss && "bossSrc" in bishopData[bishopId] ? this._bishopBosses : this._bishops).get(bishopId)!.clone(id, label, bishopId, isBoss);
        await bishop.update();

        return bishop;
    }
}