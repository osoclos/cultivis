import { fetchAndCache, resolvePath } from "../../utils";

import type { SceneObject } from "../Scene";
import type { FormatData } from "../Exporter";

export class ServerManager {
    static readonly USE_LOCAL_PROXY_PARAM_NAME: string = "use-local-proxy";
    static readonly PROXY_SERVER_URL: string = import.meta.env.PROD || !new URLSearchParams(window.location.search).has(this.USE_LOCAL_PROXY_PARAM_NAME) ? "https://cultivis.onrender.com/" : "http://localhost:3000/";

    static readonly TOKEN_ROUTE_ROOT: string = "token";
    static readonly DATABASE_ROUTE_ROOT: string = "db";

    static readonly MAIN_ROUTE_ROOT: string = "main";
    static readonly NEWS_ROUTE_ROOT: string = "news";

    static readonly PING_ROUTE: string = "ping";

    static readonly NEW_TOKEN_ROUTE: string = "new";
    static readonly REVOKE_TOKEN_ROUTE: string = "revoke";

    static readonly VISITS_DB_ROUTE: string = "visits";
    static readonly NEW_VISITOR_DB_ROUTE: string = "new-visitor";
    static readonly NEW_EXPORT_DB_ROUTE: keyof ResponseDataMap = "new-export";

    static readonly CONTENT_ROUTE: keyof ResponseDataMap = "content";
    static readonly COMMIT_ROUTE: keyof ResponseDataMap = "commit";
    static readonly COMMIT_DATA_ROUTE: keyof ResponseDataMap = "commit-data";

    static readonly CONTENT_CACHE_NAME: string = "content";
    static readonly COMMIT_DATA_CACHE_NAME: string = "commit-data";

    private cache: Map<string, any>;
    private constructor(private token: string, private contentCache: Cache, private commitDataCache: Cache) {
        this.cache = new Map();
    }

    static async create() {
        const token = await this.fetchToken();

        const abortController = new AbortController();
        window.addEventListener("beforeunload", async () => {
            await this.revokeToken(token);
            abortController.abort();
        }, { signal: abortController.signal });

        const contentCache = await caches.open(this.CONTENT_CACHE_NAME);
        const commitDataCache = await caches.open(this.COMMIT_DATA_CACHE_NAME);

        await fetch(resolvePath(ServerManager.PING_ROUTE, "", ServerManager.PROXY_SERVER_URL));
        return new ServerManager(token, contentCache, commitDataCache);
    }

    private static async fetchToken(): Promise<string> {
        return fetch(resolvePath(ServerManager.NEW_TOKEN_ROUTE, ServerManager.TOKEN_ROUTE_ROOT, ServerManager.PROXY_SERVER_URL), {
            headers: {
                "Content-Type": "text/plain",
                "Authorization": `Bearer ${import.meta.env.DEV ? import.meta.env.VITE_SERVER_BYPASS_DEV_TOKEN : ""}`
            }
        }).then((res) => res.text()).catch((err) => {
            console.error(err instanceof Error ? `Unable to fetch token: ${err.message}, caused by: ${err.cause}` : `Unable to fetch token: ${err}, caused by: ${import.meta.url}`);
            return "";
        });
    }

    private static async revokeToken(token: string) {
        await fetch(resolvePath(ServerManager.REVOKE_TOKEN_ROUTE, ServerManager.TOKEN_ROUTE_ROOT, ServerManager.PROXY_SERVER_URL), {
            method: "POST",
            body: token
        });
    }

    async sendExport(obj: SceneObject, name: string, duration: number, formatData: FormatData) {
        await this.fetch({ obj, name, duration, format_data: formatData }, ServerManager.NEW_EXPORT_DB_ROUTE, ServerManager.DATABASE_ROUTE_ROOT);
    }

    async addNewVisitor() {
        await fetch(resolvePath(ServerManager.NEW_VISITOR_DB_ROUTE, ServerManager.DATABASE_ROUTE_ROOT, ServerManager.PROXY_SERVER_URL), {
            method: "POST",
            body: this.token
        });
    }
    
    async getContent(path: string, root: string, forceFetch: boolean = false) {
        return <Promise<ContentReplyBody>>this.fetch({ path }, ServerManager.CONTENT_ROUTE, root, forceFetch);
    }

    async getCommit(path: string, root: string, body: Omit<CommitRequestBody, "token" | "path"> = {}) {
        return <Promise<CommitReplyBody>>this.fetch({ path, ...body }, ServerManager.COMMIT_ROUTE, root);
    }

    async getCommitData(sha: string, root: string, forceFetch: boolean = false) {
        return <Promise<CommitDataReplyBody>>this.fetch({ sha }, ServerManager.COMMIT_DATA_ROUTE, root, forceFetch);
    }

    async fetch<B extends NonTokenBody, R extends keyof ResponseDataMap>(body: B, route: R, root: string, forceFetch: boolean = false): Promise<ResponseDataMap[R]> {
        forceFetch ||= (route === ServerManager.COMMIT_ROUTE && isCommitBody(body)) || isExportBody(body);
        
        const key: string = (() => {
            switch (true) {
                case isContentBody(body):
                case isCommitBody(body): return `${route} - ${resolvePath(body.path, root)}`;
                
                case isCommitDataBody(body): return `${route} - ${resolvePath(body.sha, root)}`;
                case isExportBody(body): return `${route} - ${resolvePath(body.name, root)}`
    
                default: return route;
            }
        })();
        
        if (this.cache.has(key) && !forceFetch) return this.cache.get(key);
        const { token } = this;

        const url = resolvePath(route, root, ServerManager.PROXY_SERVER_URL);
        const init: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ ...body, token })
        };

        const data: ResponseDataMap[R] = await (() => {
            switch (true) {
                case route === ServerManager.CONTENT_ROUTE && isContentBody(body): return fetchAndCache(`${url}?${new URLSearchParams({ path: body.path }).toString()}`, this.contentCache, forceFetch, init);
                case isCommitDataBody(body): return fetchAndCache(`${url}?${new URLSearchParams({ sha: body.sha }).toString()}`, this.commitDataCache, forceFetch, init);

                case route === ServerManager.COMMIT_ROUTE && isCommitBody(body):
                case isExportBody(body):
                default: return fetch(url, init);
            }
        })().then((res) => res.json()).catch((err) => {
            console.error(err instanceof Error ? `Unable to fetch data: ${err.message}, caused by: ${err.cause}` : `Unable to fetch data: ${err}, caused by: ${import.meta.url}`);
            return {};
        });

        if (Object.keys(data).length) this.cache.set(key, data);
        return data;
    }
}

export const serverManager = await ServerManager.create();

type Body = ContentRequestBody | CommitRequestBody | CommitDataRequestBody;
type NonTokenBody = Omit<Body, "token">;

interface ResponseDataMap {
    "content": ContentReplyBody;

    "commit": CommitReplyBody;
    "commit-data": CommitDataReplyBody;

    "new-export": ExportRequestBody;
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

interface ExportRequestBody {
    obj: SceneObject;

    name: string;
    duration: number;
    format_data: FormatData;
}

export type ContentReplyBody = ContentReplyData[];
interface ContentReplyData {
    type: "file" | "dir";
    content: string;
    
    name: string;
    path: string;
}

export type CommitReplyBody = CommitReplyData[];
interface CommitReplyData {
    sha: string;
    unix: number;

    files: string[];
}

export interface CommitDataReplyBody { files: string[]; }

function isContentBody(body: NonTokenBody): body is ContentRequestBody {
    return "path" in body;
}

function isCommitBody(body: NonTokenBody): body is CommitRequestBody {
    return "path" in body;
}

function isCommitDataBody(body: NonTokenBody): body is CommitDataRequestBody {
    return "sha" in body;
}

function isExportBody(body: NonTokenBody): body is ExportRequestBody {
    return "obj" in body;
}