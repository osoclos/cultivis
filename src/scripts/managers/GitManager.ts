import { resolvePath } from "../../utils";
const MONTH_NAMES: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export class GitManager {
    static readonly PROXY_SERVER_URL: string = import.meta.env.PROD ? "https://cultivis-server.onrender.com/" : "http://localhost:3000/";
    static readonly PROXY_CONTENT_ROUTE: string = "content";
    static readonly PROXY_COMMIT_ROUTE: string = "commit";

    static readonly NEWS_REPO_ROOT: string = "cultivis-news";
    static readonly TERMS_REPO_ROOT: string = "cultivis";
    
    static readonly NEWS_LOCAL_STORAGE_NAME: string = "git_news-shas";
    static readonly TERMS_LOCAL_STORAGE_NAME: string = "git_latest-terms-unix";

    static readonly CHANGELOG_FOLDER_NAME: string = "changelog";
    static readonly BLOG_FOLDER_NAME: string = "blog";

    news: Map<string, Set<string>>;
    private textDecoder: TextDecoder;

    private newsSHAs: Map<string, string>;
    private latestTermsUnix: number;

    constructor() {
        this.news = new Map();

        this.newsSHAs = new Map();
        this.latestTermsUnix = 0;

        this.textDecoder = new TextDecoder();
    }

    get latestTermsDate(): string {
        return this.parseUnix(this.latestTermsUnix);
    }

    async loadNews(): Promise<boolean> {
        let hasNewContent: boolean = false;

        const folders = await this.fetchFromContent("", GitManager.NEWS_REPO_ROOT, true);
        for (const { type, name, path, sha } of folders) {
            if (type === "file") continue;

            const prevSha = localStorage.getItem(this.getLocalStorageKey(GitManager.NEWS_LOCAL_STORAGE_NAME, name));
            const forceFetch = sha !== prevSha;

            const files: FolderData[] = await this.fetchFromContent(path, GitManager.NEWS_REPO_ROOT, true);
            for (const { type, path } of files) {
                if (type === "dir") {
                    const subFiles = await this.fetchFromContent(path, GitManager.NEWS_REPO_ROOT, true);
                    files.push(...subFiles);

                    continue;
                }

                const { content } = await this.fetchFromContent(path, GitManager.NEWS_REPO_ROOT, false);
                const text = this.decodeContent(content);

                this.news.has(name) ? this.news.get(name)!.add(text) : this.news.set(name, new Set([text]));
            }

            hasNewContent ||= forceFetch;
            this.newsSHAs.set(name, sha);
        }

        return hasNewContent;
    }

    async getTermsSummary(): Promise<string> {
        const lastDate = +(localStorage.getItem(GitManager.TERMS_LOCAL_STORAGE_NAME) ?? 0);

        const [{ commit }] = await this.fetchFromCommit("ToS.md", GitManager.TERMS_REPO_ROOT, lastDate);
        const { date } = commit.author;

        const unixDate = new Date(date).getTime();
        this.latestTermsUnix = unixDate;

        const hasNewTerms = unixDate > lastDate;
        
        let summary: string = "";
        if (hasNewTerms) {
            const { content } = await this.fetchFromContent("ToS.md", GitManager.TERMS_REPO_ROOT, false);
            const text = this.decodeContent(content);

            summary = text.match(/<!-- CHANGES_SUMMARY="(.+)" -->/)?.[1] ?? "";
        }
        
        return summary;
    }

    async getLastUpdatedDate(): Promise<string> {
        const [{ commit }] = await this.fetchFromCommit("", GitManager.TERMS_REPO_ROOT);
        const { date } = commit.author;

        const unix = new Date(date).getTime();
        return this.parseUnix(unix);
    }

    updateNewsLocalStorage() {
        this.newsSHAs.forEach((sha, name) => localStorage.setItem(this.getLocalStorageKey(GitManager.NEWS_LOCAL_STORAGE_NAME, name), sha));
    }

    updateTermsLocalStorage() {
        this.latestTermsUnix && localStorage.setItem(GitManager.TERMS_LOCAL_STORAGE_NAME, `${this.latestTermsUnix}`);
    }

    private async fetchFromContent<R extends boolean>(path: string, root: string, isDir: R): Promise<typeof isDir extends true ? FolderData[] : FileData> {
        const url = resolvePath("", GitManager.PROXY_CONTENT_ROUTE, GitManager.PROXY_SERVER_URL);
        console.log(path, root, url);
        return fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ path, root })
        }).then((res) => res.json());
    }

    private async fetchFromCommit(path: string, root: string, since?: number): Promise<CommitData[]> {
        const url = resolvePath("", GitManager.PROXY_COMMIT_ROUTE, GitManager.PROXY_SERVER_URL);
        return fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ path, root, since })
        }).then((res) => res.json());
    }

    private decodeContent(b64: string) {
        const binary = atob(b64);
        const buffer = Uint8Array.from(binary, (char) => char.codePointAt(0)!);

        return this.textDecoder.decode(buffer);
    }

    private parseUnix(unix: number) {
        const date = new Date(unix);
        
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        return `${day} ${MONTH_NAMES[month]} ${year}`;
    }

    private getLocalStorageKey(name: string, key: string) {
        return `${name} - ${key}`;
    }
}

export type NewsRootName = "blog" | "changelog";

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

interface CommitData { commit: Commit; }
interface Commit { author: Author; }
interface Author { date: string; }