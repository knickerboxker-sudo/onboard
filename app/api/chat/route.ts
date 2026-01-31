import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SYSTEM_PROMPT, maybeRefreshProfileSummary, retrieveRelevantMemories, storeExtractedMemories } from "@/lib/memory";
import { cohereChat } from "@/lib/cohere";
import { checkRateLimit } from "@/lib/rate-limit";
import { getDefaultUserId } from "@/lib/default-user";

export async function POST(request: Request) {
  const userId = await getDefaultUserId();

  const rate = checkRateLimit(userId);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await request.json();
  const { content, isNote, audioPath } = body;

  if (!content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const userMessage = await prisma.message.create({
    data: {
      userId,
      role: "user",
      content,
      isNote: Boolean(isNote),
      audioPath: audioPath ?? null
    }
  });

  const memories = await retrieveRelevantMemories({
    userId,
    query: content,
    topK: 6
  });

  const memorySection = memories
    .map((item: { type: string; title: string; content: string }) => `- (${item.type}) ${item.title}: ${item.content}`)
    .join("\n");

  const systemPrompt = `${SYSTEM_PROMPT}\n\nMEMORY:\n${memorySection || "(none)"}`;

  const assistantText = await cohereChat([
    { role: "system", content: systemPrompt },
    { role: "user", content }
  ]);

  await prisma.message.create({
    data: {
      userId,
      role: "assistant",
      content: assistantText
    }
  });

  await storeExtractedMemories({
    userId,
    messageId: userMessage.id,
    content
  });

  await maybeRefreshProfileSummary(userId);

  const encoder = new TextEncoder();
  const chunks = assistantText.match(/.{1,120}/g) ?? [];

  const stream = new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => {
        controller.enqueue(encoder.encode(chunk));
      });
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}

export async function PUT() {
  const userId = await getDefaultUserId();

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 120
  });

  return NextResponse.json({ messages });
}
