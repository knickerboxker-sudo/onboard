import type { MemoryItem } from "@prisma/client";

const CACHE_TTL_MS = 60_000;

const memoryCache = new Map<
  string,
  { items: MemoryItem[]; fetchedAt: number }
>();

export function getCachedMemories(userId: string) {
  const entry = memoryCache.get(userId);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    memoryCache.delete(userId);
    return null;
  }
  return entry.items;
}

export function setCachedMemories(userId: string, items: MemoryItem[]) {
  memoryCache.set(userId, { items, fetchedAt: Date.now() });
}

export function clearCachedMemories(userId: string) {
  memoryCache.delete(userId);
}
