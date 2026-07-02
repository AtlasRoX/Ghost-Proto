export interface CacheEntry<T> {
  value: T;
  createdAt: number;
  ttlMs: number;
}

export class MemoryPolicies {
  private cache = new Map<string, CacheEntry<any>>();

  public set<T>(key: string, value: T, ttlMs = 60000): void {
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      ttlMs
    });
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.createdAt > entry.ttlMs;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.createdAt > entry.ttlMs) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }
}
