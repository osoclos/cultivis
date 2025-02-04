import path from "path";
import fs from "fs/promises";

import { defineConfig, Plugin } from "vite";
import { minify } from "terser";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";

const LIB_SRC_FOLDER_NAME: string = "lib";
const LIB_DIST_FOLDER_NAME: string = "scripts/lib";

const LIB_PATHS: Record<string, string> = {
    "spine-ts/build/spine-webgl.js": "spine-webgl.min.js",

    "pako/pako.js": "pako.min.js",
    "upng-js/UPNG.js": "UPNG.min.js",

    "eruda/eruda.js": ""
};

const spineBundlePlugin = (): Plugin => ({
    name: "spine-bundler",
    apply: "build",

    async generateBundle() {
        await fs.mkdir(path.join(__dirname, "dist", LIB_DIST_FOLDER_NAME), { recursive: true });

        for (const [src, dist] of Object.entries(LIB_PATHS)) {
            if (!dist) return;
            
            const input = await fs.readFile(path.join(__dirname, LIB_SRC_FOLDER_NAME, src), "utf-8");
            const { code: output = "" } = await minify(input);

            await fs.writeFile(path.join(__dirname, "dist", LIB_DIST_FOLDER_NAME, dist), output, "utf-8");
        }
    },

    transformIndexHtml: (html: string): string => Object.entries(LIB_PATHS).reverse().reduce((html, [src, dist]) => html.replace(`<script src="${path.join(LIB_SRC_FOLDER_NAME, src).replaceAll("\\", "/")}"></script>`, "").replace("</title>", dist ? `</title>\n      <script src="${path.join(LIB_DIST_FOLDER_NAME, dist).replaceAll("\\", "/")}" defer></script>` : "</title>"), html)
});

// https://vite.dev/config/
export default defineConfig({
    server: {
        https: {
            cert: ".certs/cert.pem",
            key: ".certs/dev.pem"
        },

        fs: {
            strict: true,
            deny: ["extraction", "setup"]
        }
    },

    build: {
        assetsDir: ".",
        sourcemap: true,
        target: "ES2022",

        rollupOptions: {
            output: {
                entryFileNames: "scripts/[name]-[hash].js",
                chunkFileNames: "scripts/[name]-[hash].js",
                assetFileNames: ({ names }) => names[0].endsWith(".css") ? "styles/[name]-[hash][extname]" : "assets/[name]-[hash][extname]",

                manualChunks: (path: string) => path.includes("node_modules") ? "vendor" : ""
            },

            external: (path: string) => path.includes("lib/")
        }
    },

    plugins: [svelte({ compilerOptions: { runes: true } }), tailwindcss(), mkcert({
        autoUpgrade: true,
        force: true,

        savePath: ".certs"
    }), spineBundlePlugin()]
});
