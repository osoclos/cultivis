import path from "path";
import { defineConfig } from "vite";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";


// https://vite.dev/config/
export default defineConfig({
    build: { sourcemap: true },
    server: {
        fs: {
            strict: true,
            allow: [path.resolve(__dirname, "src"), path.resolve(__dirname, "public"), path.resolve(__dirname, "lib")]
        }
    },

    plugins: [svelte({ compilerOptions: { runes: true } }), tailwindcss(), mkcert()]
});
