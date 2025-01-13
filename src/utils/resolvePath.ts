export function resolvePath(path: string, root: string = "/", origin: string = window.location.origin) {
    if (path.startsWith("/")) path = path.slice(1);
    [root, origin] = [root, origin].map((str) => str.endsWith("/") ? str : `${str}/`);
    
    return new URL(path, new URL(root, origin)).href.slice(window.location.origin.length * +(origin === `${window.location.origin}/`));
}