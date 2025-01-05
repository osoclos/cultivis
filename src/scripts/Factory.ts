import type { ClothingId, FollowerId, PlayerCreatureId, PlayerFleeceId } from "../data/types";
import { Random } from "../utils";

import { Follower, Player } from "./characters";
import { AssetManager } from "./managers";

import { Actor } from "./Actor";

export class Factory {
    private _follower!: Follower;
    private _player!: Player;

    private constructor(private assetManager: AssetManager) {}
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

    private async fetchData(texturePaths: string[] | Record<string, string>, atlasPath: string, skeletonPath: string): Promise<[spine.Skeleton, spine.AnimationState]> {
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
            const [followerSkeleton, followerAnimationState] = await this.fetchData([Follower.TEXTURE_FILENAME], Follower.ATLAS_FILENAME, Follower.SKELETON_FILENAME);
            const follower = new Follower(followerSkeleton, followerAnimationState, "Deer", "Default_Clothing");

            this._follower = follower;
        }

        if (!this.loadedPlayer && actors.some((actor) => actor.name === Player.name)) {
            const [playerSkeleton, playerAnimationState] = await this.fetchData([Player.TEXTURE_FILENAME], Player.ATLAS_FILENAME, Player.SKELETON_FILENAME);
            const player = new Player(playerSkeleton, playerAnimationState, "Lamb", "Lamb");

            this._player = player;
        }
    }

    async loadAll() {
        await this.load(Follower, Player);
    }

    async custom(texturePaths: string[] | Record<string, string>, atlasPath: string, skeletonPath: string, id: string = Random.id(), label: string = "Custom Actor") {
        const [skeleton, animationState] = await this.fetchData(texturePaths, atlasPath, skeletonPath);
        return new Actor(skeleton, animationState, id, label);
    }

    async follower(form: FollowerId, clothing: ClothingId, id: string = Random.id(), label: string = "Copied Follower") {
        return this._follower.clone(form, clothing, id, label);
    }

    async player(creature: PlayerCreatureId, fleece: PlayerFleeceId, id: string = Random.id(), label: string = "Copied Player") {
        return this._player.clone(creature, fleece, id, label);
    }
}