import "./style.css";

import { Scene, Factory, Exporter, Actor } from "@/scripts";

import { followerData, miniBossData, playerData, towwData } from "@/data/files";
import { CLOTHING_IDS, FOLLOWER_IDS, HATS_ID, SOLDIER_IDS, MINI_BOSS_IDS, NECKLACE_IDS, PLAYER_BELL_IDS, PLAYER_CREATURE_IDS, PLAYER_CROWN_IDS, PLAYER_FLEECE_IDS, TOWW_IDS, WITNESS_IDS } from "@/data/types";
import { Player } from "@/scripts/characters";

const WIDTH: number = 64;
const HEIGHT: number = 64;

const canvas = document.querySelector<HTMLCanvasElement>("canvas#display")!;
canvas.style.width = `${WIDTH}px`;
canvas.style.height = `${HEIGHT}px`;

const gl = canvas.getContext("webgl");
if (!gl) throw new Error("Unable to retrieve context from canvas");

const scene = new Scene(gl);

const factory = await Factory.create(gl, "assets");
await factory.loadAll();

const exporter = await Exporter.create(scene, factory);

const message = document.querySelector<HTMLHeadingElement>("h1#message")!;
message.textContent = "Ready!";

const followerExporter = document.querySelector<HTMLButtonElement>("button#export-followers")!;
followerExporter.addEventListener("click", () => {
    const follower = factory.follower("Deer", "Default_Clothing");
    follower.setAnimation("Avatars/avatar-normal");

    setupScene(follower);
    scene.scale *= 0.92;

    follower.pos.set(2, -8);
    
    const form = new FormData();
    for (const id of FOLLOWER_IDS) {
        follower.form = id;
        follower.reset();

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/followers");
});

const clothingExporter = document.querySelector<HTMLButtonElement>("button#export-clothing")!;
clothingExporter.addEventListener("click", () => {
    const follower = factory.follower("Deer", "Default_Clothing");
    follower.setAnimation("outfit");

    setupScene(follower);
    scene.scale *= 0.84;

    follower.pos.set(-10, 48);
    
    const form = new FormData();
    for (const id of CLOTHING_IDS) {
        const {
            variants: [variant],
            sets: [set] = [[]]
        } = followerData.clothing[id];

        if ("attachments" in followerData.clothing[id]) {
            const clothingSkin = new spine.Skin("Clothing");
            
            follower.skeleton.data.findSkin(variant).getAttachments().filter(({ name }) => followerData.clothing[id].attachments!.some((str) => name.includes(str))).forEach(({ name, attachment, slotIndex }) => clothingSkin.setAttachment(slotIndex, name, attachment));
            follower.addCustomSkin(clothingSkin);
        } else follower.setSkin(variant);

        follower.applyColors(set);
        
        appendPixelsToForm(form, id);
    }

    sendForm(form, "/clothing");
});

const variantExporter = document.querySelector<HTMLButtonElement>("button#export-variants")!;
variantExporter.addEventListener("click", () => {
    let follower = factory.follower("Deer", "Default_Clothing");
    follower.setAnimation("Avatars/avatar-normal");

    setupScene(follower);
    scene.scale *= 0.92;

    follower.pos.set(2, -8);
    
    const form = new FormData();
    for (const id of FOLLOWER_IDS) {
        follower.form = id;
        for (const i of Array(followerData.forms[id].variants.length).keys()) {
            follower.formVariantIdx = i;
            follower.reset();

            appendPixelsToForm(form, `${id}-${i}`);
        }
    }

    follower = factory.follower("Deer", "Default_Clothing");
    follower.setAnimation("outfit");

    setupScene(follower);
    scene.scale *= 0.84;

    follower.pos.set(-10, 48);
    
    for (const id of CLOTHING_IDS) {
        const { variants, sets: [set] = [[]] } = followerData.clothing[id];

        for (const [i, variant] of variants.entries()) {
            if ("attachments" in followerData.clothing[id]) {
                const clothingSkin = new spine.Skin("Clothing");
                
                follower.skeleton.data.findSkin(variant).getAttachments().filter(({ name }) => followerData.clothing[id].attachments!.some((str) => name.includes(str))).forEach(({ name, attachment, slotIndex }) => clothingSkin.setAttachment(slotIndex, name, attachment));
                follower.addCustomSkin(clothingSkin);
            } else follower.setSkin(variant);
            
            follower.applyColors(set);

            appendPixelsToForm(form, `${id}-${i}`);
        }
    }

    sendForm(form, "/variants");
});

const necklaceExporter = document.querySelector<HTMLButtonElement>("button#export-necklaces")!;
necklaceExporter.addEventListener("click", () => {
    const follower = factory.follower("Deer", "Default_Clothing");
    follower.setAnimation("outfit");

    setupScene(follower);
    scene.scale *= 0.54;

    follower.pos.set(-4, 32);
    
    const form = new FormData();
    for (const id of NECKLACE_IDS) {
        const { variant } = followerData.necklaces[id];
        follower.setSkin(variant);

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/necklaces");
});

const hatExporter = document.querySelector<HTMLButtonElement>("button#export-hats")!;
hatExporter.addEventListener("click", () => {
    const follower = factory.follower("Deer", "Default_Clothing");
    follower.setAnimation("outfit");

    setupScene(follower);
    scene.scale *= 0.9;

    follower.pos.set(2, -88);
    
    const form = new FormData();
    for (const id of HATS_ID) {
        const { variant } = followerData.hats[id];
        follower.setSkin(variant);

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/hats");
});

const playerExporter = document.querySelector<HTMLButtonElement>("button#export-player")!;
playerExporter.addEventListener("click", () => {
    let player = factory.player("Lamb", "Lamb");
    player.setAnimation("testing");

    player.crown = null;
    player.bell = null;

    setupScene(player);
    scene.scale *= 0.9;
    
    player.pos.set(4, 32);
    
    const form = new FormData();
    for (const id of PLAYER_CREATURE_IDS) {
        const skin = new spine.Skin(Player.CREATURE_SKIN_NAME);
        skin.copySkin(player.skeleton.data.findSkin(id === "Lamb" ? "JustHead" : "Goat_JustHead"));

        skin.getAttachments().filter(({ name }) => name.includes(Player.CROWN_ATTACHMENT_NAME)).forEach(({ name, slotIndex }) => skin.removeAttachment(slotIndex, name));
        
        player.setCustomSkin(skin);
        appendPixelsToForm(form, `0-${id}`);
    }

    player = factory.player("Lamb", "Lamb");
    player.setAnimation("testing");

    player.crown = null;
    player.bell = null;

    setupScene(player);
    scene.scale *= 0.54;

    player.pos.set(8, -120);

    for (const id of PLAYER_CROWN_IDS) {
        const skin = new spine.Skin(Player.CROWN_SKIN_NAME);

        player.skeleton.data.findSkin(playerData.crowns[id].variant).getAttachments().filter(({ name }) => name.includes(Player.CROWN_ATTACHMENT_NAME)).forEach(({ name, attachment, slotIndex }) => skin.setAttachment(slotIndex, name, attachment));
        if ("addonVariant" in playerData.crowns[id]) player.skeleton.data.findSkin(playerData.crowns[id].addonVariant!).getAttachments().filter(({ name }) => name.includes(Player.CROWN_EYE_ATTACHMENT_NAME)).forEach(({ name, attachment, slotIndex }) => skin.setAttachment(slotIndex, name, attachment));
        
        player.setCustomSkin(skin);
        appendPixelsToForm(form, `1-${id}`);
    }

    sendForm(form, "/player");
});

const fleeceExporter = document.querySelector<HTMLButtonElement>("button#export-fleeces")!;
fleeceExporter.addEventListener("click", () => {
    const player = factory.player("Lamb", "Lamb");
    player.setAnimation("testing");

    player.crown = null;
    player.bell = null;

    setupScene(player);
    scene.scale *= 0.64;

    player.pos.set(4, 48);
    
    const form = new FormData();
    for (const id of PLAYER_FLEECE_IDS) {
        player.fleece = id;
        player.removeSkins(Player.CREATURE_SKIN_NAME);

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/fleeces");
});

const bellExporter = document.querySelector<HTMLButtonElement>("button#export-bells")!;
bellExporter.addEventListener("click", () => {
    const player = factory.player("Lamb", "Lamb");
    player.setAnimation("testing");

    player.crown = null;
    player.bell = null;

    setupScene(player);
    scene.scale *= 0.54;

    player.pos.setY(36);
    
    const form = new FormData();
    for (const id of PLAYER_BELL_IDS) {
        player.bell = id;
        player.removeSkins(Player.CREATURE_SKIN_NAME, Player.FLEECE_SKIN_NAME);

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/bells");
});

const soldierExporter = document.querySelector<HTMLButtonElement>("button#export-soldiers")!;
soldierExporter.addEventListener("click", () => {
    const form = new FormData();

    for (const id of SOLDIER_IDS) {
        const soldier = factory.soldier(id);
        soldier.setAnimation("idle");

        setupScene(soldier);
        
        if (["Swordsman", "Scytheman", "Toxophilite"].includes(id)) {
            scene.scale *= 0.9 - 0.1 * +(id === "Scytheman");
            soldier.pos.set(0, -10 - 20 * +(id === "Scytheman"));
        }

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/soldiers");
});

const towwExporter = document.querySelector<HTMLButtonElement>("button#export-toww")!;
towwExporter.addEventListener("click", () => {
    const form = new FormData();

    for (const id of TOWW_IDS) {
        const toww = factory.TOWW(id);
        
        const { attributes, animation } = towwData[id];
        toww.setAnimation(animation);

        const {
            hasCrown = null,
            hasChains = null,
            
            eyeState = null,
            isInjured = null
        } = attributes;
        
        toww.hasCrown = hasCrown;
        toww.hasChains = hasChains;

        toww.eyeState = eyeState;
        toww.isInjured = isInjured;

        setupScene(toww);
        if (id === "Mega_Boss") {
            scene.scale *= 0.5;
            toww.pos.set(0, -180);
        }

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/toww");
});

const miniBossExporter = document.querySelector<HTMLButtonElement>("button#export-mini-bosses")!;
miniBossExporter.addEventListener("click", () => {
    const form = new FormData();

    for (const id of MINI_BOSS_IDS) {
        const boss = factory.miniBoss(id);

        const { animation } = miniBossData[id];
        boss.setAnimation(animation);

        setupScene(boss);
        if (["Flying Burp Frog", "Spiker", "Charger", "Scuttle Turret", "Millipede Poisoner"].includes(id)) {
            const isEligos = id === "Flying Burp Frog";
            const isVephar = id === "Millipede Poisoner";

            scene.scale *= 0.8 - 0.2 * +isEligos;
            !isEligos && boss.pos.set(0 + 16 * +isVephar, -60 + 40 * +isVephar);
        }

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/mini-bosses");
});

const witnessExporter = document.querySelector<HTMLButtonElement>("button#export-witnesses")!;
witnessExporter.addEventListener("click", () => {
    const form = new FormData();

    for (const id of WITNESS_IDS) {
        const witness = factory.witness(id);
        witness.setAnimation("animation");

        setupScene(witness);
        
        scene.scale *= 0.9;
        witness.pos.set(0, -40);

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/witnesses");
});

function setupScene(actor: Actor) {
    scene.removeActors(...scene.actors);
    scene.addActors(actor);
    
    scene.resetCamera();
}

const appendPixelsToForm = (form: FormData, name: string) => {
    scene.render(0);

    const pixels = exporter.getPixels(0, 0, WIDTH, HEIGHT, false);
    const blob = new Blob([pixels], { type: "application/octet-stream" });

    form.append("files", blob, `${name}.dat`);
}

function sendForm(form: FormData, dest: string) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", dest);
    xhr.send(form);
}

const resizer = new ResizeObserver(([canvasEntry]) => {
    const {
        inlineSize: resizeWidth,
        blockSize: resizeHeight
    } = canvasEntry.contentBoxSize[0];

    const dpr = window.devicePixelRatio;
    canvas.width = resizeWidth * dpr;
    canvas.height = resizeHeight * dpr;

    const { width, height } = canvas;
    scene.renderSize.set(width, height);

    scene.render(0);
});

resizer.observe(canvas);