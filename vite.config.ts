import fs from "fs/promises";
import path from "path";

import { defineConfig, type Plugin } from "vite";
import { minify } from "terser";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";

const LIB_SRC_FOLDER_NAME: string = "lib";
const LIB_DEST_FOLDER_NAME: string = "scripts/lib";

const LIB_PATHS: Record<string, string> = { "spine-ts/build/spine-webgl.js": "spine-webgl.min.js" };

const scriptTagRepather = (paths: Record<string, string>, srcFolder: string, destFolder: string): Plugin => ({
    name: "script-tag-repather",
    apply: "build",

    async generateBundle() {
        await fs.mkdir(path.join(__dirname, "dist", destFolder), { recursive: true });

        for (const [src, dest] of Object.entries(paths)) {
            if (!dest) return;

            const input = await fs.readFile(path.join(__dirname, srcFolder, src), "utf-8");
            const { code: output = "" } = await minify(input);

            await fs.writeFile(path.join(__dirname, "dist", destFolder, dest), output, "utf-8");
        }
    },

    transformIndexHtml: async (html: string): Promise<string> => {
        html = html.replace("</title>", "</title>\n");

        for (const [src, dest] of Object.entries(paths).reverse()) {
            const srcPath = path.join(srcFolder, src).replaceAll("\\", "/");
            const destPath = dest ? path.join(destFolder, dest).replaceAll("\\", "/") : "";

            html = html.replace(`\n        <script src="${srcPath}"></script>`, "");
            if (destPath) html = html.replace("</title>", `</title>\n        <script src="${destPath}" defer></script>`);
        }

        html = html.replace("</title>", "</title>\n");
        return html.replaceAll(/\n      </g, "\n        <");
    }
});

// https://vite.dev/config/
export default defineConfig({
    server: {
        fs: { deny: ["extraction", "setup", "markdown", "dev-guides"] },
        https: {
            cert: ".certs/cert.pem",
            key: ".certs/dev.pem"
        },

        hmr: { overlay: false }
    },

    resolve: { external: ["extraction", "setup", "markdown", "dev-guides"] },
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
    }), scriptTagRepather(LIB_PATHS, LIB_SRC_FOLDER_NAME, LIB_DEST_FOLDER_NAME)]
});
