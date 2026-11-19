/**
 * HearMe AI - In-Memory TTL & LRU Cache
 * Implements TRACEN Topic 2 (Caching)
 *
 * Caches AI explanations and conversation summaries to reduce Gemini API calls,
 * improve response latency to <5ms for frequent queries, and protect API quotas.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

export class MemoryCache<T = any> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private maxItems: number;
  private defaultTtlMs: number;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
  };

  constructor(maxItems = 500, defaultTtlSeconds = 3600) {
    this.maxItems = maxItems;
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  /**
   * Normalize cache keys (case-insensitive, whitespace-trimmed)
   */
  private normalizeKey(key: string): string {
    return key.trim().toLowerCase();
  }

  /**
   * Retrieve cached value if valid and not expired
   */
  get(key: string): T | null {
    const normKey = this.normalizeKey(key);
    const entry = this.store.get(normKey);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(normKey);
      this.stats.misses++;
      return null;
    }

    // Update LRU access timestamp
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Store a value with optional custom TTL
   */
  set(key: string, value: T, ttlSeconds?: number): void {
    const normKey = this.normalizeKey(key);
    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTtlMs;

    // LRU eviction if capacity reached
    if (this.store.size >= this.maxItems && !this.store.has(normKey)) {
      this.evictOldest();
    }

    this.store.set(normKey, {
      value,
      expiresAt: Date.now() + ttlMs,
      lastAccessed: Date.now(),
    });

    this.stats.sets++;
  }

  /**
   * Check if key exists and is unexpired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Evict the least recently accessed item (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Purge expired items (called by periodic cron job)
   */
  cleanup(): number {
    const now = Date.now();
    let purged = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        purged++;
      }
    }
    return purged;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Return telemetry statistics
   */
  getStats() {
    return {
      size: this.store.size,
      maxItems: this.maxItems,
      ...this.stats,
      hitRatio:
        this.stats.hits + this.stats.misses > 0
          ? Number(((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(1))
          : 0,
    };
  }
}

// Global cache instances for specific domains
export const signExplainerCache = new MemoryCache(300, 3600 * 2); // 2 hours TTL for sign phrases
export const summarizerCache = new MemoryCache(100, 1800);       // 30 mins TTL for conversation summaries
export const chatCache = new MemoryCache(200, 3600);             // 1 hour TTL for common queries
