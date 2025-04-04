<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { ArrowSelection, BannerButton, Dialog, Header, Label, LabelTitle, NavTip, Notice, ProgressRing } from "./components/base";
    import { SceneCanvas, Categories, LoadingThrobber, LoadingSymbol, CloudShaders } from "./components/misc";
    import { List } from "./components/utils";
    
    import { CharacterList, FollowerMenus, PlayerMenus, getRandomFollowerAppearance, getSpecialFollowerName, CharacterNavigation, isStrFollowerMenuName, isStrPlayerMenuName, BishopMenus, BISHOP_MENU_NAME, GuardMenus, GUARD_MENU_NAME, HereticMenus, HERETIC_MENU_NAME, MachineMenus, MACHINE_MENU_NAME, MiniBossMenus, MINI_BOSS_MENU_NAME, OccultistMenus, OCCULTIST_MENU_NAME, SoldierMenus, SOLDIER_MENU_NAME, TOWW_Menus, TOWW_MENU_NAME, WitnessMenus, WITNESS_MENU_NAME, KnucklebonesPlayerMenus, KNUCKLEBONES_PLAYER_MENU_NAME } from "./components/characters";
    import { FormatOptions, SizeOptions, TimingOptions } from "./components/exporting";

    import { News } from "./components/news";
    import { CreationDetails, SpecialThanks, HAS_NOTICED_TUTORIAL_LOCAL_STORAGE_NAME, NarinderPetter, HAS_PET_NARINDER_LOCAL_STORAGE_NAME } from "./components/credits";

    import { Actor, Exporter, Factory, FORMAT_IDS, Scene, type ActorObject, type FormatData, type FormatId } from "./scripts";
    import { Bishop, isBishopObj, Follower, isFollowerObj, Guard, isGuardObj, Heretic, isHereticObj, Machine, isMachineObj, MiniBoss, isMiniBossObj, ModdedFollower, isModdedFollowerObj, Occultist, isOccultistObj, Player, isPlayerObj, Soldier, isSoldierObj, TOWW, isTOWW_Obj, Witness, isWitnessObj, KnucklebonesPlayer, isKnucklebonesPlayerObj } from "./scripts/characters";
    import { soundManager, newsManager, NewsManager, type NewsLoader, serverManager } from "./scripts/managers";

    import { bishopData, hereticData, knucklebonesPlayerData, machineData, miniBossData, towwData } from "./data/files";
    import { BISHOP_IDS, GUARD_IDS, HERETIC_IDS, KNUCKLEBONES_PLAYER_IDS, MACHINE_IDS, MINI_BOSS_IDS, OCCULTIST_IDS, SOLDIER_IDS, WITNESS_IDS } from "./data/types";

    import { MoreMath, Random, unixToDate, Vector } from "./utils";

    const LOADING_STATES = ["ToSAcknowledgement", "LoadingAssets", "SceneSetup", "FetchingNews"] as const;
    const LOADING_TEXTS: string[] = ["Checking ToS Acknowledgement", "Loading Assets", "Setting Up Scene", "Fetching News"];
    
    const EXPORTING_TEXTS: string[] = ["Rendering Scene", "Encoding Frames", "Downloading Scene"];
    const FIRST_LOAD_NEWS_NUM_OF_FILES: number = 3;

    let scene: Scene = $state(Scene.prototype);
    let factory: Factory = $state(Factory.prototype);

    let exporter: Exporter = $state(Exporter.prototype);
    
    let categoryIdx: number = $state(0);
    let categoryMenu: HTMLDivElement = $state(document.createElement("div"));

    let isOnPhone: boolean = $state(false);
    let isMobile: boolean = $state(false);

    let isFullScreen: boolean = $state(false);

    let loadingState: number = $state(-1);
    const loadingText: string = $derived(LOADING_TEXTS[MoreMath.clamp(loadingState, 0, LOADING_TEXTS.length - 1)]);

    let hasUserCompliedToTOS: boolean = $state(false);
    const hasFinishedLoading: boolean = $derived(loadingState === LOADING_STATES.length);

    let news: Record<string, string[]> = $state({});
    let fullyLoadedFolders: string[] = $state([]);

    let loadNews: NewsLoader | null = $state(null);

    let lastUpdatedUnix: number = $state(-1);

    let hasNoticedTutorial: boolean = $state(!!localStorage.getItem(HAS_NOTICED_TUTORIAL_LOCAL_STORAGE_NAME));
    let hasPetNarinder: boolean = $state(!!localStorage.getItem(HAS_PET_NARINDER_LOCAL_STORAGE_NAME));

    let showRiverBoyObituary: boolean = $state(false);
    let isRiverBoyObituaryVisible: boolean = $state(false);

    let actors: ActorObject[] | null = $state(null);
    let actorIdx: number = $state(-1);
    let actorMenu: string | null = $state(null);

    let loadingActor: typeof Actor | null = $state(null);
    let showActorMenu: boolean = $state(false);
    let useExperimentalAnimations: boolean = $state(false);

    let actor: Actor | null = $state(null);
    let actorObj: ActorObject | null = $state(null);

    let size = $state(new Vector(640, 360).toObj());
    let lockAspectRatio = $state(false);

    let fitScene: boolean = $state(false);
    let cropScene: boolean = $state(false);

    let duration: number = $state(5);
    let trimLongest: boolean = $state(false);

    let exportFormat: FormatId = $state("gif");
    let exportName: string = $state("cultivis-export");

    const exportData: Record<FormatId, FormatData> = $state({
        "gif": {
            type: "gif",

            delay: 20,
            useAccurateColors: false
        },

        "apng": {
            type: "apng",
            fps: 60
        }
    });
    
    let exportProgress: number = $state(-1);

    let exportState: number = $state(-1);
    const exportText: string = $derived(EXPORTING_TEXTS[MoreMath.clamp(exportState, 0, EXPORTING_TEXTS.length - 1)]);

    let numOfPets: number = $state(-1);

    // svelte-ignore state_referenced_locally
    matchMedia("(max-width: 64rem)").matches && Vector.fromObj(size).swap().cloneObj(size);

    const abortController = new AbortController();
    const resizer = new ResizeObserver(() => {
        isOnPhone = matchMedia("(max-width: 40rem)").matches;

        isMobile = matchMedia("(max-width: 64rem)").matches;
        isFullScreen = matchMedia("(max-width: 80rem)").matches;
    });

    onMount(async () => {
        window.addEventListener("keydown", (evt) => {
            const { code, shiftKey, ctrlKey, altKey } = evt;
            if (!["KeyE", "KeyF"].includes(code) || document.activeElement instanceof HTMLInputElement) return;
            
            evt.preventDefault();
            
            if (code === "KeyE" && !ctrlKey && !altKey) {
                const element = document.activeElement as HTMLElement;
                element.click();

                return;
            }

            if (hasUserCompliedToTOS && !showRiverBoyObituary && code === "KeyF" && shiftKey && altKey) {
                isRiverBoyObituaryVisible = true;
                showRiverBoyObituary = true;

                setTimeout(async () => {
                    await soundManager.load("River_Boy_Obituary_Music");
                    soundManager.play("River_Boy_Obituary_Music");
                }, 2000);

                return;
            }
            
            if (ctrlKey || altKey) return;

            if (showActorMenu) {
                showActorMenu = false;
                soundManager.play("Menu_Close");

                return;
            }
            
            if (actorIdx >= 0) {
                actorIdx = -1;
                soundManager.play("Menu_Close");

                return;
            }
        }, { signal: abortController.signal });

        resizer.observe(document.documentElement);

        await soundManager.load("Click", "Flicker");

        loadingState = LOADING_STATES.indexOf("ToSAcknowledgement");
        if (await newsManager.areTermsAcknowledged()) hasUserCompliedToTOS = true;
    });

    onDestroy(async () => {
        abortController.abort();
        
        resizer.disconnect();
        
        scene?.dispose();
        exporter?.dispose();
    });

    function acknowledgeTerms() {
        if (hasUserCompliedToTOS) return;
        hasUserCompliedToTOS = true;
        
        if (scene instanceof Scene) init();
    }

    async function onCanvasLoad(canvasScene: Scene, canvasFactory: Factory) {
        scene = canvasScene;
        scene.size.copyObj(size);

        factory = canvasFactory;
        await init();
    }

    async function init() {
        hasUserCompliedToTOS && localStorage.setItem(NewsManager.TERMS_LOCAL_STORAGE_NAME, `${await newsManager.getTermsUnix()}`);

        loadingState = LOADING_STATES.indexOf("LoadingAssets");

        await factory.load(Follower, Player);

        exporter = await Exporter.create();
        await exporter.factory.load(Follower, Player);

        loadingState = LOADING_STATES.indexOf("SceneSetup");
    
        const deer = factory.follower("Deer", "Default_Clothing");
        deer.label = "Deer";
        deer.setRawAnimation("idle");

        deer.pos.setX(-180);
        deer.flipX = true;

        const player = factory.player("Lamb", "Lamb");
        player.label = "Lamb";
        player.setRawAnimation("idle");

        player.pos.setX(180);

        scene.addActors(deer, player);
        actors = scene.actors.map((actor) => actor.toObj());
        
        scene.resetCamera();
        scene.scale *= 1.5;

        lastUpdatedUnix = await newsManager.getLastUpdatedUnix();
        import.meta.env.PROD && await serverManager.addNewVisitor();
        
        await soundManager.load("Menu_Close", "Menu_Open", "Option_Change", "Laugh");
        numOfPets = await serverManager.getPets();
        
        loadingState = LOADING_STATES.indexOf("FetchingNews");
        loadNews = await newsManager.getNews();

        news = await loadNews(FIRST_LOAD_NEWS_NUM_OF_FILES, [NewsManager.CHANGELOG_FOLDER_NAME, NewsManager.BLOG_FOLDER_NAME]);
        fullyLoadedFolders = newsManager.fullyLoadedNewsFolders;

        setTimeout(() => loadingState = LOADING_STATES.length, 400);
    }

    async function addActor(actor: typeof Actor, updateActorIdx: boolean = true) {
        loadingActor = actor;
        let addedActor: Actor;

        switch (actor) {
            case Follower:
            case ModdedFollower: {
                const isModdedFollower = actor === ModdedFollower;

                isModdedFollower ? !factory.hasLoadedModdedFollower() && await factory.loadModdedFollower() && await exporter.factory.loadModdedFollower() : !factory.hasLoadedFollower() && await factory.loadFollower() && await exporter.factory.loadFollower();
                const [form, formVariantIdx, formColorSetIdx] = getRandomFollowerAppearance();

                const follower = factory[isModdedFollower ? "moddedFollower" : "follower"](form, "Default_Clothing", undefined, getSpecialFollowerName(form, formVariantIdx));
                follower.setRawAnimation("idle");

                follower.formVariantIdx = formVariantIdx;
                follower.formColorSetIdx = formColorSetIdx;

                addedActor = follower;
                break;
            }

            case Player: {
                !factory.hasLoadedPlayer() && await factory.loadPlayer() && await exporter.factory.loadPlayer();

                const player = factory.player("Lamb", "Lamb");
                player.setRawAnimation("idle");

                addedActor = player;
                break;
            }

            case Soldier: {
                const id = Random.item(SOLDIER_IDS);
                !factory.hasLoadedSoldier() && await factory.loadSoldier() && await exporter.factory.loadSoldier();

                const soldier = factory.soldier(id);
                soldier.setRawAnimation("idle");

                addedActor = soldier;
                break;
            }

            case Occultist: {
                const id = Random.item(OCCULTIST_IDS);
                !factory.hasLoadedOccultist() && await factory.loadOccultist() && await exporter.factory.loadOccultist();

                const occultist = factory.occultist(id);
                occultist.setRawAnimation("idle");

                addedActor = occultist;
                break;
            }

            case Guard: {
                const id = Random.item(GUARD_IDS);
                !factory.hasLoadedGuard() && await factory.loadGuard() && await exporter.factory.loadGuard();

                const guard = factory.guard(id);
                guard.setRawAnimation("idle");

                addedActor = guard;
                break;
            }

            case Heretic: {
                const id = Random.item(HERETIC_IDS);
                !factory.hasLoadedHeretic(id) && await factory.loadHeretic(id) && await exporter.factory.loadHeretic(id);

                const heretic = factory.heretic(id);
                heretic.setRawAnimation(hereticData[id].animation);
                
                addedActor = heretic;
                break;
            }

            case Machine: {
                const id = Random.item(MACHINE_IDS);
                !factory.hasLoadedMachine(id) && await factory.loadMachine(id) && await exporter.factory.loadMachine(id);

                const machine = factory.machine(id);
                machine.setRawAnimation(machineData[id].animation);
                
                addedActor = machine;
                break;
            }

            case Bishop: {
                const id = Random.item(BISHOP_IDS);
                !factory.hasLoadedBishop(id, false) && await factory.loadBishop(id, false) && await exporter.factory.loadBishop(id, false);

                const bishop = factory.bishop(id, false);
                bishop.setRawAnimation(bishopData[id].animation);

                addedActor = bishop;
                break;
            }

            case TOWW: {
                !factory.hasLoadedTOWW("Bishop") && await factory.loadTOWW("Bishop") && await exporter.factory.loadTOWW("Bishop");
                const toww = factory.TOWW("Bishop");
                
                const { attributes, animation } = towwData.Bishop;
                const {
                    hasCrown = null,
                    hasChains = null
                } = attributes;

                toww.hasCrown = hasCrown;
                toww.hasChains = hasChains;

                toww.setRawAnimation(animation);

                addedActor = toww;
                break;
            }

            case MiniBoss: {
                const id = Random.item(MINI_BOSS_IDS);
                !factory.hasLoadedMiniBoss(id) && await factory.loadMiniBoss(id) && await exporter.factory.loadMiniBoss(id);

                const boss = factory.miniBoss(id, false);
                boss.setRawAnimation(miniBossData[id].animation);

                addedActor = boss;
                break;
            }

            case Witness: {
                !factory.hasLoadedWitness() && await factory.loadWitness() && await exporter.factory.loadWitness();
                const id = Random.item(WITNESS_IDS);

                const witness = factory.witness(id, false);
                witness.setRawAnimation("animation");

                addedActor = witness;
                break;
            }

            case KnucklebonesPlayer: {
                const id = Random.item(KNUCKLEBONES_PLAYER_IDS);
                !factory.hasLoadedKnucklebonesPlayer(id) && await factory.loadKnucklebonesPlayer(id) && await exporter.factory.loadKnucklebonesPlayer(id);

                const knucklebonesPlayer = factory.knucklebonesPlayer(id);
                knucklebonesPlayer.setRawAnimation(knucklebonesPlayerData[id].animation);

                addedActor = knucklebonesPlayer;
                break;
            }

            default: return;
        }
        
        addRawActor(addedActor, updateActorIdx);
        loadingActor = null;
    }

    function addRawActor(actor: Actor, updateActorIdx: boolean = true) {
        scene.addActors(actor);
        actors = scene.actors.map((actor) => actor.toObj());

        updateActorIdx && selectActor((actors?.length ?? 0) - 1);
        updateSceneFromChanges();
    }

    function removeActor(actor: Actor, i: number) {
        scene.removeActors(actor);
        actors?.splice(i, 1);

        unselectActor();
        updateSceneFromChanges();
    }

    function cloneActor(actor: Actor) {
        const { label, animation } = actor;

        const clonedActor = actor.clone();
        clonedActor.label = label;
        clonedActor.setAnimation(animation);

        addRawActor(clonedActor);
    }
    
    function selectActor(i: number) {
        actorIdx = i;

        actor = scene.actors[actorIdx] ?? null;
        actorObj = actors?.[i] ?? null;

        soundManager.play("Menu_Open");
    }

    function unselectActor() {
        actorIdx = -1;
        showActorMenu = false;
    }

    function manipulateActor() {
        if (!actor || !actorObj) return;

        Vector.round(actor.pos, 2).cloneObj(actorObj.pos);
        Vector.round(actor.scale, 2).cloneObj(actorObj.scale);

        updateSceneFromChanges();
    }

    function swapActor(newActor: Actor) {
        scene.replaceActor(actor!, newActor);
        actors = scene.actors.map((actor) => actor.toObj());

        actor = newActor;
        actorObj = actors?.[scene.actors.indexOf(newActor)] ?? null;

        updateSceneFromChanges();
    }

    function reorderActor(offset: number) {
        const { actors: newActors } = scene;

        const newIdx = actorIdx + offset;
        if (newIdx < 0 || newIdx > newActors.length - 1) return;

        newActors.splice(actorIdx, 1, newActors[newIdx]);
        newActors.splice(newIdx, 1, actor!);

        scene.removeActors(...newActors);
        scene.addActors(...newActors);

        actors = scene.actors.map((actor) => actor.toObj());
        actorIdx = newIdx;
    }

    function selectMenu(menu: string) {
        actorMenu = menu;
        showActorMenu = true;

        soundManager.play("Menu_Open");
    }

    function exitMenu(doRemoval: boolean) {
        doRemoval ? removeActor(actor!, actorIdx) : unselectActor();
        soundManager.play("Menu_Close");
    }

    function selectCategoryMenu(i: number) {
        if (i) {
            actorIdx = -1;
            showActorMenu = false;
        }

        categoryMenu.classList.remove("fade");
        requestAnimationFrame(() => categoryMenu.classList.add("fade"));

        setTimeout(() => categoryIdx = i, 75);
    }

    async function exportScene() {
        const format = exportFormat;

        const sceneObj = scene.toObj();
        const buffer = await exporter.exportScene(sceneObj, duration, Vector.fromObj(size), format, exportData[format], (progress, state) => {
            exportProgress = progress;
            exportState = state;
        });

        const name = exportName || "cultivis-export";
        await serverManager.sendExport(sceneObj, name, duration, exportData[format]);

        const blob = new Blob([buffer], { type: `image/${format}` });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${name}.${format}`;

        link.click();

        exportProgress = -1;
        exportState = -1;
    }

    function updateSceneFromChanges() {
        fitScene || cropScene ? setCroppedScene() : setSceneSize();
        if (trimLongest) duration = MoreMath.round(Math.max(...scene.actors.map(({ duration }) => duration), 0), 2);
    }

    function setSceneSize() {
        if (lockAspectRatio) {
            if (scene.size.x !== size.x) {
                const { x } = size;
                const ratio = scene.size.grad();

                size.y = Math.round(ratio * x);
            } else if (scene.size.y !== size.y) {
                const { y } = size;
                const ratio = Vector.swap(scene.size).grad();

                size.x = Math.round(ratio * y);
            }
        }

        scene.size.copyObj(size);
    }

    function setCroppedScene() {
        scene.size.copyObj(size);
        scene.resetCamera();

        if (!cropScene) return;
        fitScene = true;

        Vector.ceil(scene.sceneSize).cloneObj(size);

        scene.size.copyObj(size);
        scene.resetCamera();
    }

    async function loadMoreNews(name: string) {
        news = await loadNews!(NewsManager.DEFAULT_LOAD_NUM_OF_FILES, [name]);
        fullyLoadedFolders = newsManager.fullyLoadedNewsFolders;
    }

    async function petNarinder() {
        numOfPets++;
        await serverManager.addNewPet();
    }

    function closeRiverBoyObituary() {
        showRiverBoyObituary = false;
        soundManager.stop("River_Boy_Obituary_Music");
    }
</script>

<div class="grid fixed top-0 left-0 z-100 place-items-center w-full h-full bg-secondary {hasFinishedLoading ? "opacity-0" : "opacity-100"} not-motion-reduce:transition-opacity not-motion-reduce:duration-900 select-none" ontransitionend={({ target }) => (target as HTMLDivElement).classList.replace("grid", "hidden")}>
    <LoadingSymbol {isMobile} />
    <div class="flex absolute {isMobile ? "bottom-4 left-6" : "bottom-10 left-16"} flex-row gap-6 items-center">
        <LoadingThrobber percent={((loadingState + 1) / LOADING_STATES.length) * 100} {isOnPhone} {isMobile} />
        <p class={["text-highlight", isMobile ? "text-lg" : "text-2xl", {"hidden": loadingState < 0 }]}>{loadingText}... {MoreMath.clamp(loadingState + 1, 1, LOADING_STATES.length)}/{LOADING_STATES.length}</p>
    </div>
</div>

{#if newsManager instanceof NewsManager}
    {#await newsManager.areTermsAcknowledged() then areTermsAcknowledged}
        {#if !areTermsAcknowledged}
            {#await Promise.all([newsManager.getTermsSummary(), newsManager.getTermsUnix()]) then [changesSummary, termsUnix]}
                <div class="grid fixed top-0 left-0 z-100 place-items-center w-full h-full bg-[#00000060] {hasUserCompliedToTOS ? "opacity-0" : "opacity-100"} transition-opacity duration-450 select-none" ontransitionend={({ target }) => (target as HTMLDivElement).classList.replace("grid", "hidden")}>
                    <Dialog childClass="mt-2 sm:mt-4" title="Disclaimer" description={localStorage.getItem(NewsManager.TERMS_LOCAL_STORAGE_NAME) ? `CultiVis has updated its terms of service${termsUnix ? ` on ${unixToDate(termsUnix)}` : ""}. ${changesSummary ? `${changesSummary.slice(0, -changesSummary.endsWith("."))}. ` : ""}You may view the new terms below or close this popup.` : "CultiVis requires you to agree and acknowledge the CultiVis Terms of Service. You may view the terms below or close this popup."}>
                        <Notice class="px-8 pb-2 sm:pb-4 sm:mt-4 text-xs sm:text-sm" label="Closing this popup will mean you agree with the Terms of Service." />
                        <List class="flex flex-col justify-center items-center" label="Terms of Service Disclaimer Options" enableKeyInput focusFirst>
                            <BannerButton label="View Terms" href="https://github.com/osoclos/cultivis/blob/main/ToS.md" />
                            <BannerButton label="Close and Accept" onclick={acknowledgeTerms} />
                        </List>
                    </Dialog>
                </div>
            {/await}
        {/if}
    {/await}
{/if}

{#if hasUserCompliedToTOS}
    <div class="aspect-square {hasFinishedLoading ? "grid" : "hidden"} lg:order-1 place-items-center px-4 xl:ml-40 w-full lg:w-[calc(100dvw_-_40rem)] xl:w-[calc(100dvw_-_50rem)] h-[calc(100dvh_-_74px)] lg:h-dvh">
        <SceneCanvas class="inline-block max-h-[calc(100dvh_-_106px)]" disableManipulation={fitScene} manipulationIdx={actorIdx} onshift={manipulateActor} onscroll={manipulateActor} onzoom={manipulateActor} onpinch={manipulateActor} style="aspect-ratio: {size.x} / {size.y}; max-width: calc((100dvh - 106px) * {size.x} / {size.y})" onload={onCanvasLoad} />
    </div>

    <div class={["overflow-hidden lg:h-dvh bg-secondary", { "hidden": !hasFinishedLoading }]}>
        <Categories class="justify-center items-center pt-6 pb-3 w-full lg:w-160 select-none" bind:hasNoticedTutorial bind:hasPetNarinder enableKeyInput={(actorIdx < 0 || isMobile)} onclick={selectCategoryMenu} />
        <div bind:this={categoryMenu} class="no-scrollbar lg:overflow-y-auto flex flex-col {[1, 3].includes(categoryIdx) ? "gap-6" : "gap-12"} items-center px-8 pt-6 pb-4 lg:h-[calc(100dvh_-_146px)] select-none">
            {#if categoryIdx === 0}
                <CharacterList bind:actors bind:loadingActor enableKeyInput={actorIdx < 0 && !isRiverBoyObituaryVisible} onadd={addActor} onremove={(indexes) => [...indexes].sort((a, b) => b - a).forEach((i) => removeActor(scene.actors[i], i))} onclone={(indexes) => indexes.forEach((i) => cloneActor(scene.actors[i]))} onactorclick={selectActor} />

                <div class={["lg:absolute z-90 lg:top-0 w-full lg:w-160 lg:h-full bg-secondary transition-[left,_filter] motion-reduce:transition-opacity duration-500", actorIdx < 0 ? "lg:-left-210 lg:motion-reduce:left-0 lg:brightness-0 lg:motion-reduce:brightness-100 lg:motion-reduce:opacity-0 lg:ease-in lg:motion-reduce:pointer-events-none" : "lg:left-0 lg:brightness-100 lg:motion-reduce:opacity-100 lg:ease-out", { "not-lg:hidden": actorIdx < 0 }]}>
                    {#if actor && actorObj}
                        <CharacterNavigation class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" {actor} obj={actorObj} {scene} {actorIdx} {factory} {exporter} enableKeyInput={actorIdx >= 0 && !showActorMenu && !isRiverBoyObituaryVisible} bind:useExperimentalAnimations onupdate={updateSceneFromChanges} onchange={swapActor} onreorder={reorderActor} onproceed={selectMenu} onexit={exitMenu} />
                    {/if}
                </div>

                <div class={["lg:absolute z-90 lg:top-0 w-full lg:w-160 lg:h-full bg-secondary transition-[left,_filter] motion-reduce:transition-opacity duration-500", !showActorMenu ? "lg:-left-210 lg:motion-reduce:left-0 lg:brightness-0 lg:motion-reduce:brightness-100 lg:motion-reduce:opacity-0 lg:ease-in lg:motion-reduce:pointer-events-none" : "lg:left-0 lg:brightness-100 lg:motion-reduce:opacity-100 lg:ease-out", { "not-lg:hidden": !showActorMenu }]}>
                    {#if actor && actorObj && actorMenu}
                        {#if (isFollowerObj(actorObj) || isModdedFollowerObj(actorObj)) && isStrFollowerMenuName(actorMenu)}
                            <FollowerMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" follower={actor as Follower} obj={actorObj} menu={actorMenu} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} />
                        {:else if isPlayerObj(actorObj) && isStrPlayerMenuName(actorMenu)}
                            <PlayerMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" player={actor as Player} obj={actorObj} menu={actorMenu} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} />
                        {:else if isSoldierObj(actorObj) && actorMenu === SOLDIER_MENU_NAME}
                            <SoldierMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" soldier={actor as Soldier} obj={actorObj} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} />
                        {:else if isOccultistObj(actorObj) && actorMenu === OCCULTIST_MENU_NAME}
                            <OccultistMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" occultist={actor as Occultist} obj={actorObj} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} />
                        {:else if isGuardObj(actorObj) && actorMenu === GUARD_MENU_NAME}
                            <GuardMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" guard={actor as Guard} obj={actorObj} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} />
                        {:else if isHereticObj(actorObj) && actorMenu === HERETIC_MENU_NAME}
                            <HereticMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} onchange={swapActor} />
                        {:else if isMachineObj(actorObj) && actorMenu === MACHINE_MENU_NAME}
                            <MachineMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} onchange={swapActor} />
                        {:else if isBishopObj(actorObj) && actorMenu === BISHOP_MENU_NAME}
                            <BishopMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} onchange={swapActor} />
                        {:else if isTOWW_Obj(actorObj) && actorMenu === TOWW_MENU_NAME}
                            <TOWW_Menus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} onchange={swapActor} />
                        {:else if isMiniBossObj(actorObj) && actorMenu === MINI_BOSS_MENU_NAME}
                            <MiniBossMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} onchange={swapActor} />
                        {:else if isWitnessObj(actorObj) && actorMenu === WITNESS_MENU_NAME}
                            <WitnessMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" witness={actor as Witness} obj={actorObj} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} />
                        {:else if isKnucklebonesPlayerObj(actorObj) && actorMenu === KNUCKLEBONES_PLAYER_MENU_NAME}
                            <KnucklebonesPlayerMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={actorIdx >= 0 && showActorMenu && !isRiverBoyObituaryVisible} onupdate={updateSceneFromChanges} onchange={swapActor} />
                        {/if}
                    {/if}
                </div>
            {:else if categoryIdx === 1}
                <Header title="Export Options" />

                <div class="flex flex-col gap-12">
                    <SizeOptions bind:size bind:lockAspectRatio bind:fitScene bind:cropScene oninput={({ fitScene, cropScene }) => fitScene || cropScene ? setCroppedScene() : setSceneSize()} />
                    <TimingOptions bind:duration bind:trimLongest oninput={({ trimLongest }) => trimLongest && (duration = MoreMath.round(Math.max(...scene.actors.map(({ duration }) => duration), 0), 2))} />
                </div>

                <div class="flex flex-col gap-6 items-center mx-8">
                    <LabelTitle title="Format" />

                    <div class="flex flex-col gap-8 w-80 sm:w-90">
                        <Label label="Format">
                            <ArrowSelection class="ml-6" options={[...FORMAT_IDS].map((format) => format.toUpperCase())} i={FORMAT_IDS.indexOf(exportFormat)} label="Format" oninput={(_, i) => exportFormat = FORMAT_IDS[i]} />
                        </Label>
                        
                        <FormatOptions bind:format={exportFormat} data={exportData[exportFormat]}  />
                    </div>
                </div>

                <div class="flex flex-col gap-4 items-center mx-8">
                    <LabelTitle title="Name" />
                    <BannerButton label="Export Name" bind:value={exportName} editable />
                </div>

                {#if useExperimentalAnimations}
                    <Notice label="Audio from Experimental Animations are not supported at the moment." />
                {/if}

                <BannerButton class="mt-2" label={exportProgress < 0 ? "Export Scene" : "Exporting..."} disabled={exportProgress >= 0} onclick={exportScene} />
                
                {#if exportProgress >= 0}
                    <Label class="w-80 sm:w-90" label={exportText}>
                        <ProgressRing progress={exportProgress} label={exportText} />
                    </Label>
                {/if}
            {:else if categoryIdx === 2}
                <News {news} {fullyLoadedFolders} onloadmore={loadMoreNews} />
            {:else if categoryIdx === 3}
                <CreationDetails {lastUpdatedUnix} bind:hasNoticedTutorial />

                <div class="flex flex-col gap-2">
                    <Header title="Pet Narinder" />

                    <LabelTitle class="mb-2" title="Pets Today: {numOfPets}" />
                    <NarinderPetter bind:hasPetNarinder onclick={petNarinder} />

                    <LabelTitle title="Click them to pet Narinder." />
                </div>

                <SpecialThanks />
            {/if}
        </div>

        <CloudShaders bind:disabled={isFullScreen} />
    </div>

    <div class="not-lg:hidden flex fixed bottom-0 left-0 z-90 flex-row gap-8 p-6 pt-4 max-w-160 bg-black">
        <NavTip key="E" code="KeyE" label="Accept" />
        
        {#if categoryIdx === 0 && actorIdx >= 0}
            <NavTip key="F" code="KeyF" label="Back" />
        {/if}
    </div>
    
    {#if isRiverBoyObituaryVisible}
        <div class="grid fixed top-0 left-0 z-100 place-items-center w-full h-full bg-[#00000060] {showRiverBoyObituary ? "opacity-100" : "opacity-0"} transition-opacity duration-450 select-none" ontransitionend={() => isRiverBoyObituaryVisible = showRiverBoyObituary}>
            <Dialog childClass="mt-2" title="RIP. River Boy" description="It is with great sorrow to announce that Narayana Johnson (aka. River Boy) has tragically passed away in the early hours of 2nd April 2025. He was the audio director of Cult of the Lamb and the composer of the beloved soundtracks that many of us have grown fond of. I, as well as the rest of the C.O.T.L community are deeply saddened by his passing. Rest in peace and farewell, River Boy.">
                <div class="flex flex-col justify-center items-center gap-2">
                    <img src="/static/assets/misc/rip-river-boy.png" alt="RIP. River Boy" class="w-17 h-13.5 sm:w-23 sm:h-18" width={69 + 23 * +isOnPhone} height={54 + 19 * +isOnPhone} draggable="false" role="presentation" aria-hidden="true" />
                    
                    <List class="flex flex-row justify-center items-center scale-60 sm:scale-80" label="River Boy Obituary Disclaimer Options" enableKeyInput focusFirst>
                        <BannerButton label="View Official Post" href="https://www.reddit.com/r/CultOfTheLamb/comments/1jqu0uv/a_heartbreaking_update_from_our_development_team" />
                        <BannerButton label="Close" onclick={closeRiverBoyObituary} />
                    </List>
                </div>
            </Dialog>
        </div>
    {/if}
{/if}

<style>
    :global(.no-scrollbar) { scrollbar-width: none; }
    :global(.no-scrollbar::-webkit-scrollbar) { display: none; }

    @media not (prefers-reduced-motion) {
        :global(.fade) {
            animation: fade;
            animation-duration: 75ms;
            animation-timing-function: cubic-bezier(0.455, 0.03, 0.515, 0.955);
            animation-iteration-count: 2;
            animation-direction: alternate;
        }
    }

    @keyframes fade {
        from { filter: opacity(100%); }
        to { filter: opacity(50%); }
    }
</style>