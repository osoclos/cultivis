export async function fetchAndCache(path: string, cache: Cache) {
    return caches.match(path).then(async (res) => {
        if (res) return res;
        
        res = await fetch(path);
        cache.put(path, res.clone());

        return res;
    });
}