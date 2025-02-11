import { SvelteConfig, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
export default <SvelteConfig>{
    preprocess: vitePreprocess(),
    compilerOptions: { runes: true }
};