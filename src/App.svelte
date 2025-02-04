<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { twMerge } from "tailwind-merge";

    import { ArrowSelection, BannerButton, Dialog, Header, Label, LabelTitle, NavTip, Notice, ProgressRing } from "./components/base";
    import { SceneCanvas, Categories, LoadingThrobber, LoadingSymbol } from "./components/misc";
    import { List } from "./components/utils";
    
    import { CharacterList, FollowerMenus, PlayerMenus, getRandomFollowerAppearance, getSpecialFollowerName, CharacterNavigation, isStrFollowerMenuName, isStrPlayerMenuName, BishopMenus, BISHOP_MENU_NAME, TOWW_MENU_NAME, TOWW_Menus, MINI_BOSS_MENU_NAME, MiniBossMenu, WITNESS_MENU_NAME, WitnessMenu } from "./components/characters";
    import { FORMAT_IDS, FormatOptions, SizeOptions, TimingOptions, type FormatData, type FormatId } from "./components/exporting";

    import { News } from "./components/news";
    import { CreationDetails, SpecialThanks, HAS_NOTICED_TUTORIAL_LOCAL_STORAGE_NAME } from "./components/credits";

    import { Actor, Exporter, Factory, Scene, type ActorObject } from "./scripts";
    import { Follower, isFollowerObj, isPlayerObj, TOWW, Player, Bishop, isBishopObj, isTOWW_Obj, MiniBoss, Witness, isMiniBossObj, isWitnessObj } from "./scripts/characters";
    import { soundManager, newsManager, NewsManager } from "./scripts/managers";

    import { bishopData, miniBossData, towwData, witnessData } from "./data/files";
    import { BISHOP_IDS, MINI_BOSS_IDS, WITNESS_IDS } from "./data/types";

    import { MoreMath, Random, unixToDate, Vector } from "./utils";

    const LOADING_STATES = ["ToSAcknowledgement", "LoadingAssets", "SceneSetup", "FetchingNews"] as const;
    const LOADING_TEXTS: string[] = ["Checking ToS Acknowledgement", "Loading Assets", "Setting Up Scene", "Fetching News"];
    
    const EXPORTING_TEXTS: string[] = ["Rendering Scene", "Encoding Frames", "Downloading Scene"];

    let scene: Scene = $state(Scene.prototype);
    let factory: Factory = $state(Factory.prototype);

    let exporter: Exporter;
    
    let categoryIdx: number = $state(0);
    let categoryMenu: HTMLDivElement = $state(document.createElement("div"));

    let isOnPhone: boolean = $state(false);
    let isMobile: boolean = $state(false);

    let loadingState: number = $state(-1);
    const loadingText: string = $derived(LOADING_TEXTS[MoreMath.clamp(loadingState, 0, LOADING_TEXTS.length - 1)]);

    let hasUserCompliedToTOS: boolean = $state(false);
    const hasFinishedLoading: boolean = $derived(loadingState === LOADING_STATES.length);

    let hasNoticedTutorial: boolean = $state(!!localStorage.getItem(HAS_NOTICED_TUTORIAL_LOCAL_STORAGE_NAME));

    let actors: ActorObject[] | null = $state(null);
    let actorIdx: number = $state(-1);
    let actorMenu: string | null = $state(null);

    let loadingActor: typeof Actor | null = $state(null);
    let showActorMenu: boolean = $state(false);

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
            hasAccurateColors: true
        },

        "apng": {
            type: "apng",
            delay: 1000 / 60
        }
    });
    
    let exportProgress: number = $state(-1);

    let exportState: number = $state(-1);
    const exportText: string = $derived(EXPORTING_TEXTS[MoreMath.clamp(exportState, 0, EXPORTING_TEXTS.length - 1)]);

    // svelte-ignore state_referenced_locally
    matchMedia("(max-width: 64rem)").matches && Vector.fromObj(size).swap().cloneObj(size);

    function onKeyDown(evt: KeyboardEvent) {
        const { code } = evt;
        if (!["KeyE", "KeyF"].includes(code) || document.activeElement instanceof HTMLInputElement) return;
        
        evt.preventDefault();
        
        if (code === "KeyE") {
            const element = document.activeElement as HTMLElement;
            element.click();

            return;
        }
        
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
    }

    const resizer = new ResizeObserver(() => {
        isOnPhone = matchMedia("(max-width: 40rem)").matches;
        isMobile = matchMedia("(max-width: 64rem)").matches;
    });

    onMount(async () => {
        window.addEventListener("keydown", onKeyDown);
        resizer.observe(document.documentElement);

        loadingState = LOADING_STATES.indexOf("ToSAcknowledgement");
        if (await newsManager.areTermsAcknowledged()) hasUserCompliedToTOS = true;
    });

    onDestroy(() => {
        window.removeEventListener("keydown", onKeyDown);
        resizer.disconnect();

        exporter?.dispose();
    });

    async function acknowledgeTerms() {
        localStorage.setItem(NewsManager.OLD_TERMS_LOCAL_STORAGE_NAME, `${await newsManager.getTermsUnix()}`);
        hasUserCompliedToTOS = true;

        if (scene instanceof Scene) await init();
    }

    async function onCanvasLoad(canvasScene: Scene, canvasFactory: Factory) {
        scene = canvasScene;
        scene.size.copyObj(size);

        factory = canvasFactory;
        await init();
    }

    async function init() {
        loadingState = LOADING_STATES.indexOf("LoadingAssets");

        await factory.load(Follower, Player);
        exporter = await Exporter.create();

        loadingState = LOADING_STATES.indexOf("SceneSetup");
    
        const deer = factory.follower("Deer", "Default_Clothing");
        deer.label = "Deer";
        deer.setAnimation("idle");

        deer.pos.setX(-180);
        deer.flipX = true;

        const player = factory.player("Lamb", "Lamb");
        player.label = "Lamb";
        player.setAnimation("idle");

        player.pos.setX(180);

        scene.addActors(deer, player);
        actors = scene.actors.map((actor) => actor.toObj());
        
        scene.resetCamera();
        scene.scale *= 1.5;

        await newsManager.getLastUpdatedUnix();
        
        loadingState = LOADING_STATES.indexOf("FetchingNews");
        await newsManager.getNews();

        setTimeout(() => loadingState = LOADING_STATES.length, 400);
    }

    async function addActor(actor: typeof Actor, updateActorIdx: boolean = true) {
        loadingActor = actor;
        let addedActor: Actor;

        switch (actor) {
            case Follower: {
                !factory.hasLoadedFollower && await factory.load(Follower);
                const [form, formVariantIdx, formColorSetIdx] = getRandomFollowerAppearance();

                const follower = factory.follower(form, "Default_Clothing", undefined, getSpecialFollowerName(form, formVariantIdx));
                follower.setAnimation("idle");

                follower.formVariantIdx = formVariantIdx;
                follower.formColorSetIdx = formColorSetIdx;

                addedActor = follower;
                break;
            }

            case Player: {
                !factory.hasLoadedPlayer && await factory.load(Player);

                const player = factory.player("Lamb", "Lamb");
                player.setAnimation("idle");

                addedActor = player;
                break;
            }

            case Bishop: {
                const id = Random.item(BISHOP_IDS);
                !factory.hasLoadedBishop(id, false) && await factory.loadBishop(id, false);

                const { name, animation } = bishopData[id];

                const bishop = factory.bishop(id, false, undefined, name);
                bishop.setAnimation(animation);

                addedActor = bishop;
                break;
            }

            case TOWW: {
                !factory.hasLoadedTOWW("Bishop") && await factory.loadTOWW("Bishop");
                const toww = factory.TOWW("Bishop");
                
                const { attributes, animation } = towwData.Bishop;
                const {
                    hasCrown = null,
                    hasChains = null
                } = attributes;

                toww.hasCrown = hasCrown;
                toww.hasChains = hasChains;

                toww.setAnimation(animation);

                addedActor = toww;
                break;
            }

            case MiniBoss: {
                const id = Random.item(MINI_BOSS_IDS);
                !factory.hasLoadedMiniBoss(id) && await factory.loadMiniBoss(id);

                const { name, animation } = miniBossData[id];

                const boss = factory.miniBoss(id, false, undefined, name);
                boss.setAnimation(animation);

                addedActor = boss;
                break;
            }

            case Witness: {
                !factory.hasLoadedWitness && await factory.load(Witness);
                const id = Random.item(WITNESS_IDS);

                const witness = factory.witness(id, false, undefined, witnessData[id].name);
                witness.setAnimation("animation");

                addedActor = witness;
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
    }

    function removeActor(actor: Actor, i: number) {
        scene.removeActors(actor);
        actors?.splice(i, 1);

        unselectActor();
        updateSceneFromChanges();
    }

    function cloneActor(actor: Actor) {
        const clonedActor = actor.clone();

        const { animation } = actor;
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
    }

    function swapActor(newActor: Actor) {
        scene.replaceActor(actor!, newActor);
        actors = scene.actors.map((actor) => actor.toObj());

        actor = newActor;
        actorObj = actors?.[scene.actors.indexOf(newActor)] ?? null;
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

        const blob = new Blob([buffer], { type: `image/${format}` });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${exportName}.${format}`;

        link.click();

        exportProgress = -1;
        exportState = -1;
    }

    function updateSceneFromChanges() {
        fitScene || cropScene ? setCroppedScene() : setSceneSize();
        trimLongest && (duration = MoreMath.round(Math.max(...scene.actors.map(({ duration }) => duration), 0), 2))
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

        Vector.ceil(scene.sceneSize).cloneObj(size);
        scene.size.copyObj(size);

        fitScene = true;
        scene.resetCamera();
    }
</script>

<div class="grid fixed top-0 left-0 z-100 place-items-center w-full h-full bg-secondary {hasFinishedLoading ? "opacity-0" : "opacity-100"} not-motion-reduce:transition-opacity not-motion-reduce:duration-900 select-none" ontransitionend={({ target }) => (target as HTMLDivElement).classList.replace("grid", "hidden")}>
    <LoadingSymbol {isMobile} />
    <div class="flex absolute {isMobile ? "bottom-4 left-6" : "bottom-10 left-16"} flex-row gap-6 items-center">
        <LoadingThrobber percent={((loadingState + 1) / LOADING_STATES.length) * 100} {isOnPhone} {isMobile} />
        <p class={["text-highlight", isMobile ? "text-lg" : "text-2xl",{ "hidden": loadingState < 0 }]}>{loadingText}... {MoreMath.clamp(loadingState + 1, 1, LOADING_STATES.length)}/{LOADING_STATES.length}</p>
    </div>
</div>

{#if newsManager instanceof NewsManager}
    {#await Promise.all([newsManager.areTermsAcknowledged(), newsManager.getTermsSummary(), newsManager.getTermsUnix()]) then [areTermsAcknowledged, changesSummary, termsUnix]}
        <div class="{areTermsAcknowledged ? "hidden" : "grid"} fixed top-0 left-0 z-100 place-items-center w-full h-full bg-[#00000060] {hasUserCompliedToTOS ? "opacity-0" : "opacity-100"} transition-opacity duration-450 select-none" ontransitionend={({ target }) => (target as HTMLDivElement).classList.replace("grid", "hidden")}>
            <Dialog childClass={twMerge("mt-2 sm:mt-4")} title="Disclaimer" description={localStorage.getItem(NewsManager.OLD_TERMS_LOCAL_STORAGE_NAME) ? `CultiVis has updated its terms of service${termsUnix ? ` on ${unixToDate(termsUnix)}` : ""}. ${changesSummary ? `${changesSummary.slice(0, -changesSummary.endsWith("."))}. ` : ""}You may view the new terms below or close this popup.` : "CultiVis requires you to agree and acknowledge the CultiVis Terms of Service. You may view the terms below or close this popup."}>
                <Notice class="px-8 pb-4 text-sm" label="Closing this popup will mean you agree with the Terms of Service." />
                <List class="flex flex-col justify-center items-center" enableKeyInput focusFirst>
                    <BannerButton label="View Terms" href="https://github.com/osoclos/cultivis/blob/main/ToS.md" />
                    <BannerButton label="Close and Accept" onclick={acknowledgeTerms} />
                </List>
            </Dialog>
        </div>
    {/await}
{/if}

{#if hasUserCompliedToTOS}
    <div class="aspect-square {hasFinishedLoading ? "grid" : "hidden"} lg:order-1 place-items-center px-4 w-full lg:w-[calc(100dvw_-40rem)] h-[calc(100dvh_-_74px)] lg:h-dvh">
        <SceneCanvas class="inline-block max-h-[calc(100dvh_-_106px)]" disableManipulation={fitScene} manipulationIdx={actorIdx} onshift={manipulateActor} onscroll={manipulateActor} onzoom={manipulateActor} onpinch={manipulateActor} style="aspect-ratio: {size.x} / {size.y}; max-width: calc((100dvh - 106px) * {size.x} / {size.y})" onload={onCanvasLoad} />
    </div>

    <div class={["overflow-hidden lg:h-dvh bg-secondary", { "hidden": !hasFinishedLoading }]}>
        <Categories class="justify-center items-center pt-6 pb-3 w-full lg:w-160 select-none" bind:hasNoticedTutorial enableKeyInput={(actorIdx < 0 || isMobile)} onclick={selectCategoryMenu} />
        <div bind:this={categoryMenu} class="no-scrollbar lg:overflow-y-auto flex flex-col {[1, 3].includes(categoryIdx) ? "gap-6" : "gap-12"} items-center px-8 pt-6 pb-4 lg:h-[calc(100dvh_-_146px)] select-none">
            {#if categoryIdx === 0}
                <CharacterList bind:actors bind:loadingActor enableKeyInput={actorIdx < 0} onadd={addActor} onremove={(indexes) => [...indexes].sort((a, b) => b - a).forEach((i) => removeActor(scene.actors[i], i))} onclone={(indexes) => indexes.forEach((i) => cloneActor(scene.actors[i]))} onactorclick={selectActor} />

                <div class={["lg:absolute z-90 lg:top-0 w-full lg:w-160 lg:h-full bg-black transition-[left,_filter] motion-reduce:transition-opacity duration-500", actorIdx < 0 ? "lg:-left-210 lg:motion-reduce:left-0 lg:brightness-0 lg:motion-reduce:brightness-100 lg:motion-reduce:opacity-0 lg:ease-in lg:motion-reduce:pointer-events-none" : "lg:left-0 lg:brightness-100 lg:motion-reduce:opacity-100 lg:ease-out", { "not-lg:hidden": actorIdx < 0 }]}>
                    {#if actor && actorObj}
                        <CharacterNavigation class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" {actor} obj={actorObj} {factory} enableKeyInput={actorIdx >= 0 && !showActorMenu} onupdate={updateSceneFromChanges} onproceed={selectMenu} onexit={exitMenu} onchange={swapActor} />
                    {/if}
                </div>

                <div class={["lg:absolute z-90 lg:top-0 w-full lg:w-160 lg:h-full bg-black transition-[left,_filter] motion-reduce:transition-opacity duration-500", !showActorMenu ? "lg:-left-210 lg:motion-reduce:left-0 lg:brightness-0 lg:motion-reduce:brightness-100 lg:motion-reduce:opacity-0 lg:ease-in lg:motion-reduce:pointer-events-none" : "lg:left-0 lg:brightness-100 lg:motion-reduce:opacity-100 lg:ease-out", { "not-lg:hidden": !showActorMenu }]}>
                    {#if actor && actorObj && actorMenu}
                        {#if isFollowerObj(actorObj) && isStrFollowerMenuName(actorMenu)}
                            <FollowerMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" follower={actor as Follower} obj={actorObj} menu={actorMenu} enableKeyInput={actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} />
                        {:else if isPlayerObj(actorObj) && isStrPlayerMenuName(actorMenu)}
                            <PlayerMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" player={actor as Player} obj={actorObj} menu={actorMenu} enableKeyInput={actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} />
                        {:else if isBishopObj(actorObj) && actorMenu === BISHOP_MENU_NAME}
                            <BishopMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} onchange={swapActor} />
                        {:else if isTOWW_Obj(actorObj) && actorMenu === TOWW_MENU_NAME}
                            <TOWW_Menus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} onchange={swapActor} />
                        {:else if isMiniBossObj(actorObj) && actorMenu === MINI_BOSS_MENU_NAME}
                            <MiniBossMenu class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} onchange={swapActor} />
                        {:else if isWitnessObj(actorObj) && actorMenu === WITNESS_MENU_NAME}
                            <WitnessMenu class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" witness={actor as Witness} obj={actorObj} enableKeyInput={actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} />
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
                            <ArrowSelection class="ml-6" options={[...FORMAT_IDS].map((format) => format.toUpperCase())} label="Format" oninput={(_, i) => exportFormat = FORMAT_IDS[i]} />
                        </Label>
                        
                        <FormatOptions bind:format={exportFormat} data={exportData[exportFormat]}  />
                    </div>
                </div>

                <div class="flex flex-col gap-4 items-center mx-8">
                    <LabelTitle title="Name" />
                    <BannerButton label="Export Name" bind:value={exportName} editable />
                </div>
                
                <BannerButton class="mt-2" label={exportProgress < 0 ? "Export Scene" : "Exporting..."} disabled={exportProgress >= 0} onclick={exportScene} />
                
                {#if exportProgress >= 0}
                    <Label class="w-80 sm:w-90" label={exportText}>
                        <ProgressRing progress={exportProgress} label={exportText} />
                    </Label>
                {/if}
            {:else if categoryIdx === 2}
                <News />
            {:else if categoryIdx === 3}
                <CreationDetails bind:hasNoticedTutorial />
                <SpecialThanks />
            {/if}
        </div>
    </div>
{/if}

<div class="not-lg:hidden flex fixed bottom-0 left-0 z-90 flex-row gap-8 p-6 pt-4 w-160 bg-black">
    <NavTip key="E" code="KeyE" label="Accept" />
    
    {#if categoryIdx === 0 && actorIdx >= 0}
        <NavTip key="F" code="KeyF" label="Back" />
    {/if}
</div>

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