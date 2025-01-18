import { BISHOP_IDS, TOWW_IDS, type BishopId, type ClothingId, type FollowerId, type TOWW_Id, type PlayerCreatureId, type PlayerFleeceId } from "../data/types";
import { Random } from "../utils";

import { Bishop, Follower, TOWW, Player } from "./characters";
import { AssetManager } from "./managers";

import { Actor } from "./Actor";
import { bishopData, followerData, towwData, playerData } from "../data";

export class Factory {
    private _follower!: Follower;
    private _player!: Player;

    private _bishops: Map<BishopId, Bishop>;
    private _bishopBosses: Map<BishopId, Bishop>;

    private _towws: Map<TOWW_Id, TOWW>;

    private constructor(private assetManager: AssetManager) {
        this._bishops = new Map();
        this._bishopBosses = new Map();

        this._towws = new Map();
    }

    static async create(gl: WebGLRenderingContext, root: string = "/", actorsToPreload: (typeof Actor)[] = []) {
        const assetManager = await AssetManager.create(gl, root);
        
        const factory = new Factory(assetManager);
        await factory.load(...actorsToPreload);

        return factory;
    }

    get hasLoadedFollower(): boolean {
        return !!this._follower;
    }

    get hasLoadedPlayer(): boolean {
        return !!this._player;
    }

    hasLoadedBishop(bishop: BishopId, isBoss: boolean): boolean {
        return (isBoss ? this._bishopBosses : this._bishops).has(bishop);
    }

    hasLoadedTOWW(form: TOWW_Id): boolean {
        return this._towws.has(form);
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
        for (const actor of actors) {
            switch (actor) {
                case Follower: {
                    if (this.hasLoadedFollower) break;
                    
                    const [skeleton, animationState] = await this.fetchData([Follower.TEXTURE_FILENAME], Follower.ATLAS_FILENAME, Follower.SKELETON_FILENAME);
                    this._follower = new Follower(skeleton, animationState, Random.id(), followerData.forms.Deer.name, "Deer", "Default_Clothing");

                    break;
                }

                case Player: {
                    if (this.hasLoadedPlayer) break;

                    const [skeleton, animationState] = await this.fetchData([Player.TEXTURE_FILENAME], Player.ATLAS_FILENAME, Player.SKELETON_FILENAME);
                    this._player = new Player(skeleton, animationState, Random.id(), playerData.creature.Lamb.name, "Lamb", "Lamb");

                    break;
                }

                case Bishop: {
                    await Promise.all(BISHOP_IDS.map((id) => Array(2).fill(null).filter((_, i) => !this.hasLoadedBishop(id, !!i)).map((_, i) => this.loadBishop(id, !!i))));
                    break;
                }

                case TOWW: {
                    await Promise.all(TOWW_IDS.filter((id) => !this.hasLoadedTOWW(id)).map(this.loadTOWW.bind(this)));
                    break;
                }
            }
        }
    }

    async loadBishop(id: BishopId, isBoss: boolean) {
        const data = bishopData[id];
        const loadBoss = isBoss && "bossSrc" in data;

        const { textures, atlas, skeleton: skeletonPath } = data[loadBoss ? "bossSrc" : "src"]!;
        const [skeleton, animationState] = await this.fetchData(textures, atlas, skeletonPath);

        const bishop = new Bishop(skeleton, animationState, Random.id(), bishopData.Worm.name, id, isBoss);
        (loadBoss ? this._bishopBosses : this._bishops).set(id, bishop);
    }
    
    async loadTOWW(form: TOWW_Id) {
        const { textures, atlas, skeleton: skeletonPath } = towwData[form].src;
        const [skeleton, animationState] = await this.fetchData(textures, atlas, skeletonPath);

        const toww = new TOWW(skeleton, animationState, Random.id(), towwData.Bishop.name, form);
        this._towws.set(form, toww);
    }

    async loadAll() {
        await this.load(Follower, Player, Bishop, TOWW);
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

    bishop(bishopId: BishopId, isBoss: boolean, id: string = Random.id(), label: string = "Copied Bishop") {
        return (isBoss && "bossSrc" in bishopData[bishopId] ? this._bishopBosses : this._bishops).get(bishopId)!.clone(id, label);
    }

    toww(form: TOWW_Id, id: string = Random.id(), label: string = "Copied The One Who Waits") {
        return this._towws.get(form)!.clone(id, label);
    }
}