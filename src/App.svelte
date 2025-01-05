<script lang="ts">
    import { onDestroy } from "svelte";

    import { BannerButton, Header, NavTip } from "./components/base";
    import { SceneCanvas, Categories, TermsDisclaimer } from "./components/misc";
    
    import { CharacterList, FollowerMenus, FollowerNavigation, PlayerMenus, PlayerNavigation, getRandomFollowerAppearance, getRandomPlayerAppearance, getSpecialFollowerName } from "./components/characters";
    import { Size, Timing } from "./components/exporting";
    import { CreationDetails, SpecialThanks } from "./components/credits";

    import { Actor, Exporter, Factory, Scene, type ActorObject } from "./scripts";
    import { Follower, isFollowerObj, isPlayerObj, Player } from "./scripts/characters";

    import { MoreMath, Random, Vector } from "./utils";
    import type { FollowerMenuNames, PlayerMenuNames } from "./components/characters";
    
    // svelte-ignore non_reactive_update
    let scene: Scene;
    let factory: Factory;

    let exporter: Exporter;
    
    let categoryIdx: number = $state(0);
    let isMobile: boolean = matchMedia("(max-width: 768px)").matches;

    let actors: ActorObject[] | null = $state(null);
    let actorIdx: number = $state(-1);

    let followerMenu: FollowerMenuNames | null = $state(null);
    let playerMenu: PlayerMenuNames | null = $state(null);

    let showActorMenu: boolean = $state(false);

    let actor: Actor | null = $state(null);
    let actorObj: ActorObject | null = $state(null);

    let size = $state(new Vector(640, 360).toObj());

    // svelte-ignore state_referenced_locally
    isMobile && Vector.fromObj(size).swap().cloneObj(size);

    let fitScene: boolean = $state(false);
    let cropScene: boolean = $state(false);

    let duration: number = $state(5);
    let trimLongest: boolean = $state(false);

    function onKeyDown(evt: KeyboardEvent) {
        const { code } = evt;
        if (!["KeyE", "KeyF"].includes(code) || document.activeElement instanceof HTMLInputElement) return;
        
        evt.preventDefault();
        
        if (code === "KeyE") {
            (document.activeElement as HTMLElement).click();
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

    window.addEventListener("keydown", onKeyDown);
    onDestroy(() => {
        window.removeEventListener("keydown", onKeyDown);
        exporter?.dispose();
    });

    async function init(initScene: Scene, initFactory: Factory) {
        scene = initScene;
        scene.size.copyObj(size);

        factory = initFactory;

        exporter = await Exporter.create();
        
        const deer = await factory.follower("Deer", "Default_Clothing");
        deer.setAnimation("idle");

        deer.label = "Deer";
        deer.pos.setX(-180);
        deer.flipX = true;

        const lamb = await factory.player("Lamb", "Lamb");
        lamb.setAnimation("idle");

        lamb.label = "Lamb";
        lamb.pos.setX(180);

        scene.addActors(deer, lamb);

        scene.resetCamera();
        scene.scale *= 1.5;

        actors = scene.actors.map((actor) => actor.toObj());
    }

    async function addActor(actor: typeof Actor) {
        let addedActor: Actor;
        switch (actor.name) {
            case Follower.name: {
                const [form, formVariantIdx, formColorSetIdx] = getRandomFollowerAppearance();

                const follower = await factory.follower(form, "Default_Clothing", Random.id(), getSpecialFollowerName(form, formVariantIdx));
                follower.setAnimation("idle");

                follower.formVariantIdx = formVariantIdx;
                follower.formColorSetIdx = formColorSetIdx;

                addedActor = follower;
                break;
            }

            case Player.name: {
                const [creature, fleece] = getRandomPlayerAppearance();

                const player = await factory.player(creature, fleece, Random.id(), "Lamb");
                player.setAnimation("idle");

                addedActor = player;
                break;
            }

            default: return
        }

        scene.addActors(addedActor);
        actors = scene.actors.map((actor) => actor.toObj());

        selectActor((actors?.length ?? 0) - 1);
    }

    function removeActor() {
        scene.removeActors(actor!);
        actors?.splice(actorIdx, 1);

        actorIdx = -1;
    }
    
    function selectActor(i: number) {
        actorIdx = i;

        actor = scene.actors[actorIdx] ?? null;
        actorObj = actors?.[i] ?? null;
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

    async function exportScene() {
        const sceneObj = scene.toObj();
        const buffer = await exporter.exportScene(sceneObj, duration, Vector.fromObj(size));

        const blob = new Blob([buffer], { type: "image/gif" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "cultivis-export.gif";

        link.click();
    }

    function setCroppedScene() {
        scene.resetCamera();
        if (!cropScene) return;

        Vector.ceil(scene.sceneSize).cloneObj(size);
        scene.size.copyObj(size);

        fitScene = true;
        scene.resetCamera();
    }
</script>

<div class="aspect-square grid lg:order-1 place-items-center px-4 w-full lg:w-[calc(100dvw_-35rem)] h-[calc(100dvh_-_74px)] lg:h-dvh">
    <SceneCanvas disableManipulation={fitScene} manipulationIdx={actorIdx} onshift={manipulateActor} onscroll={manipulateActor} onzoom={manipulateActor} onpinch={manipulateActor} class="inline-block max-h-[calc(100dvh_-_106px)]" style="aspect-ratio: {size.x} / {size.y}; max-width: calc((100dvh - 106px) * {size.x} / {size.y})" onload={init} />
</div>

<div class="lg:w-140 lg:h-dvh bg-black">
    <Categories class="justify-center items-center pt-6 pb-3 w-full lg:w-140 select-none" bind:selectedIdx={categoryIdx} enableKeyInput />
    <div class="no-scrollbar overflow-y-auto flex flex-col {categoryIdx === 1 ? "gap-6" : "gap-12"} items-center px-8 pt-6 pb-4 lg:h-[calc(100dvh_-_146px)] bg-secondary select-none">
        {#if categoryIdx === 0}
            <CharacterList bind:actors enableKeyInput={actorIdx < 0} onadd={addActor} onactorclick={selectActor} />

            <div class={["lg:absolute lg:top-0 w-full lg:w-140 lg:h-full bg-black transition-[left,_filter] duration-500", actorIdx < 0 ? "lg:-left-210 lg:brightness-0 lg:ease-in" : "lg:left-0 lg:brightness-100 lg:ease-out", { "not-lg:hidden": actorIdx < 0 }]}>
                {#if actor && actorObj}
                    {#if isFollowerObj(actorObj)}
                        <FollowerNavigation class="no-scrollbar overflow-y-auto lg:pt-12 lg:pb-8 lg:w-140 lg:h-[calc(100%_-_68px)]" follower={actor as Follower} obj={actorObj} enableKeyInput={!showActorMenu} onproceed={selectFollowerMenu} onexit={(doRemoval) => doRemoval ? removeActor() : actorIdx = -1} />
                    {:else if isPlayerObj(actorObj)}
                        <PlayerNavigation class="no-scrollbar overflow-y-auto lg:pt-12 lg:pb-8 lg:w-140 lg:h-full" player={actor as Player} obj={actorObj} enableKeyInput={!showActorMenu} onproceed={selectPlayerMenu} onexit={(doRemoval) => doRemoval ? removeActor() : actorIdx = -1} />
                    {/if}
                {/if}
            </div>

            <div class={["lg:absolute lg:top-0 w-full lg:w-140 lg:h-full bg-black transition-[left,_filter] duration-500", !showActorMenu ? "lg:-left-210 lg:brightness-0 lg:ease-in" : "lg:left-0 lg:brightness-100 lg:ease-out", { "not-lg:hidden": !showActorMenu }]}>
                {#if actor && actorObj}
                    {#if isFollowerObj(actorObj) && followerMenu}
                        <FollowerMenus class="no-scrollbar overflow-y-auto lg:pt-12 lg:pb-8 lg:w-140 lg:h-full" follower={actor as Follower} obj={actorObj} menu={followerMenu} enableKeyInput />
                    {:else if isPlayerObj(actorObj) && playerMenu}
                        <PlayerMenus class="no-scrollbar overflow-y-auto lg:pt-12 lg:pb-8 lg:w-140 lg:h-full" player={actor as Player} obj={actorObj} menu={playerMenu} enableKeyInput />
                    {/if}
                {/if}
            </div>
        {:else if categoryIdx === 1}
            <Header title="Export Options" />

            <div class="flex flex-col gap-12">
                <Size bind:size bind:fitScene bind:cropScene oninput={({ fitScene, cropScene }) => fitScene || cropScene ? setCroppedScene() : scene.size.copyObj(size)} />
                <Timing bind:duration bind:trimLongest oninput={({ trimLongest }) => trimLongest && (duration = MoreMath.round(Math.max(...scene.actors.map(({ duration }) => duration), 0), 2))} />
            </div>
            
            <BannerButton label="Export Scene" onclick={exportScene} />
        {:else if categoryIdx === 2}
            <CreationDetails />
            <SpecialThanks />
        {/if}
    </div>
</div>

<div class="not-lg:hidden flex fixed bottom-0 left-0 flex-row gap-8 p-6 pt-4 w-140 bg-black">
    <NavTip key="E" label="Accept" />
    
    {#if categoryIdx === 0 && actorIdx >= 0}
    <NavTip key="F" label="Back" />
    {/if}
</div>

<TermsDisclaimer />

<style>
    :global(.no-scrollbar) { scrollbar-width: none; }
    :global(.no-scrollbar::-webkit-scrollbar) { display: none; }
</style>