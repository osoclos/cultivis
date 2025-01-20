import { fetchAndCache, resolvePath } from "../../utils";

enum Routes {
    Content = "content",
    Commit = "commit"
}

export class GitManager {
    static readonly USE_LOCAL_PROXY_PARAM_NAME: string = "use-local-proxy";

    static readonly PROXY_SERVER_URL: string = import.meta.env.PROD || !new URLSearchParams(window.location.search).has(this.USE_LOCAL_PROXY_PARAM_NAME) ? "https://cultivis.onrender.com/" : "http://localhost:3000/";
    static readonly PROXY_CONTENT_ROUTE = Routes.Content;
    static readonly PROXY_COMMIT_ROUTE = Routes.Commit;

    static readonly MAIN_REPO_ROOT: string = "cultivis";
    static readonly NEWS_REPO_ROOT: string = "cultivis-news";

    static readonly NEWS_CACHE_NAME: string = "git-news";

    static readonly NEWS_LOCAL_STORAGE_NAME: string = "git_news-sha";
    static readonly TERMS_LOCAL_STORAGE_NAME: string = "git_latest-terms-unix";

    static readonly CHANGELOG_FOLDER_NAME: string = "changelog";
    static readonly BLOG_FOLDER_NAME: string = "blog";

    private cache: Map<string, any>;
    private textDecoder: TextDecoder;

    private constructor(private newsCache: Cache) {
        this.cache = new Map();
        this.textDecoder = new TextDecoder();
    }

    static async create() {
        const newsCache = await caches.open(this.NEWS_CACHE_NAME);
        return new GitManager(newsCache);
    }

    async getNews(): Promise<Record<string, string[]>> {
        const news: Record<string, string[]> = {};
        const areNewsUpdated = await this.areNewsUpdated();

        const folders = await this.fetch("", GitManager.NEWS_REPO_ROOT, GitManager.PROXY_CONTENT_ROUTE, true, !areNewsUpdated);
        for (const { name, path } of folders.filter(({ type }) => type === "dir")) {
            const files = await this.fetch(path, GitManager.NEWS_REPO_ROOT, GitManager.PROXY_CONTENT_ROUTE, true, !areNewsUpdated);
            for (const { type, path } of files) {
                if (type === "dir") {
                    const subFiles = await this.fetch(path, GitManager.NEWS_REPO_ROOT, GitManager.PROXY_CONTENT_ROUTE, true, !areNewsUpdated);
                    files.push(...subFiles);

                    continue;
                }

                const { content } = await this.fetch(path, GitManager.NEWS_REPO_ROOT, GitManager.PROXY_CONTENT_ROUTE, false) as FileData;
                const text = this.decodeContent(content);

                name in news ? news[name].push(text) : news[name] = [text];
            }
        }

        return news;
    }

    async areNewsUpdated(): Promise<boolean> {
        const lastSha = localStorage.getItem(GitManager.NEWS_LOCAL_STORAGE_NAME);
        const sha = await this.getNewsSha();
        
        return sha === lastSha;
    }

    async getNewsSha(): Promise<string> {
        const [{ sha }] = await this.fetch("", GitManager.NEWS_REPO_ROOT, GitManager.PROXY_COMMIT_ROUTE);
        return sha;
    }

    async getTermsSummary(): Promise<string> {
        const { content } = await this.fetch("ToS.md", GitManager.MAIN_REPO_ROOT, GitManager.PROXY_CONTENT_ROUTE, false) as FileData;
        const text = this.decodeContent(content);

        return text.match(/<!-- CHANGES_SUMMARY="(.+)" -->/)?.[1] ?? "";
    }

    async areTermsAcknowledged(): Promise<boolean> {        
        const lastDate = +(localStorage.getItem(GitManager.TERMS_LOCAL_STORAGE_NAME) ?? 0);
        const date = await this.getTermsUnix();
        
        return date <= lastDate;
    }

    async getTermsUnix(): Promise<number> {
        const [{ commit }] = await this.fetch("ToS.md", GitManager.MAIN_REPO_ROOT, GitManager.PROXY_COMMIT_ROUTE);
        const { date } = commit.author;

        return new Date(date).getTime();
    }

    async getLastUpdatedUnix(): Promise<number> {
        const [{ commit }] = await this.fetch("", GitManager.MAIN_REPO_ROOT, GitManager.PROXY_COMMIT_ROUTE);
        const { date } = commit.author;

        return new Date(date).getTime();
    }

    async fetch<R extends Routes, D extends boolean>(path: string, root: string, route: R,  _isDir?: D, forceFetch: boolean = false): Promise<R extends keyof DataMap<D> ? DataMap<D>[R] : any> {
        const key = `${route} - ${resolvePath(path, root)}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const url = resolvePath("/", route, GitManager.PROXY_SERVER_URL);
        const init: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ path, root })
        };

        const data = await (root === GitManager.NEWS_REPO_ROOT && route === GitManager.PROXY_CONTENT_ROUTE ? fetchAndCache(`${url}?${new URLSearchParams({ path, root }).toString()}`, this.newsCache, forceFetch, init) : fetch(url, init)).then((res) => res.json());

        this.cache.set(key, data);
        return data;
    }

    private decodeContent(b64: string) {
        const binary = atob(b64);
        const buffer = Uint8Array.from(binary, (char) => char.codePointAt(0)!);

        return this.textDecoder.decode(buffer);
    }
}

interface DataMap<D extends boolean> {
    [Routes.Content]: D extends true ? FolderData[] : FolderData;
    [Routes.Commit]: CommitData[];
}

type ContentType = "file" | "dir";
interface FileData extends FolderData {
    type: "file";
    content: string;
}

interface FolderData {
    type: ContentType;
    sha: string;
    
    name: string;
    path: string;
}

interface CommitData {
    sha: string;
    commit: Commit;
}

interface Commit { author: Author; }
interface Author { date: string; }