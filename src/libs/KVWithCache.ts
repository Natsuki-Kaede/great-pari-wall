export type KVWithCache = {
    get: (key: string) => Promise<string|null>;
    deleteCache: (key: string) => Promise<void>;
    getTTL: () => Promise<void>;
  };
  
  /**
   * Returns a KVWithCache object that retrieves KV using caching.
   * @param KVNamespace
   * @returns getの他、getTTLとdeleteCacheのFunctionを持つKVWithCacheオブジェクト
   */
  export const useKVWithCache = (KV: KVNamespace) : KVWithCache => {
    let _ttl = 120;
    const cache = caches.default;
  
    // A KVWithCache object that includes functions for get, getTTL, and deleteCache.
    const cacheprefix = "great-pari-wall";
    return {
      async getTTL() {
        const ttlValue = await this.get("cacheTTL")
        if (Number.isFinite(Number(ttlValue))) {
          _ttl = Number(ttlValue)
        }
      },
      async get(key: string, cacheTTL?: number) {
        const cached = await cache.match(`${cacheprefix}${key}`);
        if (cached && cached.body) {
          return cached.text();
        }
        let value = await KV.get(key);
  
        if (value) {
          const options: ResponseInit = {};
          if (cacheTTL) {
            options.headers = { "Cache-Control": `max-age=${cacheTTL}` };
          }
          cache.put(key, new Response(value,  options));
        }
        return value;
      },
      async deleteCache(key: string) {
        cache.delete(`${cacheprefix}${key}`);
      },
    };
  }