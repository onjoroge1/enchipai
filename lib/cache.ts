import 'server-only';

// Simple in-memory cache
// For production, consider using Redis
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get value from cache
 */
export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Set value in cache
 */
export function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 300 // 5 minutes default
): void {
  cache.set(key, {
    data: value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete value from cache
 */
export function deleteCache(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache
  const cached = getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function
  const result = await fn();

  // Store in cache
  setCache(key, result, ttlSeconds);

  return result;
}

/**
 * Generate cache key from parameters
 */
export function cacheKey(prefix: string, ...params: (string | number)[]): string {
  return `${prefix}:${params.join(':')}`;
}

/**
 * Clean expired cache entries (run periodically)
 */
export function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}

// Clean expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredCache, 5 * 60 * 1000);
}

