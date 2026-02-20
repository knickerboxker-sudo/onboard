import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const BLOCKED_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "ymail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.fr",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "pm.me",
]);

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  // Rate limit: 10 requests per 5 minutes per IP
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(clientIp, 10, 5 * 60 * 1000);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { valid: false, reason: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { valid: false, reason: "Invalid email address." },
      { status: 400 },
    );
  }

  const { email } = parsed.data;
  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    return NextResponse.json({ valid: false, reason: "Invalid email address." });
  }

  if (BLOCKED_DOMAINS.has(domain)) {
    return NextResponse.json({
      valid: false,
      reason:
        "Please use a business email address. Personal email providers (Gmail, Yahoo, Outlook, etc.) are not accepted.",
    });
  }

  return NextResponse.json({ valid: true });
}
