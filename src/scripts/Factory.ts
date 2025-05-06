import { followerData, playerData, soldierData, occultistData, guardData, hereticData, machineData, bishopData, towwData, miniBossData, witnessData, knucklebonesPlayerData, questGiverData, shopkeeperData } from "../data/files";
import { type FollowerId, type ClothingId, type PlayerCreatureId, type PlayerFleeceId, type SoldierId, type OccultistId, type GuardId, type HereticId, type MachineId, type BishopId, type TOWW_Id, type MiniBossId, type WitnessId, type KnucklebonesPlayerId, HERETIC_IDS, MACHINE_IDS, BISHOP_IDS, TOWW_IDS, MINI_BOSS_IDS, KNUCKLEBONES_PLAYER_IDS, type QuestGiverId, QUEST_GIVER_IDS, type ShopkeeperId, SHOPKEEPER_IDS } from "../data/types";

import { Follower, ModdedFollower, Player, Soldier, Occultist, Guard, Heretic, Machine, Bishop, TOWW, MiniBoss, Witness, KnucklebonesPlayer, QuestGiver, Shopkeeper } from "./characters";
import { AssetManager } from "./managers";

import { Actor } from "./Actor";

export class Factory {
    private _follower?: Follower;
    private _moddedFollower?: ModdedFollower;

    private _player?: Player;

    private _soldier?: Soldier;
    private _occultist?: Occultist;
    private _guard?: Guard;

    private _heretics: Map<HereticId, Heretic>;
    private _machines: Map<MachineId, Machine>;

    private _bishops: Map<BishopId, Bishop>;
    private _bishopBosses: Map<BishopId, Bishop>;

    private _TOWWs: Map<TOWW_Id, TOWW>;

    private _miniBosses: Map<MiniBossId, MiniBoss>;
    private _witness?: Witness;

    private _knucklebonesPlayers: Map<KnucklebonesPlayerId, KnucklebonesPlayer>;
    private _questGivers: Map<QuestGiverId, QuestGiver>;
    private _shopkeepers: Map<ShopkeeperId, Shopkeeper>;

    private constructor(private assetManager: AssetManager) {
        this._heretics = new Map();
        this._machines = new Map();

        this._bishops = new Map();
        this._bishopBosses = new Map();

        this._TOWWs = new Map();

        this._miniBosses = new Map();

        this._knucklebonesPlayers = new Map();
        this._questGivers = new Map();
        this._shopkeepers = new Map();
    }

    static async create(gl: WebGLRenderingContext, root: string = "/", actorsToPreload: (typeof Actor)[] = []) {
        const assetManager = await AssetManager.create(gl, root);
        
        const factory = new Factory(assetManager);
        await factory.load(...actorsToPreload);

        return factory;
    }

    hasLoadedFollower(): boolean {
        return !!this._follower;
    }

    hasLoadedModdedFollower(): boolean {
        return !!this._moddedFollower;
    }

    hasLoadedPlayer(): boolean {
        return !!this._player;
    }

    hasLoadedSoldier(): boolean {
        return !!this._soldier;
    }

    hasLoadedOccultist(): boolean {
        return !!this._occultist;
    }

    hasLoadedGuard(): boolean {
        return !!this._guard;
    }

    hasLoadedHeretic(heretic: HereticId): boolean {
        return this._heretics.has(heretic);
    }

    hasLoadedMachine(machine: MachineId): boolean {
        return this._machines.has(machine);
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

    hasLoadedWitness(): boolean {
        return !!this._witness;
    }

    hasLoadedKnucklebonesPlayer(player: KnucklebonesPlayerId): boolean {
        return this._knucklebonesPlayers.has(player);
    }

    hasLoadedQuestGiver(giver: QuestGiverId): boolean {
        return this._questGivers.has(giver);
    }

    hasLoadedShopkeeper(shopkeeper: ShopkeeperId): boolean {
        return this._shopkeepers.has(shopkeeper);
    }

    async fetchData(texturePaths: string[] | Record<string, string>, atlasPath: string, skeletonPath: string): Promise<[spine.SkeletonData, spine.TextureAtlas]> {
        if (Array.isArray(texturePaths)) texturePaths = Object.fromEntries(texturePaths.map((path) => Array<string>(2).fill(path)));
        
        const textures: Record<string, spine.webgl.GLTexture> = {};
        for (const path in texturePaths) textures[path] = await this.assetManager.fetchTexture((<Record<string, string>>texturePaths)[path]);

        const atlas = await this.assetManager.fetchAtlas(atlasPath, textures);
        const skeletonData = await this.assetManager.fetchSkeletonData(skeletonPath, atlas);

        return [skeletonData, atlas];
    }

    async load(...actors: (typeof Actor)[]) {
        for (const actor of actors) {
            switch (actor) {
                case Follower: {
                    if (this.hasLoadedFollower()) break;
                    await this.loadFollower();

                    break;
                }

                case ModdedFollower: {
                    if (this.hasLoadedModdedFollower()) break;
                    await this.loadModdedFollower();

                    break;
                }

                case Player: {
                    if (this.hasLoadedPlayer()) break;
                    await this.loadPlayer();

                    break;
                }

                case Soldier: {
                    if (this.hasLoadedSoldier()) break;
                    await this.loadSoldier();

                    break;
                }

                case Occultist: {
                    if (this.hasLoadedOccultist()) break;
                    await this.loadOccultist();

                    break;
                }

                case Guard: {
                    if (this.hasLoadedGuard()) break;
                    await this.loadGuard();

                    break;
                }

                case Heretic: {
                    await Promise.all(HERETIC_IDS.filter((id) => !this.hasLoadedHeretic(id)).map(this.loadHeretic.bind(this)));
                    break;
                }

                case Machine: {
                    await Promise.all(MACHINE_IDS.filter((id) => !this.hasLoadedMachine(id)).map(this.loadMachine.bind(this)));
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
                    if (this.hasLoadedWitness()) return;
                    await this.loadWitness();

                    break;
                }

                case KnucklebonesPlayer: {
                    await Promise.all(KNUCKLEBONES_PLAYER_IDS.filter((id) => !this.hasLoadedKnucklebonesPlayer(id)).map(this.loadKnucklebonesPlayer.bind(this)));
                    break;
                }

                case QuestGiver: {
                    await Promise.all(QUEST_GIVER_IDS.filter((id) => !this.hasLoadedQuestGiver(id)).map(this.loadQuestGiver.bind(this)));
                    break;
                }

                case Shopkeeper: {
                    await Promise.all(SHOPKEEPER_IDS.filter((id) => !this.hasLoadedShopkeeper(id)).map(this.loadShopkeeper.bind(this)));
                    break;
                }
            }
        }
    }

    async loadAll() {
        await this.load(Follower, Player, Soldier, Occultist, Guard, Heretic, Machine, Bishop, TOWW, MiniBoss, Witness, KnucklebonesPlayer, QuestGiver, Shopkeeper);
    }

    async loadFollower() {
        const [skeletonData, atlas] = await this.fetchData({ [Follower.TEXTURE_FILENAME]: Follower.TEXTURE_FILE_PATH }, Follower.ATLAS_FILENAME, Follower.SKELETON_FILENAME);
        this._follower = new Follower(skeletonData, atlas);
    }

    async loadModdedFollower() {
        const [skeletonData, atlas] = await this.fetchData(ModdedFollower.TEXTURE_PATHS, ModdedFollower.ATLAS_FILENAME, ModdedFollower.SKELETON_FILENAME);
        this._moddedFollower = new ModdedFollower(skeletonData, atlas, undefined, undefined, undefined, undefined);
    }

    async loadPlayer() {
        const [skeletonData, atlas] = await this.fetchData({ [Player.TEXTURE_FILENAME]: Player.TEXTURE_FILE_PATH }, Player.ATLAS_FILENAME, Player.SKELETON_FILENAME);
        this._player = new Player(skeletonData, atlas);
    }

    async loadSoldier() {
        const [skeletonData, atlas] = await this.fetchData([Soldier.TEXTURE_FILENAME], Soldier.ATLAS_FILENAME, Soldier.SKELETON_FILENAME);
        this._soldier = new Soldier(skeletonData, atlas);
    }

    async loadOccultist() {
        const [skeletonData, atlas] = await this.fetchData([Occultist.TEXTURE_FILENAME], Occultist.ATLAS_FILENAME, Occultist.SKELETON_FILENAME);        
        this._occultist = new Occultist(skeletonData, atlas);
    }

    async loadGuard() {
        const [skeletonData, atlas] = await this.fetchData([Guard.TEXTURE_FILENAME], Guard.ATLAS_FILENAME, Guard.SKELETON_FILENAME);        
        this._guard = new Guard(skeletonData, atlas);
    }

    async loadHeretic(id: HereticId) {
        const data = hereticData[id];
        const { name, src } = data;

        const {
            textures,
            atlas: atlasPath,
            
            skeleton: skeletonPath
        } = src;
        
        const [skeletonData, atlas] = await this.fetchData(textures, atlasPath, skeletonPath);

        const heretic = new Heretic(skeletonData, atlas, undefined, name, id);
        this._heretics.set(id, heretic);
    }

    async loadMachine(id: MachineId) {
        const data = machineData[id];
        const { name, src } = data;

        const {
            textures,
            atlas: atlasPath,
            
            skeleton: skeletonPath
        } = src;
        
        const [skeletonData, atlas] = await this.fetchData(textures, atlasPath, skeletonPath);

        const machine = new Machine(skeletonData, atlas, undefined, name, id);
        this._machines.set(id, machine);
    }

    async loadBishop(id: BishopId, isBoss: boolean) {
        const data = bishopData[id];
        const { name, src, bossSrc } = data;

        const loadBoss = isBoss && "bossSrc" in data;

        const {
            textures,
            atlas: atlasPath,
            
            skeleton: skeletonPath
        } = loadBoss ? bossSrc! : src;
        
        const [skeletonData, atlas] = await this.fetchData(textures, atlasPath, skeletonPath);

        const bishop = new Bishop(skeletonData, atlas, undefined, name, id, isBoss);
        (loadBoss ? this._bishopBosses : this._bishops).set(id, bishop);
    }
    
    async loadTOWW(form: TOWW_Id) {
        const data = towwData[form];
        const { name, src } = data;

        const {
            textures,
            atlas: atlasPath,
            
            skeleton: skeletonPath
        } = src;
        
        const [skeletonData, atlas] = await this.fetchData(textures, atlasPath, skeletonPath);

        const toww = new TOWW(skeletonData, atlas, undefined, name, form);
        this._TOWWs.set(form, toww);
    }

    async loadMiniBoss(id: MiniBossId) {
        const data = miniBossData[id];
        const { name, src } = data;

        const {
            textures,
            atlas: atlasPath,
            
            skeleton: skeletonPath
        } = src;
        
        const [skeletonData, atlas] = await this.fetchData(textures, atlasPath, skeletonPath);

        const miniBoss = new MiniBoss(skeletonData, atlas, undefined, name, id, false);
        this._miniBosses.set(id, miniBoss);
    }

    async loadWitness() {
        const [skeletonData, atlas] = await this.fetchData({ [Witness.TEXTURE_FILENAME]: Witness.TEXTURE_FILE_PATH }, Witness.ATLAS_FILENAME, Witness.SKELETON_FILENAME);
        this._witness = new Witness(skeletonData, atlas);
    }

    async loadKnucklebonesPlayer(id: KnucklebonesPlayerId) {
        const data = knucklebonesPlayerData[id];
        const { name, src } = data;

        const {
            textures,
            atlas: atlasPath,
            
            skeleton: skeletonPath
        } = src;
        
        const [skeletonData, atlas] = await this.fetchData(textures, atlasPath, skeletonPath);

        const knucklebonesPlayer = new KnucklebonesPlayer(skeletonData, atlas, undefined, name, id);
        this._knucklebonesPlayers.set(id, knucklebonesPlayer);
    }

    async loadQuestGiver(id: QuestGiverId) {
        const data = questGiverData[id];
        const { name, src } = data;

        const {
            textures,
            atlas: atlasPath,
            
            skeleton: skeletonPath
        } = src;
        
        const [skeletonData, atlas] = await this.fetchData(textures, atlasPath, skeletonPath);

        const questGiver = new QuestGiver(skeletonData, atlas, undefined, name, id);
        this._questGivers.set(id, questGiver);
    }

    async loadShopkeeper(id: ShopkeeperId) {
        const data = shopkeeperData[id];
        const { name, src } = data;

        const {
            textures,
            atlas: atlasPath,
            
            skeleton: skeletonPath
        } = src;
        
        const [skeletonData, atlas] = await this.fetchData(textures, atlasPath, skeletonPath);

        const shopkeeper = new Shopkeeper(skeletonData, atlas, undefined, name, id);
        this._shopkeepers.set(id, shopkeeper);
    }

    async custom(texturePaths: string[] | Record<string, string>, atlasPath: string, skeletonPath: string, id?: string, label: string = "Custom Actor") {
        const [skeletonData, atlas] = await this.fetchData(texturePaths, atlasPath, skeletonPath);
        return new Actor(skeletonData, atlas, id, label);
    }

    follower(form: FollowerId, clothing: ClothingId, id?: string, label: string = followerData.forms[form].name) {
        if (!this.hasLoadedFollower()) throw new Error("Follower has not been loaded.");
        return this._follower!.clone(id, label, form, clothing);
    }

    moddedFollower(form: FollowerId, clothing: ClothingId, id?: string, label: string = followerData.forms[form].name) {
        if (!this.hasLoadedModdedFollower()) throw new Error("Modded Follower has not been loaded.");
        return this._moddedFollower!.clone(id, label, form, clothing);
    }

    player(creature: PlayerCreatureId, fleece: PlayerFleeceId, id?: string, label: string = playerData.creatures[creature].name) {
        if (!this.hasLoadedPlayer()) throw new Error("Player has not been loaded.");
        return this._player!.clone(id, label, creature, fleece);
    }

    soldier(soldier: SoldierId, id?: string, label: string = soldierData[soldier].name) {
        if (!this.hasLoadedSoldier()) throw new Error("Soldier has not been loaded.");
        return this._soldier!.clone(id, label, soldier);
    }

    occultist(occultist: OccultistId, id?: string, label: string = occultistData[occultist].name) {
        if (!this.hasLoadedOccultist()) throw new Error("Occultist has not been loaded.");
        return this._occultist!.clone(id, label, occultist);
    }

    guard(guard: GuardId, id?: string, label: string = guardData[guard].name) {
        if (!this.hasLoadedGuard()) throw new Error("Guard has not been loaded.");
        return this._guard!.clone(id, label, guard);
    }

    heretic(heretic: HereticId, id?: string, label: string = hereticData[heretic].name) {
        if (!this.hasLoadedHeretic(heretic)) throw new Error(`Heretic ${heretic} has not been loaded.`);
        return this._heretics.get(heretic)!.clone(id, label);
    }

    machine(machine: MachineId, id?: string, label: string = machineData[machine].name) {
        if (!this.hasLoadedMachine(machine)) throw new Error(`Machine ${machine} has not been loaded.`);
        return this._machines.get(machine)!.clone(id, label);
    }

    bishop(bishop: BishopId, isBoss: boolean, id?: string, label: string = bishopData[bishop].name) {
        if (!this.hasLoadedBishop(bishop, isBoss)) throw new Error(`Bishop ${isBoss ? "Boss" : ""} ${bishop} has not been loaded.`);
        return (isBoss && "bossSrc" in bishopData[bishop] ? this._bishopBosses : this._bishops).get(bishop)!.clone(id, label);
    }

    TOWW(form: TOWW_Id, id?: string, label: string = towwData[form].name) {
        if (!this.hasLoadedTOWW(form)) throw new Error(`TOWW ${form} has not been loaded.`);
        return this._TOWWs.get(form)!.clone(id, label);
    }

    miniBoss(miniBoss: MiniBossId, isUpgraded?: boolean, id?: string, label: string = miniBossData[miniBoss].name) {
        if (!this.hasLoadedMiniBoss(miniBoss)) throw new Error(`Mini Boss ${miniBoss} has not been loaded.`);
        return this._miniBosses.get(miniBoss)!.clone(id, label, isUpgraded);
    }

    witness(witness: WitnessId, isUpgraded?: boolean, id?: string, label: string = witnessData[witness].name) {
        if (!this.hasLoadedWitness()) throw new Error(`Witness has not been loaded.`);
        return this._witness!.clone(id, label, witness, isUpgraded);
    }

    knucklebonesPlayer(player: KnucklebonesPlayerId, id?: string, label: string = knucklebonesPlayerData[player].name) {
        if (!this.hasLoadedKnucklebonesPlayer(player)) throw new Error(`Knucklebones Player ${player} has not been loaded.`);
        return this._knucklebonesPlayers.get(player)!.clone(id, label);
    }

    questGiver(giver: QuestGiverId, id?: string, label: string = questGiverData[giver].name) {
        if (!this.hasLoadedQuestGiver(giver)) throw new Error(`Quest Giver ${giver} has not been loaded.`);
        return this._questGivers.get(giver)!.clone(id, label);
    }

    shopkeeper(shopkeeper: ShopkeeperId, id?: string, label: string = shopkeeperData[shopkeeper].name) {
        if (!this.hasLoadedShopkeeper(shopkeeper)) throw new Error(`Shopkeeper ${shopkeeper} has not been loaded.`);
        return this._shopkeepers.get(shopkeeper)!.clone(id, label);
    }
}