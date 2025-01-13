import { TOS_LOCAL_STORAGE_NAME } from "../../components/misc";
import { fetchAndCache, resolvePath } from "../../utils";

// use GITHUB_FG_TOKEN
export class NewsManager {
    static readonly GITHUB_FG_TOKEN: string = import.meta.env.PROD ? import.meta.env.GITHUB_FG_TOKEN : import.meta.env.VITE_GITHUB_FG_TOKEN;
    static readonly GITHUB_API_ORIGIN: string = "https://api.github.com/repos/osoclos";
    static readonly GITHUB_API_ENDPOINT: string = "contents";

    static readonly GITHUB_API_NEWS_REPO_ROOT: string = "cultivis-news";
    static readonly GITHUB_API_TERMS_REPO_ROOT: string = "cultivis";
    
    static readonly CACHE_NAME: string = "news";
    static readonly LOCAL_STORAGE_NAME: string = "news-shas";

    content: Map<string, Set<string>>;

    private shas: Map<string, string>;
    private termsSha?: string;

    private textDecoder: TextDecoder;
    private constructor(private cache: Cache) {
        this.content = new Map([["_", new Set()]]);
        this.shas = new Map();

        this.textDecoder = new TextDecoder();
    }

    static async create() {
        const cache = await caches.open(this.CACHE_NAME);
        return new NewsManager(cache);
    }

    async loadNews(): Promise<boolean> {
        let hasNewContent: boolean = false;

        const folders = await this.fetch<true>("", NewsManager.GITHUB_API_NEWS_REPO_ROOT, true);
        for (const { type, name, path, sha } of folders) {
            if (type === "file") {
                const { content } = await this.fetch(path, NewsManager.GITHUB_API_NEWS_REPO_ROOT, false);
                const text = this.decodeContent(content);

                this.content.get("_")!.add(text);
                continue;
            }

            const prevSha = localStorage.getItem(this.getLocalStorageKey(name));
            const forceFetch = sha !== prevSha;

            const files: FetchData[] = await this.fetch(path, NewsManager.GITHUB_API_NEWS_REPO_ROOT, true, forceFetch);
            for (const { type, name, path } of files) {
                if (type === "dir") {
                    const subFiles = await this.fetch(path, NewsManager.GITHUB_API_NEWS_REPO_ROOT, true, forceFetch);
                    files.push(...subFiles);

                    continue;
                }

                const { content } = await this.fetch(path, NewsManager.GITHUB_API_NEWS_REPO_ROOT, false);
                const text = this.decodeContent(content);

                this.content.has(name) ? this.content.get(name)!.add(text) : this.content.set(name, new Set(text));
            }

            hasNewContent ||= forceFetch;
            this.shas.set(name, sha);
        }

        return hasNewContent;
    }

    async hasNewTerms(): Promise<boolean> {
        const prevSha = localStorage.getItem(TOS_LOCAL_STORAGE_NAME);
        const { sha } = await this.fetch("ToS.md", NewsManager.GITHUB_API_TERMS_REPO_ROOT, false, true);

        this.termsSha = sha;
        return sha !== prevSha;
    }

    storeLatestNewsShas() {
        this.shas.forEach((sha, name) => localStorage.setItem(this.getLocalStorageKey(name), sha));
    }

    storeLatestTermsSha() {
        this.termsSha && localStorage.setItem(TOS_LOCAL_STORAGE_NAME, this.termsSha);
    }

    private async fetch<R extends boolean>(path: string, root: string, _isDir: R, forceFetch: boolean = true): Promise<R extends true ? FetchData[] : FetchData> {
        return fetchAndCache(resolvePath(resolvePath(path, NewsManager.GITHUB_API_ENDPOINT), root, NewsManager.GITHUB_API_ORIGIN), this.cache, forceFetch, {
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": `Bearer ${NewsManager.GITHUB_FG_TOKEN}`,
                
                "X-Github-Api-Version": "2022-11-28"
            }
        }).then((res) => res.json());
    }

    private decodeContent(b64: string) {
        const binary = atob(b64);
        const buffer = Uint8Array.from(binary, (char) => char.codePointAt(0)!);

        return this.textDecoder.decode(buffer);
    }

    private getLocalStorageKey(key: string) {
        return `${NewsManager.LOCAL_STORAGE_NAME} - ${key}`;
    }
}

export type NewsRootName = "blog" | "changelog" | "_";
interface FetchData {
    type: ItemType;
    
    encoding: "base64";
    size: number;

    name: string;
    path: string;

    content: string;
    sha: string;

    url: string;
    git_url: string;
    html_url: string;
    download_url: string;

    _links: Links;
}

type ItemType = "file" | "dir";
interface Links {
    git: string;
    self: string;
    html: string;
}