/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv { readonly VITE_SECRET_BYPASS_TOKEN: string; }
interface ImportMeta { readonly env: ImportMetaEnv; }