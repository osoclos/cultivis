/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly GITHUB_FG_TOKEN: string;
    readonly VITE_GITHUB_FG_TOKEN: string;
}

interface ImportMeta { readonly env: ImportMetaEnv; }