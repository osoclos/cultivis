<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { BannerButton, Header, Label, NavTip, ProgressRing } from "./components/base";
    import { SceneCanvas, Categories, TermsDisclaimer } from "./components/misc";
    
    import { CharacterList, FollowerMenus, PlayerMenus, getRandomFollowerAppearance, getSpecialFollowerName, CharacterNavigation, isStrFollowerMenuName, isStrPlayerMenuName, BishopMenus, BISHOP_MENU_NAME, TOWW_MENU_NAME, TOWW_Menus } from "./components/characters";
    import { Size, Timing } from "./components/exporting";

    import { News } from "./components/news";
    import { CreationDetails, SpecialThanks } from "./components/credits";

    import { Actor, Exporter, Factory, Scene, type ActorObject } from "./scripts";
    import { Follower, isFollowerObj, isPlayerObj, TOWW, Player, Bishop, isBishopObj, isTOWW_Obj } from "./scripts/characters";
    import { GitManager } from "./scripts/managers";

    import { bishopData } from "./data";
    import { BISHOP_IDS } from "./data/types";

    import { MoreMath, Random, Vector } from "./utils";

    let scene: Scene = $state(Scene.prototype);
    let factory: Factory = $state(Factory.prototype);

    let exporter: Exporter;
    let gitManager: GitManager = $state(GitManager.prototype);
    
    let categoryIdx: number = $state(0);

    let isOnPhone: boolean = $state(false);
    let isMobile: boolean = $state(false);

    let hasAcknowledgedTerms: boolean = $state(!!localStorage.getItem(GitManager.TERMS_LOCAL_STORAGE_NAME));
    let hasNewNews: boolean = $state(false);

    let termsChangesSummary: string = $state("");

    let latestTermsDate: string = $state("");
    let lastUpdatedDate: string = $state("");

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

    let exportPercent: number = $state(-1);

    // svelte-ignore state_referenced_locally
    matchMedia("(max-width: 64rem)").matches && Vector.fromObj(size).swap().cloneObj(size);

    function onKeyDown(evt: KeyboardEvent) {
        const { code } = evt;
        if (!["KeyE", "KeyF"].includes(code) || document.activeElement instanceof HTMLInputElement) return;
        
        evt.preventDefault();
        
        if (code === "KeyE") {
            const element = document.activeElement as HTMLElement;
            element.click();
            element.blur();

            return;
        }
        
        if (showActorMenu) {
            showActorMenu = false;
            return;
        }
        
        if (actorIdx >= 0) {
            actorIdx = -1;
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

        exporter = await Exporter.create();
        gitManager = new GitManager();
        
        termsChangesSummary = await gitManager.getTermsSummary();
        hasAcknowledgedTerms = !termsChangesSummary;

        hasNewNews = await gitManager.loadNews();

        ({ latestTermsDate } = gitManager);
        lastUpdatedDate = await gitManager.getLastUpdatedDate();
    });

    onDestroy(() => {
        window.removeEventListener("keydown", onKeyDown);
        resizer.disconnect();

        exporter?.dispose();
    });

    async function init(initScene: Scene, initFactory: Factory) {
        scene = initScene;
        scene.size.copyObj(size);

        factory = initFactory;
        await factory.load(Follower, Player);
        
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
    }

    async function addActor(actor: typeof Actor, updateActorIdx: boolean = true) {
        loadingActor = actor;
        let addedActor: Actor;

        switch (actor) {
            case Follower: {
                const [form, formVariantIdx, formColorSetIdx] = getRandomFollowerAppearance();

                const follower = factory.follower(form, "Default_Clothing", Random.id(), getSpecialFollowerName(form, formVariantIdx));
                follower.setAnimation("idle");

                follower.formVariantIdx = formVariantIdx;
                follower.formColorSetIdx = formColorSetIdx;

                addedActor = follower;
                break;
            }

            case Player: {
                const player = factory.player("Lamb", "Lamb", Random.id(), "Lamb");
                player.setAnimation("idle");

                addedActor = player;
                break;
            }

            case Bishop: {
                const id = Random.item(BISHOP_IDS);
                !factory.hasLoadedBishop(id, false) && await factory.loadBishop(id, false);

                const bishop = factory.bishop(id, false, Random.id(), bishopData[id].name);
                bishop.setAnimation(id === "Jelly" ? "leader/idle" : "idle");

                addedActor = bishop;
                break;
            }

            case TOWW: {
                !factory.hasLoadedTOWW("Bishop") && await factory.loadTOWW("Bishop");

                const toww = factory.toww("Bishop", Random.id(), "The One Who Waits");
                toww.hasCrown = true;
                toww.hasChains = false;

                toww.setAnimation("idle-standing-nochain");

                addedActor = toww;
                break;
            }

            default: return;
        }
        
        scene.addActors(addedActor);
        actors = scene.actors.map((actor) => actor.toObj());

        updateActorIdx && selectActor((actors?.length ?? 0) - 1);
        loadingActor = null;
    }

    function removeActor(actor: Actor, i: number) {
        scene.removeActors(actor);
        actors?.splice(i, 1);

        unselectActor();
        updateSceneFromChanges();
    }
    
    function selectActor(i: number) {
        actorIdx = i;

        actor = scene.actors[actorIdx] ?? null;
        actorObj = actors?.[i] ?? null;
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
        actor = newActor;
    }

    function selectMenu(menu: string) {
        actorMenu = menu;
        showActorMenu = true;
    }

    function hideCharacterMenus() {
        actorIdx = -1;
        showActorMenu = false;
    }

    async function exportScene() {
        const sceneObj = scene.toObj();
        const buffer = await exporter.exportScene(sceneObj, duration, Vector.fromObj(size), (percent) => exportPercent = percent);

        const blob = new Blob([buffer], { type: "image/gif" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "cultivis-export.gif";

        link.click();
        exportPercent = -1;
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

    function acknowledgeTerms() {
        if (!gitManager.latestTermsDate) return;

        hasAcknowledgedTerms = true;
        gitManager.updateTermsLocalStorage();
    }
</script>

<div class="aspect-square grid lg:order-1 place-items-center px-4 w-full lg:w-[calc(100dvw_-40rem)] h-[calc(100dvh_-_74px)] lg:h-dvh">
    <SceneCanvas disableManipulation={fitScene} manipulationIdx={actorIdx} onshift={manipulateActor} onscroll={manipulateActor} onzoom={manipulateActor} onpinch={manipulateActor} class="inline-block max-h-[calc(100dvh_-_106px)]" style="aspect-ratio: {size.x} / {size.y}; max-width: calc((100dvh - 106px) * {size.x} / {size.y})" onload={init} />
</div>

<div class="lg:w-160 lg:h-dvh bg-black">
    <Categories class="justify-center items-center pt-6 pb-3 w-full lg:w-160 select-none" bind:selectedIdx={categoryIdx} bind:hasNewNews enableKeyInput={hasAcknowledgedTerms && (actorIdx < 0 || isMobile)} onclick={hideCharacterMenus} />
    <div class="no-scrollbar lg:overflow-y-auto flex flex-col {categoryIdx === 1 ? "gap-6" : "gap-12"} items-center px-8 pt-6 pb-4 lg:h-[calc(100dvh_-_146px)] bg-secondary select-none">
        {#if categoryIdx === 0}
            <CharacterList bind:actors bind:loadingActor enableKeyInput={hasAcknowledgedTerms && actorIdx < 0} onadd={addActor} onremove={(indexes) => [...indexes].sort((a, b) => b - a).forEach((i) => removeActor(scene.actors[i], i))} onactorclick={selectActor} />

            <div class={["lg:absolute z-100 lg:top-0 w-full lg:w-160 lg:h-full bg-black transition-[left,_filter] motion-reduce:transition-opacity duration-500", actorIdx < 0 ? "lg:-left-210 lg:motion-reduce:left-0 lg:brightness-0 lg:motion-reduce:brightness-100 lg:motion-reduce:opacity-0 lg:ease-in lg:motion-reduce:pointer-events-none" : "lg:left-0 lg:brightness-100 lg:motion-reduce:opacity-100 lg:ease-out", { "not-lg:hidden": actorIdx < 0 }]}>
                {#if actor && actorObj}
                    <CharacterNavigation class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" {actor} obj={actorObj} {factory} enableKeyInput={hasAcknowledgedTerms && actorIdx >= 0 && !showActorMenu} onupdate={updateSceneFromChanges} onproceed={selectMenu} onexit={(doRemoval) => doRemoval ? removeActor(actor!, actorIdx) : unselectActor()} onchange={swapActor} />
                {/if}
            </div>

            <div class={["lg:absolute z-100 lg:top-0 w-full lg:w-160 lg:h-full bg-black transition-[left,_filter] motion-reduce:transition-opacity duration-500", !showActorMenu ? "lg:-left-210 lg:motion-reduce:left-0 lg:brightness-0 lg:motion-reduce:brightness-100 lg:motion-reduce:opacity-0 lg:ease-in lg:motion-reduce:pointer-events-none" : "lg:left-0 lg:brightness-100 lg:motion-reduce:opacity-100 lg:ease-out", { "not-lg:hidden": !showActorMenu }]}>
                {#if actor && actorObj && actorMenu}
                    {#if isFollowerObj(actorObj) && isStrFollowerMenuName(actorMenu)}
                        <FollowerMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" follower={actor as Follower} obj={actorObj} menu={actorMenu} enableKeyInput={hasAcknowledgedTerms && actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} />
                    {:else if isPlayerObj(actorObj) && isStrPlayerMenuName(actorMenu)}
                        <PlayerMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" player={actor as Player} obj={actorObj} menu={actorMenu} enableKeyInput={hasAcknowledgedTerms && actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} />
                    {:else if isBishopObj(actorObj) && actorMenu === BISHOP_MENU_NAME}
                        <BishopMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={hasAcknowledgedTerms && actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} onchange={swapActor} />
                    {:else if isTOWW_Obj(actorObj) && actorMenu === TOWW_MENU_NAME}
                        <TOWW_Menus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" obj={actorObj} {factory} enableKeyInput={hasAcknowledgedTerms && actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} onchange={swapActor} />
                    {/if}
                {/if}
            </div>
        {:else if categoryIdx === 1}
            <Header title="Export Options" />

            <div class="flex flex-col gap-12">
                <Size bind:size bind:lockAspectRatio bind:fitScene bind:cropScene oninput={({ fitScene, cropScene }) => fitScene || cropScene ? setCroppedScene() : setSceneSize()} />
                <Timing bind:duration bind:trimLongest oninput={({ trimLongest }) => trimLongest && (duration = MoreMath.round(Math.max(...scene.actors.map(({ duration }) => duration), 0), 2))} />
            </div>
            
            <BannerButton label={exportPercent < 0 ? "Export Scene" : "Exporting..."} disabled={exportPercent >= 0} onclick={exportScene} />
            
            {#if exportPercent >= 0}
                <Label class="w-80 sm:w-90" label="Export Progress">
                    <ProgressRing percent={exportPercent} label="Export Progress" />
                </Label>
            {/if}
        {:else if gitManager && categoryIdx === 2}
            <News {gitManager} />
        {:else if categoryIdx === 3}
            <CreationDetails bind:lastUpdatedDate />
            <SpecialThanks />
        {/if}
    </div>
</div>

<div class="not-lg:hidden flex fixed bottom-0 left-0 z-100 flex-row gap-8 p-6 pt-4 w-160 bg-black">
    <NavTip key="E" code="KeyE" label="Accept" />
    
    {#if categoryIdx === 0 && actorIdx >= 0}
        <NavTip key="F" code="KeyF" label="Back" />
    {/if}
</div>

<TermsDisclaimer bind:hasAcknowledgedTerms bind:termsChangesSummary bind:latestTermsDate bind:isOnPhone onclick={acknowledgeTerms} />

<style>
    :global(.no-scrollbar) { scrollbar-width: none; }
    :global(.no-scrollbar::-webkit-scrollbar) { display: none; }
</style>