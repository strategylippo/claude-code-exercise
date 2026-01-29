// Cache Service with memory leak

interface CacheEntry<T> {
  value: T;
  createdAt: Date;
  accessCount: number;
}

// BUG: Cache grows unbounded - no eviction policy
export class CacheService<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();

  // BUG 1: No maximum size limit
  // BUG 2: No TTL (time-to-live) for entries
  // BUG 3: No eviction of stale entries

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      createdAt: new Date(),
      accessCount: 0,
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.accessCount++;
      return entry.value;
    }
    return undefined;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  // BUG 4: This method exists but is never called automatically
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // BUG 5: Clear is available but never called
  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // BUG 6: This creates a copy of all keys, consuming memory
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Singleton instance - BUG: Global cache never cleaned
export const globalCache = new CacheService();

// BUG 7: This function creates new cache entries on every request
export function cacheUserData(userId: string, userData: object): void {
  // Creates unique key per request timestamp, never cleaning old ones
  const key = `user:${userId}:${Date.now()}`;
  globalCache.set(key, userData);
}

// BUG 8: Caches request data without cleanup
export function cacheRequestData(requestId: string, data: object): void {
  globalCache.set(`request:${requestId}`, data);
  // Never deleted after request completes!
}
