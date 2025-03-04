import { BISHOP_IDS, TOWW_IDS, type BishopId, type ClothingId, type FollowerId, type TOWW_Id, type PlayerCreatureId, type PlayerFleeceId, MINI_BOSS_IDS, type MiniBossId, type WitnessId, type SoldierId } from "../data/types";

import { Bishop, Follower, TOWW, Player, MiniBoss, Witness, Soldier } from "./characters";
import { AssetManager } from "./managers";

import { Actor } from "./Actor";
import { bishopData, towwData, miniBossData } from "../data/files";

export class Factory {
    private _follower?: Follower;
    private _player?: Player;

    private _soldier?: Soldier;

    private _bishops: Map<BishopId, Bishop>;
    private _bishopBosses: Map<BishopId, Bishop>;

    private _TOWWs: Map<TOWW_Id, TOWW>;

    private _miniBosses: Map<MiniBossId, MiniBoss>;
    private _witness?: Witness;

    private constructor(private assetManager: AssetManager) {
        this._bishops = new Map();
        this._bishopBosses = new Map();

        this._TOWWs = new Map();

        this._miniBosses = new Map();
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

    get hasLoadedSoldier(): boolean {
        return !!this._soldier;
    }

    hasLoadedBishop(bishop: BishopId, isBoss: boolean): boolean {
        return (isBoss ? this._bishopBosses : this._bishops).has(bishop);
    }

    hasLoadedTOWW(form: TOWW_Id): boolean {
        return this._TOWWs.has(form);
    }

    hasLoadedMiniBoss(miniBoss: MiniBossId): boolean {
        return this._miniBosses.has(miniBoss);
    }

    get hasLoadedWitness(): boolean {
        return !!this._witness;
    }

    async fetchData(texturePaths: string[] | Record<string, string>, atlasPath: string, skeletonPath: string): Promise<[spine.Skeleton, spine.AnimationState]> {
        if (Array.isArray(texturePaths)) texturePaths = Object.fromEntries(texturePaths.map((path) => Array<string>(2).fill(path)));
        
        const textures: Record<string, spine.webgl.GLTexture> = {};
        for (const path in texturePaths) textures[path] = await this.assetManager.fetchTexture(path);

        const atlas = await this.assetManager.fetchAtlas(atlasPath, textures);
        const skeleton = await this.assetManager[skeletonPath.endsWith(".json") ? "fetchJSON" : "fetchSkeleton"](skeletonPath, atlas);

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
                    this._follower = new Follower(skeleton, animationState);

                    break;
                }

                case Player: {
                    if (this.hasLoadedPlayer) break;

                    const [skeleton, animationState] = await this.fetchData([Player.TEXTURE_FILENAME], Player.ATLAS_FILENAME, Player.SKELETON_FILENAME);
                    this._player = new Player(skeleton, animationState);

                    break;
                }

                case Soldier: {
                    if (this.hasLoadedSoldier) break;

                    const [skeleton, animationState] = await this.fetchData([Soldier.TEXTURE_FILENAME], Soldier.ATLAS_FILENAME, Soldier.SKELETON_FILENAME);
                    this._soldier = new Soldier(skeleton, animationState);

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

                case MiniBoss: {
                    await Promise.all(MINI_BOSS_IDS.filter((id) => !this.hasLoadedMiniBoss(id)).map(this.loadMiniBoss.bind(this)));
                    break;
                }

                case Witness: {
                    if (this.hasLoadedWitness) return;

                    const [skeleton, animationState] = await this.fetchData([Witness.TEXTURE_FILENAME], Witness.ATLAS_FILENAME, Witness.SKELETON_FILENAME);
                    this._witness = new Witness(skeleton, animationState);

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

        const bishop = new Bishop(skeleton, animationState, undefined, bishopData[id].name, id, isBoss);
        (loadBoss ? this._bishopBosses : this._bishops).set(id, bishop);
    }
    
    async loadTOWW(form: TOWW_Id) {
        const { textures, atlas, skeleton: skeletonPath } = towwData[form].src;
        const [skeleton, animationState] = await this.fetchData(textures, atlas, skeletonPath);

        const toww = new TOWW(skeleton, animationState, undefined, towwData[form].name, form);
        this._TOWWs.set(form, toww);
    }

    async loadMiniBoss(miniBoss: MiniBossId) {
        const { textures, atlas, skeleton: skeletonPath } = miniBossData[miniBoss].src;
        const [skeleton, animationState] = await this.fetchData(textures, atlas, skeletonPath);

        const boss = new MiniBoss(skeleton, animationState, undefined, miniBossData[miniBoss].name, miniBoss, false);
        this._miniBosses.set(miniBoss, boss);
    }

    async loadAll() {
        await this.load(Follower, Player, Soldier, Bishop, TOWW, MiniBoss, Witness);
    }

    async custom(texturePaths: string[] | Record<string, string>, atlasPath: string, skeletonPath: string, id?: string, label: string = "Custom Actor") {
        const [skeleton, animationState] = await this.fetchData(texturePaths, atlasPath, skeletonPath);
        return new Actor(skeleton, animationState, id, label);
    }

    follower(form: FollowerId, clothing: ClothingId, id?: string, label?: string) {
        if (!this.hasLoadedFollower) throw new Error("Follower has not been loaded.");
        return this._follower!.clone(id, label, form, clothing);
    }

    player(creature: PlayerCreatureId, fleece: PlayerFleeceId, id?: string, label?: string) {
        if (!this.hasLoadedPlayer) throw new Error("Player has not been loaded.");
        return this._player!.clone(id, label, creature, fleece);
    }

    soldier(soldierId: SoldierId, id?: string, label?: string) {
        if (!this.hasLoadedSoldier) throw new Error("Soldier has not been loaded.");
        return this._soldier!.clone(id, label, soldierId);
    }

    bishop(bishopId: BishopId, isBoss: boolean, id?: string, label?: string) {
        if (!this.hasLoadedBishop(bishopId, isBoss)) throw new Error(`Bishop${isBoss ? "Boss" : ""} ${bishopId} has not been loaded.`);
        return (isBoss && "bossSrc" in bishopData[bishopId] ? this._bishopBosses : this._bishops).get(bishopId)!.clone(id, label);
    }

    TOWW(form: TOWW_Id, id?: string, label?: string) {
        if (!this.hasLoadedTOWW(form)) throw new Error(`TOWW ${form} has not been loaded.`);
        return this._TOWWs.get(form)!.clone(id, label);
    }

    miniBoss(miniBoss: MiniBossId, isUpgraded?: boolean, id?: string, label?: string) {
        if (!this.hasLoadedMiniBoss(miniBoss)) throw new Error(`Mini Boss ${miniBoss} has not been loaded.`);
        return this._miniBosses.get(miniBoss)!.clone(id, label, isUpgraded);
    }

    witness(witness: WitnessId, isUpgraded?: boolean, id?: string, label?: string) {
        if (!this.hasLoadedWitness) throw new Error(`Witness has not been loaded.`);
        return this._witness!.clone(id, label, witness, isUpgraded);
    }
}