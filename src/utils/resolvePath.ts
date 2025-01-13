export function resolvePath(path: string, root: string = "/", origin: string = window.location.origin) {
    if (path.startsWith("/")) path = path.slice(1);
    [root, origin] = [root, origin].map((str) => str.endsWith("/") ? str : `${str}/`);
    
    return new URL(path, new URL(root, origin))[origin === `${window.location.origin}/` ? "pathname" : "href"];
}