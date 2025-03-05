import fs from "fs/promises";
import path from "path";

import { defineConfig, type Plugin } from "vite";
import { minify } from "terser";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";

const FONTS_EXTENSION_NAMES: string[] = [".ttf", ".otf"];
const IGNORE_PRELOADING_EXTENSION_NAMES: string[] = [".txt"];

const STATIC_ASSETS_FOLDER_NAME: string = "public/static";
const SOUNDS_FOLDER_NAME: string = "public/sounds";

const LIB_SRC_FOLDER_NAME: string = "lib";
const LIB_DEST_FOLDER_NAME: string = "scripts/lib";

const LIB_PATHS: Record<string, string> = {
    "spine-ts/build/spine-webgl.js": "spine-webgl.min.js",

    "pako/pako.js": "pako.min.js",
    "upng-js/UPNG.js": "UPNG.min.js",

    "eruda/eruda.js": ""
};

const nonModuleImporterPlugin = (): Plugin => ({
    name: "non-module-importer",
    apply: "build",

    async generateBundle() {
        await fs.mkdir(path.join(__dirname, "dist", LIB_DEST_FOLDER_NAME), { recursive: true });

        for (const [src, dest] of Object.entries(LIB_PATHS)) {
            if (!dest) return;
            
            const input = await fs.readFile(path.join(__dirname, LIB_SRC_FOLDER_NAME, src), "utf-8");
            const { code: output = "" } = await minify(input);

            await fs.writeFile(path.join(__dirname, "dist", LIB_DEST_FOLDER_NAME, dest), output, "utf-8");
        }
    },

    transformIndexHtml: async (html: string): Promise<string> => {
        html = html.replace("</title>", "</title>\n");

        for (const [src, dest] of Object.entries(LIB_PATHS).reverse()) {
            const srcPath = path.join(LIB_SRC_FOLDER_NAME, src).replaceAll("\\", "/");
            const destPath = dest ? path.join(LIB_DEST_FOLDER_NAME, dest).replaceAll("\\", "/") : "";

            html = html.replace(`\n        <script src="${srcPath}"></script>`, "");
            if (destPath) html = html.replace("</title>", `</title>\n        <script src="${destPath}" defer></script>`);
        }
        
        html = html.replace("</title>", "</title>\n");

        html = html.replace("</head>", "\n        </head>");

        const preloadFiles = await fs.readdir(STATIC_ASSETS_FOLDER_NAME).then((files) => files.map((file) => path.join(__dirname, STATIC_ASSETS_FOLDER_NAME, file)));
        for (const srcPath of preloadFiles) {
            const props = await fs.stat(srcPath);

            if (props.isDirectory()) {
                preloadFiles.push(...await fs.readdir(srcPath).then((files) => files.map((file) => path.join(srcPath, file))));
                continue;
            }

            const extension = path.extname(srcPath);
            if (IGNORE_PRELOADING_EXTENSION_NAMES.includes(extension)) continue;
            
            const destPath = srcPath.replace(path.join(__dirname, "public"), "").replaceAll("\\", "/");
            const type = FONTS_EXTENSION_NAMES.includes(extension) ? "font" : "image";

            html = html.replace("</head>", `<link rel="preload" crossorigin="anonymous" href="${destPath}" as="${type}" type="${type}/${extension.slice(1)}">\n        </head>`);
        }

        const preloadSoundFiles = await fs.readdir(SOUNDS_FOLDER_NAME).then((files) => files.map((file) => path.join(__dirname, SOUNDS_FOLDER_NAME, file)));
        for (const srcPath of preloadSoundFiles) {
            const props = await fs.stat(srcPath);

            if (props.isDirectory()) {
                preloadFiles.push(...await fs.readdir(srcPath).then((files) => files.map((file) => path.join(srcPath, file))));
                continue;
            }

            const extension = path.extname(srcPath);
            if (IGNORE_PRELOADING_EXTENSION_NAMES.includes(extension)) continue;
            
            const destPath = srcPath.replace(path.join(__dirname, "public"), "").replaceAll("\\", "/");
            html = html.replace("</head>", `<link rel="preload" crossorigin="anonymous" href="${destPath}" as="audio" type="audio/${extension.slice(1)}">\n        </head>`);
        }

        html = html.replace("    </head>", "</head>");
        
        return html.replaceAll(/\n      </g, "\n        <");
    }
});

// https://vite.dev/config/
export default defineConfig({
    server: {
        https: {
            cert: ".certs/cert.pem",
            key: ".certs/dev.pem"
        }
    },

    resolve: { external: ["extraction", "setup", "markdown"] },
    build: {
        assetsDir: ".",
        sourcemap: true,
        target: "ES2022",

        rollupOptions: {
            output: {
                entryFileNames: "scripts/[name]-[hash].js",
                chunkFileNames: "scripts/[name]-[hash].js",
                assetFileNames: ({ names: [name] }) => `${name.endsWith(".css") ? "styles" : "assets"}/[name]-[hash][extname]`,

                manualChunks: (path: string) => path.includes("node_modules") ? "vendor" : ""
            },

            external: (path: string) => path.includes("lib/")
        }
    },

    plugins: [svelte({ compilerOptions: { runes: true } }), tailwindcss(), mkcert({
        autoUpgrade: true,
        force: true,

        savePath: ".certs"
    }), nonModuleImporterPlugin()]
});
