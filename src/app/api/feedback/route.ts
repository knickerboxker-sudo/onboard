import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { getEnv } from "@/src/lib/env";

// Rate limiting store (in-memory)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Validation schema for feedback
const feedbackSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().max(200).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

// Prohibited content patterns
const prohibitedPatterns: RegExp[] = [
  /\b(?:kill|murder|assassinate|bomb|terrorist|terrorism)\b/i,
  /\b(?:cocaine|heroin|meth|fentanyl|opioids|weed|marijuana|ecstasy)\b/i,
  /\b(?:child\s?porn|sexual\s?assault|sex\s?trafficking)\b/i,
  /\b(?:hate\s?speech|racial\s?slur)\b/i,
  /\b(?:rape|molest|abuse)\b/i,
];

/**
 * Checks if message contains prohibited content.
 */
function containsProhibitedContent(message: string): boolean {
  return prohibitedPatterns.some((pattern) => pattern.test(message));
}

/**
 * Checks rate limit for IP address.
 * Allows 3 submissions per hour per IP.
 */
function checkRateLimit(ip: string): { allowed: boolean; resetIn?: number } {
  const now = Date.now();
  const key = `feedback:${ip}`;
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    rateLimitStore.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 }); // 1 hour
    return { allowed: true };
  }

  if (limit.count >= 3) {
    const resetIn = Math.ceil((limit.resetAt - now) / 1000 / 60); // minutes
    return { allowed: false, resetIn };
  }

  limit.count += 1;
  return { allowed: true };
}

/**
 * Extracts IP address from request.
 */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * Creates and sends feedback email.
 */
async function sendFeedbackEmail(data: {
  name?: string;
  email?: string;
  message: string;
}): Promise<void> {
  const env = getEnv();
  
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #355d77 0%, #2f5269 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .content { background: #ffffff; border: 1px solid #dfe5ec; border-top: none; padding: 30px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: 600; color: #52616f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .field-value { background: #f7f9fc; padding: 12px; border-radius: 6px; border: 1px solid #dfe5ec; }
    .message { white-space: pre-wrap; word-wrap: break-word; }
    .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #dfe5ec; font-size: 12px; color: #52616f; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📬 New Feedback from sortir</h1>
  </div>
  <div class="content">
    ${data.name ? `
    <div class="field">
      <div class="field-label">Name</div>
      <div class="field-value">${escapeHtml(data.name)}</div>
    </div>
    ` : ''}
    ${data.email ? `
    <div class="field">
      <div class="field-label">Email</div>
      <div class="field-value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>
    </div>
    ` : ''}
    <div class="field">
      <div class="field-label">Message</div>
      <div class="field-value message">${escapeHtml(data.message)}</div>
    </div>
    <div class="field">
      <div class="field-label">Submitted</div>
      <div class="field-value">${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'long' })}</div>
    </div>
  </div>
  <div class="footer">
    This feedback was submitted via sortir.app
  </div>
</body>
</html>
  `.trim();

  const textContent = `
New Feedback from sortir
========================

${data.name ? `Name: ${data.name}\n` : ''}${data.email ? `Email: ${data.email}\n` : ''}
Message:
${data.message}

Submitted: ${new Date().toISOString()}
  `.trim();

  await transporter.sendMail({
    from: `"sortir Feedback" <${env.SMTP_FROM}>`,
    to: env.FEEDBACK_EMAIL,
    subject: `New Feedback${data.name ? ` from ${data.name}` : ''}`,
    text: textContent,
    html: htmlContent,
  });
}

/**
 * Escapes HTML special characters.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Please try again in ${rateLimit.resetIn} minutes.`,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = feedbackSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { error: `Validation error: ${errors}` },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check for prohibited content
    if (containsProhibitedContent(data.message)) {
      return NextResponse.json(
        {
          error: "Feedback contains inappropriate or illegal language. Please revise and try again.",
        },
        { status: 400 }
      );
    }

    // Send email
    await sendFeedbackEmail(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback submission error:", error);
    
    // Don't expose internal errors to users
    return NextResponse.json(
      { error: "Failed to submit feedback. Please try again later." },
      { status: 500 }
    );
  }
}

