export async function fetchAndCache(path: string, cache: Cache, forceFetch: boolean = false, init: RequestInit = {}) {
    return caches.match(path).then(async (res) => {
        if (res && !forceFetch) return res;
        
        res = await fetch(path, init);
        cache.put(path, res.clone());

        return res;
    });
}