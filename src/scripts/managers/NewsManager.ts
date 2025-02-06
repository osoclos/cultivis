import { MONTH_NAMES } from "../../utils";
import { ServerManager, type ContentReplyBody } from "./ServerManager";

export class NewsManager {
    static readonly NEWS_LOCAL_STORAGE_NAME: string = "news-last-updated";

    static readonly OLD_TERMS_LOCAL_STORAGE_NAME: string = "git_latest-terms-unix"; // TODO: remove this when updating tos
    static readonly TERMS_LOCAL_STORAGE_NAME: string = "terms-last-updated";

    static readonly CHANGELOG_FOLDER_NAME: string = "changelog";
    static readonly BLOG_FOLDER_NAME: string = "blog";

    static readonly DEFAULT_LOAD_NUM_OF_FILES: number = 5;

    private constructor(private serverManager: ServerManager) {}
    static async create() {
        const serverManager = await ServerManager.create();
        return new NewsManager(serverManager);
    }

    async getNews(): Promise<NewsLoader> {
        const filesToFetch = await this.getOutdatedNewsFiles();

        const folders = new Map((await this.serverManager.getContent("", ServerManager.NEWS_ROUTE_ROOT, !!filesToFetch.length)).filter(({ type }) => type === "dir").map(({ name, path }) => [name, path]));
        
        const files = new Map<string, ContentReplyBody>();
        for (const [name, path] of folders) files.set(name, (await this.serverManager.getContent(path, ServerManager.NEWS_ROUTE_ROOT, !!filesToFetch.length)).sort(({ name: a }, { name: b }) => this.dashedNameToUnix(b) - this.dashedNameToUnix(a)));
        
        const news: Record<string, string[]> = {};
        return async (numOfFiles: number = NewsManager.DEFAULT_LOAD_NUM_OF_FILES, folderNames: string[] = [...folders.keys()], skipFetchedFiles: boolean = true): Promise<Record<string, string[]>> => {
            for (const name of folderNames) {
                news[name] ??= [];
                const lastLength = news[name].length * +skipFetchedFiles;

                const folderFiles = files.get(name) ?? [];
                for (const { type, path } of folderFiles.slice(lastLength, lastLength + numOfFiles)) {
                    if (type === "dir") {
                        const subFiles = await this.serverManager.getContent(path, ServerManager.NEWS_ROUTE_ROOT, !!filesToFetch.length);
                        folderFiles.push(...subFiles);

                        files.set(name, folderFiles);
                        continue;
                    }

                    const [{ content }] = await this.serverManager.getContent(path, ServerManager.NEWS_ROUTE_ROOT, filesToFetch.some((file) => file.includes(path)));
                    news[name].push(content);
                }
            }

            return news;
        };
    }

    async getOutdatedNewsFiles(): Promise<string[]> {
        const lastUpdate = +(localStorage.getItem(NewsManager.NEWS_LOCAL_STORAGE_NAME) ?? 0);
        const files: string[] = await this.areNewsUpdated() ? [] : await Promise.all(await this.serverManager.getCommit("", ServerManager.NEWS_ROUTE_ROOT, { page: -1, perPage: 100, since: lastUpdate + 1 }).then((commits) => commits.flatMap(({ sha }) => this.serverManager.getCommitData(sha, ServerManager.NEWS_ROUTE_ROOT, true).then(({ files }) => files.map((url) => url.replace("%2F", "/")))))).then((arr) => arr.flat());

        return files;
    }

    async getTermsSummary(): Promise<string> {
        const [{ content }] = await this.serverManager.getContent("ToS.md", ServerManager.MAIN_ROUTE_ROOT, true);
        return content.match(/<!-- CHANGES_SUMMARY="(.+)" -->/)?.[1] ?? "";
    }

    async areNewsUpdated(): Promise<boolean> {
        const lastUpdate = +(localStorage.getItem(NewsManager.NEWS_LOCAL_STORAGE_NAME) ?? 0);
        const unix = await this.getNewsUnix();
        
        return unix <= lastUpdate;
    }

    async areTermsAcknowledged(): Promise<boolean> {        
        const lastUpdate = +(localStorage.getItem(NewsManager.OLD_TERMS_LOCAL_STORAGE_NAME) ?? 0);
        const unix = await this.getTermsUnix();
        
        return unix <= lastUpdate;
    }

    async getNewsUnix(): Promise<number> {
        const lastUpdate = +(localStorage.getItem(NewsManager.NEWS_LOCAL_STORAGE_NAME) ?? 0);
        const unix = await this.getUnix("", ServerManager.NEWS_ROUTE_ROOT, lastUpdate);

        return unix;
    }

    async getTermsUnix(): Promise<number> {
        const lastUpdate = +(localStorage.getItem(NewsManager.OLD_TERMS_LOCAL_STORAGE_NAME) ?? 0);
        const unix = await this.getUnix("ToS.md", ServerManager.MAIN_ROUTE_ROOT, lastUpdate);

        return unix;
    }

    async getLastUpdatedUnix(): Promise<number> {
        return this.getUnix("", ServerManager.MAIN_ROUTE_ROOT);
    }

    async getUnix(path: string, root: string, since: number = 0) {
        const [{ unix }] = await this.serverManager.getCommit(path, root, { since });
        return unix;
    }

    private dashedNameToUnix(name: string): number {
        const code = name.match(/(\d{2}-){2}\d{2}/)?.[0];
        if (!code) return 0;

        const [day, month, year]: number[] = code.split("-").map((val) => +val);
        const date: string = `${day} ${MONTH_NAMES[month - 1]} ${year}`;

        return new Date(date).getTime();
    }
}

export const newsManager = await NewsManager.create();
export type NewsLoader = (numOfFiles?: number, folderNames?: string[], skipFetchedFiles?: boolean) => Promise<Record<string, string[]>>;