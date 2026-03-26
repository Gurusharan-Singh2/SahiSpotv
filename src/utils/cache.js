import { getRedis } from "../config/redis.js";

/**
 * Get a cached value by key, automatically parses JSON.
 */
export async function cacheGet(key) {
  try {
    const redis = getRedis();
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    console.warn("Cache GET error:", err.message);
    return null;
  }
}

/**
 * Set a cache key with optional TTL (seconds). Serialises value to JSON.
 */
export async function cacheSet(key, value, ttlSeconds = 60) {
  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.warn("Cache SET error:", err.message);
  }
}

/**
 * Delete one or more cache keys.
 */
export async function cacheDel(...keys) {
  try {
    const redis = getRedis();
    await redis.del(...keys);
  } catch (err) {
    console.warn("Cache DEL error:", err.message);
  }
}

/**
 * Cache-aside pattern helper.
 * Tries to fetch from cache; if miss, calls `fetchFn`, stores result, returns it.
 */
export async function withCache(key, fetchFn, ttlSeconds = 60) {
  const cached = await cacheGet(key);
  if (cached !== null) return cached;

  const fresh = await fetchFn();
  if (fresh !== null && fresh !== undefined) {
    await cacheSet(key, fresh, ttlSeconds);
  }
  return fresh;
}
