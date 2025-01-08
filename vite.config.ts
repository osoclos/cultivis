import { defineConfig } from "vite";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";


// https://vite.dev/config/
export default defineConfig({
    build: { sourcemap: true },
    server: { fs: { deny: ["setup/**/*.ts"] } },

    plugins: [svelte({ compilerOptions: { runes: true } }), tailwindcss(), mkcert()]
});
