import { fetchAndCache, resolvePath } from "../../utils";

export class GitManager {
    static readonly USE_LOCAL_PROXY_PARAM_NAME: string = "use-local-proxy";
    static readonly PROXY_SERVER_URL: string = import.meta.env.PROD || !new URLSearchParams(window.location.search).has(this.USE_LOCAL_PROXY_PARAM_NAME) ? "https://cultivis.onrender.com/" : "http://localhost:3000/";

    static readonly MAIN_ROUTE_ROOT: string = "main";
    static readonly NEWS_ROUTE_ROOT: string = "news";
    static readonly TOKEN_ROUTE_ROOT: string = "token";

    static readonly CONTENT_ROUTE: keyof ResponseDataMap = "content";
    static readonly COMMIT_ROUTE: keyof ResponseDataMap = "commit";
    static readonly COMMIT_DATA_ROUTE: keyof ResponseDataMap = "commit-data";

    static readonly NEW_TOKEN_ROUTE: string = "new";
    static readonly REVOKE_TOKEN_ROUTE: string = "revoke";

    static readonly CONTENT_CACHE_NAME: string = "content";
    static readonly COMMIT_DATA_CACHE_NAME: string = "commit-data";

    private cache: Map<string, any>;
    private constructor(private token: string, private contentCache: Cache, private commitDataCache: Cache) {
        this.cache = new Map();
    }

    static async create() {
        const token = await this.fetchToken();
        window.addEventListener("beforeunload", async () => await this.revokeToken(token));

        const contentCache = await caches.open(this.CONTENT_CACHE_NAME);
        const commitDataCache = await caches.open(this.COMMIT_DATA_CACHE_NAME);

        return new GitManager(token, contentCache, commitDataCache);
    }

    private static async fetchToken(): Promise<string> {
        return fetch(resolvePath(GitManager.NEW_TOKEN_ROUTE, GitManager.TOKEN_ROUTE_ROOT, GitManager.PROXY_SERVER_URL), {
            headers: {
                "Content-Type": "text/plain",
                "Authorization": `Bearer ${import.meta.env.VITE_SECRET_BYPASS_TOKEN}`
            }
        }).then((res) => res.text()); 
    }

    private static async revokeToken(token: string) {
        await fetch(resolvePath(GitManager.REVOKE_TOKEN_ROUTE, GitManager.TOKEN_ROUTE_ROOT, GitManager.PROXY_SERVER_URL), {
            method: "POST",
            body: token
        });
    }
    
    async getContent(path: string, root: string, forceFetch: boolean = false) {
        return this.fetch({ path }, GitManager.CONTENT_ROUTE, root, forceFetch) as Promise<ContentReplyBody>;
    }

    async getCommit(path: string, root: string, body: Omit<CommitRequestBody, "token" | "path"> = {}) {
        return this.fetch({ path, ...body }, GitManager.COMMIT_ROUTE, root) as Promise<CommitReplyBody>;
    }

    async getCommitData(sha: string, root: string, forceFetch: boolean = false) {
        return this.fetch({ sha }, GitManager.COMMIT_DATA_ROUTE, root, forceFetch) as Promise<CommitDataReplyBody>;
    }

    async fetch<B extends NonTokenBody, R extends keyof ResponseDataMap>(body: B, route: R, root: string, forceFetch: boolean = false): Promise<ResponseDataMap[R]> {
        const key: string = (() => {
            switch (true) {
                case isContentBody(body):
                case isCommitBody(body): return `${route} - ${resolvePath(body.path, root)}`;
                
                case isCommitDataBody(body): return `${route} - ${resolvePath(body.sha, root)}`;
    
                default: return route;
            }
        })();
        
        if (this.cache.has(key)) return this.cache.get(key);
        const { token } = this;

        const url = resolvePath(route, root, GitManager.PROXY_SERVER_URL);
        const init: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ ...body, token })
        };

        const data: ResponseDataMap[R] = await (() => {
            switch (true) {
                case route === GitManager.CONTENT_ROUTE && isContentBody(body): return fetchAndCache(`${url}?${new URLSearchParams({ path: body.path }).toString()}`, this.contentCache, forceFetch, init);
                case isCommitDataBody(body): return fetchAndCache(`${url}?${new URLSearchParams({ sha: body.sha }).toString()}`, this.commitDataCache, forceFetch, init);

                case route === GitManager.COMMIT_ROUTE && isCommitBody(body):
                default: return fetch(url, init);
            }
        })().then((res) => res.json());

        this.cache.set(key, data);
        return data;
    }
}

type Body = ContentRequestBody | CommitRequestBody | CommitDataRequestBody;
type NonTokenBody = Omit<Body, "token">;

interface ResponseDataMap {
    "content": ContentReplyBody;

    "commit": CommitReplyBody;
    "commit-data": CommitDataReplyBody;
}

interface RequestBody { token: string; }

interface ContentRequestBody extends RequestBody { path: string; }
interface CommitRequestBody extends RequestBody {
    path: string;

    page?: number;
    perPage?: number;

    since?: number;
}

interface CommitDataRequestBody extends RequestBody { sha: string; }

type ContentReplyBody = ContentReplyData[];
interface ContentReplyData {
    type: "file" | "dir";
    content: string;
    
    name: string;
    path: string;
}

type CommitReplyBody = CommitReplyData[];
interface CommitReplyData {
    sha: string;
    unix: number;

    files: string[];
}

interface CommitDataReplyBody { files: string[]; }

function isContentBody(body: NonTokenBody): body is ContentRequestBody {
    return "path" in body;
}

function isCommitBody(body: NonTokenBody): body is CommitRequestBody {
    return "path" in body;
}

function isCommitDataBody(body: NonTokenBody): body is CommitDataRequestBody {
    return "sha" in body;
}