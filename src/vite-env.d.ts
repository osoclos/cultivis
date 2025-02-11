/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;

    readonly VITE_SERVER_BYPASS_DEV_TOKEN: string;
}

interface ImportMeta { readonly env: ImportMetaEnv; }