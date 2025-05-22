class CacheService {
  private cache: Map<string, any>;

  constructor() {
    this.cache = new Map();
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Create a singleton instance
export const cacheService = new CacheService();
