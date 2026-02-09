/**
 * Semantic search enhancement using Cohere Chat API.
 *
 * This module is entirely optional – when COHERE_API_KEY is not configured
 * the exported helper gracefully falls back to basic keyword detection.
 */

import { checkRateLimit } from "@/src/lib/rate-limit";

// ── Types ───────────────────────────────────────────────────────────────────

export type SearchIntent = {
  expandedQueries: string[];
  category?: string;
  isVehicleFocused: boolean;
  isBrandFocused: boolean;
};

type CacheEntry = {
  intent: SearchIntent;
  timestamp: number;
};

// ── Constants ───────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const COHERE_CHAT_URL = "https://api.cohere.ai/v1/chat";
const COHERE_MODEL = "command-r7b-12-2024";
/** Hard ceiling on Cohere calls per calendar month to prevent runaway costs. */
const MONTHLY_CALL_LIMIT = 10_000;

// ── In-memory cache ─────────────────────────────────────────────────────────

const intentCache = new Map<string, CacheEntry>();

/** Tracks how many Cohere API calls have been made this calendar month. */
let monthlyCallCount = 0;
let monthlyCallMonth = new Date().getMonth();

// Clean up stale entries every hour.
// unref() allows the Node process to exit even if this timer is still active
// (important for serverless / test environments).
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of intentCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      intentCache.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);
if (typeof cleanupTimer?.unref === "function") cleanupTimer.unref();

// ── Keyword fallback helpers ────────────────────────────────────────────────

const VEHICLE_KEYWORDS = [
  "car",
  "auto",
  "vehicle",
  "truck",
  "suv",
  "sedan",
  "van",
  "motorcycle",
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  vehicle: VEHICLE_KEYWORDS,
  food: ["food", "meat", "poultry", "chicken", "beef", "pork", "egg", "dairy"],
  drug: ["drug", "medication", "pharmaceutical", "medicine", "pill", "tablet"],
  device: ["device", "medical device", "implant", "pump", "monitor"],
  consumer: ["toy", "furniture", "appliance", "electronic", "clothing"],
  environmental: ["chemical", "pesticide", "pollution", "toxic", "epa"],
  marine: ["boat", "kayak", "marine", "watercraft", "life jacket"],
};

function fallbackIntent(query: string): SearchIntent {
  const lower = query.toLowerCase();
  let detectedCategory: string | undefined;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      detectedCategory = category;
      break;
    }
  }

  const isVehicleFocused = VEHICLE_KEYWORDS.some((kw) => lower.includes(kw));
  const isBrandFocused = /^[A-Z]/.test(query) && query.split(/\s+/).length <= 3;

  return {
    expandedQueries: [query],
    category: detectedCategory,
    isVehicleFocused,
    isBrandFocused,
  };
}

// ── Main export ─────────────────────────────────────────────────────────────

export async function enhanceSearchIntent(
  query: string
): Promise<SearchIntent> {
  const cacheKey = query.trim().toLowerCase();

  // 1. Check cache
  const cached = intentCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.intent;
  }

  // 2. Check for API key
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    return fallbackIntent(query);
  }

  // 3. Rate-limit: 100 calls / minute
  const rl = checkRateLimit("cohere-semantic", {
    maxRequests: 100,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return fallbackIntent(query);
  }

  // 4. Monthly budget cap – reset counter on new month
  const currentMonth = new Date().getMonth();
  if (currentMonth !== monthlyCallMonth) {
    monthlyCallCount = 0;
    monthlyCallMonth = currentMonth;
  }
  if (monthlyCallCount >= MONTHLY_CALL_LIMIT) {
    console.warn(
      `[${new Date().toISOString()}] Cohere monthly call limit (${MONTHLY_CALL_LIMIT}) reached – falling back to keyword matching`
    );
    return fallbackIntent(query);
  }

  // 5. Call Cohere Chat API
  try {
    const prompt = [
      "Analyze this product recall search query and identify:",
      "(1) the product category (vehicle/food/drug/device/consumer/environmental/marine),",
      "(2) whether it's a vehicle brand search,",
      "(3) whether it's a specific brand/company search.",
      `Query: ${query}.`,
      "Respond with JSON only.",
    ].join(" ");

    const response = await fetch(COHERE_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: COHERE_MODEL,
        message: prompt,
        temperature: 0,
      }),
    });

    monthlyCallCount++;

    if (!response.ok) {
      console.error(
        `[${new Date().toISOString()}] Cohere API error: ${response.status}`
      );
      return fallbackIntent(query);
    }

    const data = await response.json();
    const text: string = data?.text ?? data?.message ?? "";

    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallbackIntent(query);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const intent: SearchIntent = {
      expandedQueries: Array.isArray(parsed.expandedQueries)
        ? parsed.expandedQueries
        : [query],
      category: typeof parsed.category === "string" ? parsed.category : undefined,
      isVehicleFocused: Boolean(parsed.isVehicleFocused ?? parsed.is_vehicle_focused),
      isBrandFocused: Boolean(parsed.isBrandFocused ?? parsed.is_brand_focused),
    };

    // Cache successful result
    intentCache.set(cacheKey, { intent, timestamp: Date.now() });
    return intent;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Cohere enhanceSearchIntent failed:`,
      error instanceof Error ? error.message : error
    );
    return fallbackIntent(query);
  }
}
