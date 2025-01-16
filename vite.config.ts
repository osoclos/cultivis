import path from "path";
import fs from "fs/promises";

import { defineConfig, Plugin } from "vite";
import { minify } from "terser";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";

const spineBundlePlugin = (): Plugin => ({
    name: "spine-bundler",
    apply: "build",

    async generateBundle() {
        const input = await fs.readFile(path.join(__dirname, "lib/spine-ts/build/spine-webgl.js"), "utf-8");
        const { code: output = "" } = await minify(input);

        const filepath = path.join(__dirname, "dist/scripts/lib/spine-webgl.min.js");

        await fs.mkdir(path.dirname(filepath), { recursive: true });
        await fs.writeFile(filepath, output, "utf-8");
    },

    transformIndexHtml(html: string): string {
        html = html.replace("\n\n        <script src=\"lib/spine-ts/build/spine-webgl.js\"></script>", "");
        html = html.replace("</title>", "</title>\n      <script src=\"scripts/lib/spine-webgl.min.js\" defer></script>");

        return html;
    }
});

// https://vite.dev/config/
export default defineConfig({
    server: { fs: { allow: ["index.html", "src", "public", "lib"] } },
    build: {
        assetsDir: ".",
        sourcemap: true,

        rollupOptions: {
            output: {
                entryFileNames: "scripts/[name]-[hash].js",
                chunkFileNames: "scripts/[name]-[hash].js",
                assetFileNames: ({ names }) => names[0].endsWith(".css") ? "styles/[name]-[hash][extname]" : "assets/[name]-[hash][extname]",

                manualChunks(id) {
                    if (id.includes("node_modules")) return "vendor";
                }
            },

            external: (id) => id.startsWith("/src/lib/")
        }
    },

    plugins: [svelte({ compilerOptions: { runes: true } }), tailwindcss(), mkcert(), spineBundlePlugin()]
});
