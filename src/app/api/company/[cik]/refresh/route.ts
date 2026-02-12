import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeMetrics } from "@/src/lib/metrics";
import { normalizeCik } from "@/src/lib/cik";

const paramsSchema = z.object({
  cik: z.string().min(1).max(10),
});

// Basic per-IP rate limiting (in-memory, resets on restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { cik: string } }
) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many refresh requests. Please wait." },
        { status: 429 }
      );
    }

    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid CIK" }, { status: 400 });
    }

    const cik = normalizeCik(parsed.data.cik);
    const metrics = await computeMetrics(cik, true);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh data." },
      { status: 500 }
    );
  }
}
