<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { BannerButton, Header, Label, NavTip, ProgressRing } from "./components/base";
    import { SceneCanvas, Categories, TermsDisclaimer } from "./components/misc";
    
    import { CharacterList, FollowerMenus, FollowerNavigation, type FollowerMenuNames, type PlayerMenuNames, PlayerMenus, PlayerNavigation, getRandomFollowerAppearance, getSpecialFollowerName } from "./components/characters";
    import { Size, Timing } from "./components/exporting";

    import { News } from "./components/news";
    import { CreationDetails, SpecialThanks } from "./components/credits";

    import { Actor, Exporter, Factory, Scene, type ActorObject } from "./scripts";
    import { Follower, isFollowerObj, isPlayerObj, TOWW, Player } from "./scripts/characters";
    import { GitManager } from "./scripts/managers";

    import { MoreMath, Random, Vector } from "./utils";

    // svelte-ignore non_reactive_update
    let scene: Scene;
    let factory: Factory;

    let exporter: Exporter;

    // svelte-ignore non_reactive_update
    let gitManager: GitManager;
    
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

    let followerMenu: FollowerMenuNames | null = $state(null);
    let playerMenu: PlayerMenuNames | null = $state(null);

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
    matchMedia("(max-width: 768px)").matches && Vector.fromObj(size).swap().cloneObj(size);

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
        isOnPhone = matchMedia("(max-width: 600px)").matches;
        isMobile = matchMedia("(max-width: 768px)").matches;
    });

    onMount(async () => {
        exporter = await Exporter.create();
        gitManager = await GitManager.create();
        
        termsChangesSummary = await gitManager.getTermsSummary();
        hasAcknowledgedTerms = !termsChangesSummary;

        hasNewNews = await gitManager.loadNews();

        ({ latestTermsDate } = gitManager);
        lastUpdatedDate = await gitManager.getLastUpdatedDate();

        window.addEventListener("keydown", onKeyDown);
        resizer.observe(document.documentElement);
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

        // uncomment this when finished with debugging with bishops: await factory.load(Follower, Player);
        await factory.load(Follower, Player, TOWW);
        
        const deer = factory.follower("Deer", "Default_Clothing");
        deer.label = "Deer";
        deer.setAnimation("idle");

        deer.pos.setX(-180);
        deer.flipX = true;

        const player = factory.player("Lamb", "Lamb");
        player.label = "Lamb";
        player.setAnimation("idle");

        player.pos.setX(180);

        const toww = factory.toww("Mega_Boss");
        toww.label = "The One Who Waits";
        toww.eyeState = 0;

        scene.addActors(toww, deer, player);
        actors = scene.actors.map((actor) => actor.toObj());
        
        scene.resetCamera();
        scene.scale *= 1.5;
    }

    function addActor(actor: typeof Actor, updateActorIdx: boolean = true): Actor | undefined {
        let addedActor: Actor;
        switch (actor.name) {
            case Follower.name: {
                const [form, formVariantIdx, formColorSetIdx] = getRandomFollowerAppearance();

                const follower = factory.follower(form, "Default_Clothing", Random.id(), getSpecialFollowerName(form, formVariantIdx));
                follower.setAnimation("idle");

                follower.formVariantIdx = formVariantIdx;
                follower.formColorSetIdx = formColorSetIdx;

                addedActor = follower;
                break;
            }

            case Player.name: {
                const player = factory.player("Lamb", "Lamb", Random.id(), "Lamb");
                player.setAnimation("idle");

                addedActor = player;
                break;
            }

            default: return
        }
        
        scene.addActors(addedActor);
        actors = scene.actors.map((actor) => actor.toObj());

        updateActorIdx && selectActor((actors?.length ?? 0) - 1);
        return addedActor;
    }

    function removeActor() {
        scene.removeActors(actor!);
        actors?.splice(actorIdx, 1);

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

    function selectFollowerMenu(menu: FollowerMenuNames) {
        followerMenu = menu;
        showActorMenu = true;
    }

    function selectPlayerMenu(menu: PlayerMenuNames) {
        playerMenu = menu;
        showActorMenu = true;
    }

    function hideCharacterMenus() {
        actorIdx = -1;
        showActorMenu = false;
    }

    async function exportScene() {
        if (exportPercent >= 0) return;

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
</script>

<div class="aspect-square grid lg:order-1 place-items-center px-4 w-full lg:w-[calc(100dvw_-40rem)] h-[calc(100dvh_-_74px)] lg:h-dvh">
    <SceneCanvas disableManipulation={fitScene} manipulationIdx={actorIdx} onshift={manipulateActor} onscroll={manipulateActor} onzoom={manipulateActor} onpinch={manipulateActor} class="inline-block max-h-[calc(100dvh_-_106px)]" style="aspect-ratio: {size.x} / {size.y}; max-width: calc((100dvh - 106px) * {size.x} / {size.y})" onload={init} />
</div>

<div class="lg:w-160 lg:h-dvh bg-black">
    <Categories class="justify-center items-center pt-6 pb-3 w-full lg:w-160 select-none" bind:selectedIdx={categoryIdx} bind:hasNewNews enableKeyInput={hasAcknowledgedTerms && (actorIdx < 0 || isMobile)} onclick={hideCharacterMenus} />
    <div class="no-scrollbar lg:overflow-y-auto flex flex-col {categoryIdx === 1 ? "gap-6" : "gap-12"} items-center px-8 pt-6 pb-4 lg:h-[calc(100dvh_-_146px)] bg-secondary select-none">
        {#if categoryIdx === 0}
            <CharacterList bind:actors enableKeyInput={hasAcknowledgedTerms && actorIdx < 0} onadd={addActor} onactorclick={selectActor} />

            <div class={["lg:absolute lg:top-0 w-full lg:w-160 lg:h-full bg-black transition-[left,_filter] motion-reduce:transition-opacity duration-500", actorIdx < 0 ? "lg:-left-210 lg:motion-reduce:left-0 lg:brightness-0 lg:motion-reduce:brightness-100 lg:motion-reduce:opacity-0 lg:ease-in lg:motion-reduce:pointer-events-none" : "lg:left-0 lg:brightness-100 lg:motion-reduce:opacity-100 lg:ease-out", { "not-lg:hidden": actorIdx < 0 }]}>
                {#if actor && actorObj}
                    {#if isFollowerObj(actorObj)}
                        <FollowerNavigation class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" follower={actor as Follower} obj={actorObj} enableKeyInput={hasAcknowledgedTerms && actorIdx >= 0 && !showActorMenu} onupdate={updateSceneFromChanges} onproceed={selectFollowerMenu} onexit={(doRemoval) => doRemoval ? removeActor() : unselectActor()} />
                    {:else if isPlayerObj(actorObj)}
                        <PlayerNavigation class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" player={actor as Player} obj={actorObj} enableKeyInput={hasAcknowledgedTerms && actorIdx >= 0 && !showActorMenu} onupdate={updateSceneFromChanges} onproceed={selectPlayerMenu} onexit={(doRemoval) => doRemoval ? removeActor() : unselectActor()} />
                    {/if}
                {/if}
            </div>

            <div class={["lg:absolute lg:top-0 w-full lg:w-160 lg:h-full bg-black transition-[left,_filter] motion-reduce:transition-opacity duration-500", !showActorMenu ? "lg:-left-210 lg:motion-reduce:left-0 lg:brightness-0 lg:motion-reduce:brightness-100 lg:motion-reduce:opacity-0 lg:ease-in lg:motion-reduce:pointer-events-none" : "lg:left-0 lg:brightness-100 lg:motion-reduce:opacity-100 lg:ease-out", { "not-lg:hidden": !showActorMenu }]}>
                {#if actor && actorObj}
                    {#if isFollowerObj(actorObj) && followerMenu}
                        <FollowerMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" follower={actor as Follower} obj={actorObj} menu={followerMenu} enableKeyInput={hasAcknowledgedTerms && actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} />
                    {:else if isPlayerObj(actorObj) && playerMenu}
                        <PlayerMenus class="no-scrollbar lg:overflow-y-auto lg:pt-12 lg:pb-8 lg:w-160 lg:h-[calc(100%_-_68px)]" player={actor as Player} obj={actorObj} menu={playerMenu} enableKeyInput={hasAcknowledgedTerms && actorIdx >= 0 && showActorMenu} onupdate={updateSceneFromChanges} />
                    {/if}
                {/if}
            </div>
        {:else if categoryIdx === 1}
            <Header title="Export Options" />

            <div class="flex flex-col gap-12">
                <Size bind:size bind:lockAspectRatio bind:fitScene bind:cropScene oninput={({ fitScene, cropScene }) => fitScene || cropScene ? setCroppedScene() : setSceneSize()} />
                <Timing bind:duration bind:trimLongest oninput={({ trimLongest }) => trimLongest && (duration = MoreMath.round(Math.max(...scene.actors.map(({ duration }) => duration), 0), 2))} />
            </div>
            
            <BannerButton label={exportPercent < 0 ? "Export Scene" : "Exporting..."} onclick={exportScene} />
            
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

<div class="not-lg:hidden flex fixed bottom-0 left-0 flex-row gap-8 p-6 pt-4 w-160 bg-black">
    <NavTip key="E" code="KeyE" label="Accept" />
    
    {#if categoryIdx === 0 && actorIdx >= 0}
        <NavTip key="F" code="KeyF" label="Back" />
    {/if}
</div>

<TermsDisclaimer bind:hasAcknowledgedTerms bind:termsChangesSummary bind:latestTermsDate bind:isOnPhone onclick={() => gitManager.updateTermsLocalStorage()} />

<style>
    :global(.no-scrollbar) { scrollbar-width: none; }
    :global(.no-scrollbar::-webkit-scrollbar) { display: none; }
</style>