import "./style.css";

import { Scene, Factory } from "@/scripts";
import { ExportManager } from "@/scripts/managers";

import { clothingData, followerMetadata, hatData, necklaceData } from "@/data";
import { CLOTHING_IDS, type ClothingId, FOLLOWER_IDS, HATS_ID, NECKLACE_IDS, PLAYER_CREATURE_IDS, PLAYER_FLEECE_IDS } from "@/data/types";

import { Color, type ColorObject } from "@/utils";

const WIDTH: number = 64;
const HEIGHT: number = 64;

const EXPOSED_BODY_CLOTHING: ClothingId[] = ["Naked_Clothing", "DLC_6"];
const BODY_COLOR: ColorObject = {
    r: 169,
    g: 130,
    b: 75
};

const BODY_SLOTS: string[] = ["BODY_NAKED"];

const canvas = document.querySelector<HTMLCanvasElement>("canvas#display")!;
canvas.style.width = `${WIDTH}px`;
canvas.style.height = `${HEIGHT}px`;

const gl = canvas.getContext("webgl");
if (!gl) throw new Error("Unable to retrieve context from canvas");

const scene = new Scene(gl);
const factory = await Factory.create(gl, "assets");

await factory.loadAll();

const follower = await factory.follower("Deer", "Default_Clothing");
follower.hidden = true;

const player = await factory.player("Lamb", "Lamb");
player.hidden = true;

scene.addActors(follower, player);

const followerExporter = document.querySelector<HTMLButtonElement>("button#export-followers")!;
followerExporter.addEventListener("click", () => {
    follower.hidden = false;
    player.hidden = true;

    follower.form = "Deer";
    follower.formVariantIdx = 0;
    
    follower.clothing = "Default_Clothing";
    follower.clothingVariantIdx = 0;

    follower.setAnimation("Avatars/avatar-normal");
    follower.pos.set(0);

    scene.resetCamera();
    scene.scale *= 0.92;

    follower.pos.set(2, 24);
    
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
    follower.hidden = false;
    player.hidden = true;

    follower.form = "Deer";
    follower.formVariantIdx = 0;
    
    follower.clothing = "Default_Clothing";
    follower.clothingVariantIdx = 0;
    
    follower.setAnimation("outfit");
    follower.pos.set(0);
    
    scene.resetCamera();
    scene.scale *= 0.84;

    follower.pos.set(-10, 48);
    
    const form = new FormData();
    for (const id of CLOTHING_IDS) {
        const { variants, sets = [[]] } = clothingData[id];

        follower.setSkin(variants[0]);
        follower.applyColors(sets[0].concat({
            color: { ...Color.fromObj(BODY_COLOR).normalize(), a: +EXPOSED_BODY_CLOTHING.includes(id) },
            slots: BODY_SLOTS
        }));
        
        appendPixelsToForm(form, id);
    }

    sendForm(form, "/clothing");
});

const variantExporter = document.querySelector<HTMLButtonElement>("button#export-variants")!;
variantExporter.addEventListener("click", () => {
    follower.hidden = false;
    player.hidden = true;

    follower.form = "Deer";
    follower.formVariantIdx = 0;
    
    follower.clothing = "Default_Clothing";
    follower.clothingVariantIdx = 0;

    follower.setAnimation("Avatars/avatar-normal");
    follower.pos.set(0);

    scene.resetCamera();
    scene.scale *= 0.92;

    follower.pos.set(2, 24);
    
    const form = new FormData();
    for (const id of FOLLOWER_IDS) {
        follower.form = id;
        for (const i of Array(followerMetadata[id].variants.length).keys()) {
            follower.formVariantIdx = i;
            follower.reset();

            appendPixelsToForm(form, `${id}-${i}`);
        }
    }

    follower.form = "Deer";
    follower.formVariantIdx = 0;
    
    follower.clothing = "Default_Clothing";
    follower.clothingVariantIdx = 0;

    follower.setAnimation("outfit");
    follower.pos.set(0);

    scene.resetCamera();
    scene.scale *= 0.84;

    follower.pos.setY(-32);
    
    for (const id of CLOTHING_IDS) {
        follower.clothing = id;
        for (const i of Array(clothingData[id].variants.length).keys()) {
            const { variants, sets = [[]] } = clothingData[id];
            
            follower.setSkin(variants[i]);
            follower.applyColors(sets[0].concat({
                color: { ...Color.fromObj(BODY_COLOR).normalize(), a: +EXPOSED_BODY_CLOTHING.includes(id) },
                slots: BODY_SLOTS
            }));

            appendPixelsToForm(form, `${id}-${i}`);
        }
    }

    sendForm(form, "/variants");
});

const necklaceExporter = document.querySelector<HTMLButtonElement>("button#export-necklaces")!;
necklaceExporter.addEventListener("click", () => {
    follower.hidden = false;
    player.hidden = true;

    follower.form = "Deer";
    follower.formVariantIdx = 0;
    
    follower.clothing = "Default_Clothing";
    follower.clothingVariantIdx = 0;

    follower.setAnimation("outfit");
    follower.pos.set(0);

    scene.resetCamera();
    scene.scale *= 0.54;

    follower.pos.set(-4, 32);
    
    const form = new FormData();
    for (const id of NECKLACE_IDS) {
        const { variant } = necklaceData[id];
        follower.setSkin(variant);

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/necklaces");
});

const hatExporter = document.querySelector<HTMLButtonElement>("button#export-hats")!;
hatExporter.addEventListener("click", () => {
    follower.hidden = false;
    player.hidden = true;

    follower.form = "Deer";
    follower.formVariantIdx = 0;
    
    follower.clothing = "Default_Clothing";
    follower.clothingVariantIdx = 0;

    follower.setAnimation("outfit");
    follower.pos.set(0);

    scene.resetCamera();
    scene.scale *= 0.9;

    follower.pos.set(2, -88);
    
    const form = new FormData();
    for (const id of HATS_ID) {
        const { variant } = hatData[id];
        follower.setSkin(variant);

        appendPixelsToForm(form, id);
    }

    sendForm(form, "/hats");
});

const playerExporter = document.querySelector<HTMLButtonElement>("button#export-player")!;
playerExporter.addEventListener("click", () => {
    player.hidden = false;
    follower.hidden = true;

    player.creature = "Lamb";
    player.fleece = "Lamb";
    
    player.setAnimation("testing");
    player.pos.set(0);

    scene.resetCamera();
    scene.scale *= 0.8;
    
    player.pos.setY(36);
    
    const form = new FormData();
    for (const id of PLAYER_CREATURE_IDS) {
        player.setSkin(id === "Lamb" ? "JustHead" : "Goat_JustHead");
        appendPixelsToForm(form, `0-${id}`);
    }

    player.creature = "Lamb";
    player.fleece = "Lamb";
    
    player.pos.set(0);

    scene.resetCamera();
    scene.scale *= 0.6;

    player.pos.setY(64);

    for (const id of PLAYER_FLEECE_IDS) {
        player.fleece = id;
        player.removeSkins("Creature Lamb");

        appendPixelsToForm(form, `1-${id}`);
    }

    sendForm(form, "/player");
});

const appendPixelsToForm = (form: FormData, name: string) => {
    scene.render(0);

    const pixels = ExportManager.exportGLFrame(gl);
    const blob = new Blob([pixels], { type: "application/octet-stream" });

    form.append("files", blob, `${name}.dat`);
}

function sendForm(form: FormData, dest: string) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", dest);
    xhr.send(form);
}

const observer = new ResizeObserver(([canvasEntry]) => {
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

observer.observe(canvas);