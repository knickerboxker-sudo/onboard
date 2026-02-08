import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const feedbackFilePath = path.join(process.cwd(), "data", "feedback.json");

type FeedbackEntry = {
  id: string;
  name?: string;
  email?: string;
  message: string;
  createdAt: string;
};

async function readFeedbackEntries(): Promise<FeedbackEntry[]> {
  await fs.mkdir(path.dirname(feedbackFilePath), { recursive: true });
  try {
    const contents = await fs.readFile(feedbackFilePath, "utf-8");
    const parsed = JSON.parse(contents) as FeedbackEntry[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
  await fs.writeFile(feedbackFilePath, "[]", "utf-8");
  return [];
}

async function writeFeedbackEntries(entries: FeedbackEntry[]) {
  await fs.writeFile(feedbackFilePath, JSON.stringify(entries, null, 2), "utf-8");
}

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!payload?.message || payload.message.trim().length === 0) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 },
    );
  }

  const newEntry: FeedbackEntry = {
    id: crypto.randomUUID(),
    name: payload.name?.trim() || undefined,
    email: payload.email?.trim() || undefined,
    message: payload.message.trim(),
    createdAt: new Date().toISOString(),
  };

  const entries = await readFeedbackEntries();
  entries.unshift(newEntry);
  await writeFeedbackEntries(entries);

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Admin password is not configured." },
      { status: 500 },
    );
  }

  const providedPassword = request.headers.get("x-admin-password");
  if (!providedPassword || providedPassword !== adminPassword) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  const entries = await readFeedbackEntries();
  return NextResponse.json({ entries });
}
