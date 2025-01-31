import { GitManager } from "./GitManager";
import { MONTH_NAMES } from "/src/utils";

export class NewsManager {
    static readonly NEWS_LOCAL_STORAGE_NAME: string = "news-last-updated";

    static readonly OLD_TERMS_LOCAL_STORAGE_NAME: string = "git_latest-terms-unix"; // TODO: remove this when updating tos
    static readonly TERMS_LOCAL_STORAGE_NAME: string = "terms-last-updated";

    static readonly CHANGELOG_FOLDER_NAME: string = "changelog";
    static readonly BLOG_FOLDER_NAME: string = "blog";

    private constructor(private gitManager: GitManager) {}
    static async create() {
        const gitManager = await GitManager.create();
        return new NewsManager(gitManager);
    }

    async getNews(): Promise<Record<string, string[]>> {
        interface FileInfo {
            date: number;

            content: string;
            folderName: string;
        }

        const info: FileInfo[] = [];

        const lastUpdate = +(localStorage.getItem(NewsManager.NEWS_LOCAL_STORAGE_NAME) ?? 0);
        const filesToFetch: string[] = await this.areNewsUpdated() ? [] : await Promise.all(await this.gitManager.getCommit("", GitManager.NEWS_ROUTE_ROOT, { page: -1, perPage: 100, since: lastUpdate + 1 }).then((commits) => commits.flatMap(({ sha }) => this.gitManager.getCommitData(sha, GitManager.NEWS_ROUTE_ROOT, true).then(({ files }) => files)))).then((arr) => arr.flat());

        const folders = await this.gitManager.getContent("", GitManager.NEWS_ROUTE_ROOT, !!filesToFetch.length);
        for (const { name: folderName, path } of folders.filter(({ type }) => type === "dir")) {
            const files = await this.gitManager.getContent(path, GitManager.NEWS_ROUTE_ROOT, !!filesToFetch.length);
            for (const { type, name, path } of files) {
                if (type === "dir") {
                    const subFiles = await this.gitManager.getContent(path, GitManager.NEWS_ROUTE_ROOT, !!filesToFetch.length);
                    files.push(...subFiles);

                    continue;
                }

                const [{ content }] = await this.gitManager.getContent(path, GitManager.NEWS_ROUTE_ROOT, filesToFetch.includes(path));
                const date = this.dashedNameToUnix(name);
                
                info.push({ date, content, folderName });
            }
        }

        const news: Record<string, string[]> = {};
        for (const { content, folderName } of info.sort(({ date: a }, { date: b }) => a - b)) folderName in news ? news[folderName].push(content) : news[folderName] = [content];
        
        return news;
    }

    async getTermsSummary(): Promise<string> {
        const [{ content }] = await this.gitManager.getContent("ToS.md", GitManager.MAIN_ROUTE_ROOT, true);
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
        const unix = await this.getUnix("", GitManager.NEWS_ROUTE_ROOT, lastUpdate);

        return unix;
    }

    async getTermsUnix(): Promise<number> {
        const lastUpdate = +(localStorage.getItem(NewsManager.OLD_TERMS_LOCAL_STORAGE_NAME) ?? 0);
        const unix = this.getUnix("ToS.md", GitManager.MAIN_ROUTE_ROOT, lastUpdate);

        return unix;
    }

    async getLastUpdatedUnix(): Promise<number> {
        return newsManager.getUnix("", GitManager.MAIN_ROUTE_ROOT);
    }

    async getUnix(path: string, root: string, since: number = 0) {
        const [{ unix }] = await this.gitManager.getCommit(path, root, { since });
        return unix;
    }

    private dashedNameToUnix(name: string): number {
        const code = name.match(/(\d{2}-){2}\d{2}/)?.[0];
        if (!code) return 0;

        const [day, month, year]: number[] = code.split("-").map((val) => +val);
        const date: string = `${day} ${MONTH_NAMES[month]} ${year}`;

        return new Date(date).getTime();
    }
}

export const newsManager = await NewsManager.create();