import path from "path";

import express from "express";
import ViteExpress from "vite-express";

import multer from "multer";
import sharp from "sharp";

import { followerData, guardData, hereticData, machineData, miniBossData, playerData } from "../src/data/files";
import { CLOTHING_CATEGORY_LENGTH, CLOTHING_IDS, type ClothingId, FOLLOWER_CATEGORY_LENGTH, FOLLOWER_IDS, type FollowerId, GUARD_CATEGORY_LENGTH, type GuardId, HERETIC_CATEGORY_LENGTH, type HereticId, MACHINE_CATEGORY_LENGTH, type MachineId, MINI_BOSS_CATEGORY_LENGTH, type MiniBossId, NECKLACE_CATEGORY_LENGTH, type NecklaceId, PLAYER_BELL_CATEGORY_LENGTH, PLAYER_FLEECE_CATEGORY_LENGTH, type PlayerBellId, type PlayerFleeceId } from "../src/data/types";

const PORT: number = 3000;
const OUTPUT_DIR: string = path.join(__dirname, "../public/static/assets/characters");

const MIN_TILE_WIDTH: number = 64;
const MIN_TILE_HEIGHT: number = 64;

const MAX_TILE_WIDTH: number = 64;
const MAX_TILE_HEIGHT: number = 64;

const app = express();
const data = multer();

app.get("/spine-webgl.js", (_, res) => res.sendFile(path.join(__dirname, "../lib/spine-ts/build/spine-webgl.js")));
app.use("/assets", express.static(path.join(__dirname, "../public/assets")));

app.post("/followers", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[][] = Array(FOLLOWER_CATEGORY_LENGTH).fill(null).map(() => []);
    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const id = <FollowerId>originalname.replace(".dat", "");
        const { category } = followerData.forms[id];

        buffers[category].push(buffer);
    }

    createSpritesheets(buffers, "followers");
});

app.post("/clothing", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[][] = Array(CLOTHING_CATEGORY_LENGTH).fill(null).map(() => []);
    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const id = <ClothingId>originalname.replace(".dat", "");
        const { category } = followerData.clothing[id];

        buffers[category].push(buffer);
    }

    createSpritesheets(buffers, "clothing");
});

app.post("/variants", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const ids = [...FOLLOWER_IDS, ...CLOTHING_IDS];
    const buffers: Buffer[][] = Array(ids.length).fill(null).map(() => []);

    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const id = <FollowerId>originalname.replace(/-\d+\.dat/, "");
        buffers[ids.indexOf(id)].push(buffer);
    }

    createSpritesheets(buffers, "variants");
});

app.post("/necklaces", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[][] = Array(NECKLACE_CATEGORY_LENGTH).fill(null).map(() => []);
    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const id = <NecklaceId>originalname.replace(".dat", "");
        const { category } = followerData.necklaces[id];

        buffers[category].push(buffer);
    }

    createSpritesheets(buffers, "necklaces");
});

app.post("/hats", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[] = (<Express.Multer.File[]>files).map(({ buffer }) => buffer);
    createSpritesheets([buffers], "hats");
});

app.post("/player", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[][] = Array(2).fill(null).map(() => []);
    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const i = +originalname.replace(/-(?:[^\W\d]|_)+\.dat/, "");
        buffers[i].push(buffer);
    }
    
    createSpritesheets(buffers, "player");
});

app.post("/fleeces", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[][] = Array(PLAYER_FLEECE_CATEGORY_LENGTH).fill(null).map(() => []);
    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const id = <PlayerFleeceId>originalname.replace(".dat", "");
        const { category } = playerData.fleeces[id];

        buffers[category].push(buffer);
    }

    createSpritesheets(buffers, "fleeces");
});

app.post("/bells", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[][] = Array(PLAYER_BELL_CATEGORY_LENGTH).fill(null).map(() => []);
    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const id = <PlayerBellId>originalname.replace(".dat", "");
        const { category } = playerData.bells[id];

        buffers[category].push(buffer);
    }

    createSpritesheets(buffers, "bells");
});

app.post("/soldiers", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[] = (<Express.Multer.File[]>files).map(({ buffer }) => buffer);
    createSpritesheets([buffers], "soldiers");
});

app.post("/occultists", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[] = (<Express.Multer.File[]>files).map(({ buffer }) => buffer);
    createSpritesheets([buffers], "occultists");
});

app.post("/guards", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[][] = Array(GUARD_CATEGORY_LENGTH).fill(null).map(() => []);
    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const id = <GuardId>originalname.replace(".dat", "");
        const { category } = guardData[id];

        buffers[category].push(buffer);
    }

    createSpritesheets(buffers, "guards");
});

app.post("/heretics", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[][] = Array(HERETIC_CATEGORY_LENGTH).fill(null).map(() => []);
    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const id = <HereticId>originalname.replace(".dat", "");
        const { category } = hereticData[id];

        buffers[category].push(buffer);
    }

    createSpritesheets(buffers, "heretics");
});

app.post("/machines", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[][] = Array(MACHINE_CATEGORY_LENGTH).fill(null).map(() => []);
    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const id = <MachineId>originalname.replace(".dat", "");
        const { category } = machineData[id];

        buffers[category].push(buffer);
    }

    createSpritesheets(buffers, "machines");
});

app.post("/toww", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[] = (<Express.Multer.File[]>files).map(({ buffer }) => buffer);
    createSpritesheets([buffers], "toww");
});

app.post("/mini-bosses", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[][] = Array(MINI_BOSS_CATEGORY_LENGTH).fill(null).map(() => []);
    for (const { buffer, originalname } of <Express.Multer.File[]>files) {
        const id = <MiniBossId>originalname.replace(".dat", "");
        const { category } = miniBossData[id];

        buffers[category].push(buffer);
    }

    createSpritesheets(buffers, "mini-bosses");
});

app.post("/witnesses", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[] = (<Express.Multer.File[]>files).map(({ buffer }) => buffer);
    createSpritesheets([buffers], "witnesses");
});

app.post("/knucklebones-players", data.array("files"), (req) => {
    const { files } = req;
    if (!files) return;

    const buffers: Buffer[] = (<Express.Multer.File[]>files).map(({ buffer }) => buffer);
    createSpritesheets([buffers], "knucklebones-players");
});

async function createSpritesheets(buffers: Buffer[][], name: string = "spritesheet") {
    const sheetWidth = Math.max(...buffers.map(({ length }) => length));
    const sheetHeight = buffers.length;
    
    const width = sheetWidth * MAX_TILE_WIDTH;
    const height = sheetHeight * MAX_TILE_HEIGHT;
    
    const spritesheet = sharp(await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: "transparent"
        }
    }).composite(buffers.flatMap((buffers, y) => buffers.map((buffer, x) => ({
        input: buffer,
        raw: {
            width: MAX_TILE_WIDTH,
            height: MAX_TILE_HEIGHT,
            channels: 4
        },

        top: (sheetHeight - 1 - y) * MAX_TILE_HEIGHT,
        left: x * MAX_TILE_WIDTH
    })))).png().toBuffer()).flip();
    
    for (const i of Array(Math.ceil(Math.max(Math.log2(MAX_TILE_WIDTH / MIN_TILE_WIDTH), Math.log2(MAX_TILE_HEIGHT / MIN_TILE_HEIGHT))) + 1).keys()) {
        const divisor = 2 ** i;
        spritesheet.resize(width / divisor, height / divisor).toFile(path.join(OUTPUT_DIR, MIN_TILE_WIDTH === MAX_TILE_WIDTH && MIN_TILE_HEIGHT === MAX_TILE_HEIGHT ? `${name}.png` :  `${name}-${MAX_TILE_WIDTH / divisor}x${MAX_TILE_HEIGHT / divisor}.png`));
    }
}

ViteExpress.config({ viteConfigFile: path.join(__dirname, "vite.config.ts") });
ViteExpress.listen(app, PORT, () => console.log(`listening to http://localhost:${PORT}/...`));