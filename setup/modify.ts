import fs from "fs/promises";
import path from "path";

import { Atlas } from "./utils";

const ASSETS_ROOT_PATH = path.join(__dirname, "../public/assets");

const MODS_SRC_FOLDER_PATH = path.join(__dirname, "modder");
const MODS_DEST_FOLDER_NAME: string = "modded";

const files = await fs.readdir(MODS_SRC_FOLDER_PATH, { recursive: true });
for (const file of files) {
    const srcPath = path.join(MODS_SRC_FOLDER_PATH, file);
    const destPath = path.join(ASSETS_ROOT_PATH, MODS_DEST_FOLDER_NAME, file);
    
    const extension = path.extname(srcPath);
    if (extension !== ".atlas") {
        fs.copyFile(srcPath, destPath);
        continue;
    }

    const modsAtlas = Atlas.from(await fs.readFile(srcPath, { encoding: "utf-8" }));
    
    for (const srcPath in modsAtlas) {
        const destPath = path.join(MODS_DEST_FOLDER_NAME, srcPath).replaceAll("\\", "/");

        modsAtlas[destPath] = modsAtlas[srcPath];
        delete modsAtlas[srcPath];
    }

    const originalAtlasPath = path.join(ASSETS_ROOT_PATH, file);
    const originalAtlas = Atlas.from(await fs.readFile(originalAtlasPath, { encoding: "utf-8" }));
    
    const atlas = Atlas.to({ ...originalAtlas, ...modsAtlas });
    await fs.writeFile(destPath, atlas);
}