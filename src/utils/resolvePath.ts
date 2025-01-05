export function resolvePath(path: string, root: string = "/") {
    return new URL(path, `${new URL(root.slice(0, root.length - +root.endsWith("/")), window.location.origin).href}/`).href;
}