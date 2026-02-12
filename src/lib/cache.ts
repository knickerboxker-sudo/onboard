/**
 * Cache module with two backends:
 * - FileCache (dev): writes JSON to ./data/cache
 * - MemoryCache (prod/serverless): LRU map with TTL
 */

import { createHash } from "crypto";
import fs from "fs";
import path from "path";

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS ?? "86400", 10);

interface CacheEntry<T> {
  key: string;
  value: T;
  fetchedAt: number; // epoch ms
  ttlSeconds: number;
}

interface CacheBackend {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/* ── FileCache (dev) ─────────────────────────────────── */

class FileCache implements CacheBackend {
  private dir: string;

  constructor(dir = path.resolve(process.cwd(), "data/cache")) {
    this.dir = dir;
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  private filePath(key: string): string {
    return path.join(this.dir, `${hashKey(key)}.json`);
  }

  async get<T>(key: string): Promise<T | null> {
    const fp = this.filePath(key);
    if (!fs.existsSync(fp)) return null;
    try {
      const raw = fs.readFileSync(fp, "utf-8");
      const entry: CacheEntry<T> = JSON.parse(raw);
      const age = (Date.now() - entry.fetchedAt) / 1000;
      if (age > entry.ttlSeconds) {
        fs.unlinkSync(fp);
        return null;
      }
      return entry.value;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> {
    const entry: CacheEntry<T> = {
      key,
      value,
      fetchedAt: Date.now(),
      ttlSeconds,
    };
    fs.writeFileSync(this.filePath(key), JSON.stringify(entry), "utf-8");
  }

  async delete(key: string): Promise<void> {
    const fp = this.filePath(key);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
}

/* ── MemoryCache (prod / serverless) ─────────────────── */

class MemoryCache implements CacheBackend {
  private maxEntries: number;
  private store = new Map<string, { value: unknown; expiresAt: number }>();

  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
  }

  async get<T>(key: string): Promise<T | null> {
    const h = hashKey(key);
    const entry = this.store.get(h);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(h);
      return null;
    }
    // LRU: move to end
    this.store.delete(h);
    this.store.set(h, entry);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> {
    const h = hashKey(key);
    if (this.store.size >= this.maxEntries) {
      // Evict oldest (first key)
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }
    this.store.set(h, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(hashKey(key));
  }
}

/* ── Auto-select ─────────────────────────────────────── */

let _cache: CacheBackend | null = null;

export function getCache(): CacheBackend {
  if (!_cache) {
    _cache =
      process.env.NODE_ENV === "production"
        ? new MemoryCache()
        : new FileCache();
  }
  return _cache;
}

export type { CacheBackend };
