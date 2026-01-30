import { prisma } from "./db";
import { cohereChat, cohereExtractJson, generateEmbedding } from "./cohere";
import { cosineSimilarity } from "./embeddings";
import { getCachedMemories, setCachedMemories, clearCachedMemories } from "./memory-cache";
import { parseReminder } from "./reminder-parser";

export const SYSTEM_PROMPT = `You are OnboardAI, a Job Ramp Coach.\n\nGuidelines:\n- Be concise, action-oriented, and helpful.\n- Provide next steps, checklists, and quick summaries.\n- Ask clarifying questions only when essential.\n- Never fabricate facts; use the MEMORY section if provided.\n- If no memory applies, be honest and propose what to capture.\n`;

const MEMORY_EXTRACTION_PROMPT = `Extract 1-6 memory items and reminder intent from the user message.\nReturn STRICT JSON with this schema:\n{\n  "items": [\n    { "type": "person|tool|procedure|acronym|fact|preference", "title": "...", "content": "..." }\n  ],\n  "reminder": { "shouldCreate": true|false, "text": "...", "dueAtISO": "..." }\n}\nIf no memory items, return an empty array. If no reminder, set shouldCreate=false and empty text/dueAtISO.\n\nUser message:\n"""{{MESSAGE}}"""`;

type ExtractedMemory = {
  items: { type: string; title: string; content: string }[];
  reminder: { shouldCreate: boolean; text: string; dueAtISO: string };
};

const ALLOWED_TYPES = new Set([
  "person",
  "tool",
  "procedure",
  "acronym",
  "fact",
  "preference",
  "profile_summary"
]);

function safeJsonParse(text: string) {
  try {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    return null;
  }
}

async function extractWithRetry(message: string): Promise<ExtractedMemory> {
  const prompt = MEMORY_EXTRACTION_PROMPT.replace("{{MESSAGE}}", message);
  const raw = await cohereExtractJson(prompt);
  const parsed = safeJsonParse(raw);
  if (parsed) {
    return parsed as ExtractedMemory;
  }

  const fixPrompt = `Fix the JSON to match the schema exactly. Only return JSON.\n\nJSON:\n${raw}`;
  const fixed = await cohereExtractJson(fixPrompt);
  const parsedFixed = safeJsonParse(fixed);
  if (!parsedFixed) {
    return {
      items: [],
      reminder: { shouldCreate: false, text: "", dueAtISO: "" }
    };
  }
  return parsedFixed as ExtractedMemory;
}

export async function storeExtractedMemories({
  userId,
  messageId,
  content
}: {
  userId: string;
  messageId: string;
  content: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.privateMode) {
    return { reminder: null };
  }

  const extracted = await extractWithRetry(content);
  const memoryItems = [];

  for (const item of extracted.items ?? []) {
    if (!item?.content || !item?.title) {
      continue;
    }
    const type = ALLOWED_TYPES.has(item.type) ? item.type : "fact";
    const embedding = await generateEmbedding(item.content, "search_document");
    const memory = await prisma.memoryItem.create({
      data: {
        userId,
        type,
        title: item.title,
        content: item.content,
        sourceMessageId: messageId,
        embedding
      }
    });
    memoryItems.push(memory);
  }

  clearCachedMemories(userId);

  let reminder = null;
  if (extracted.reminder?.shouldCreate) {
    const dueAtISO = extracted.reminder.dueAtISO;
    reminder = await prisma.reminder.create({
      data: {
        userId,
        text: extracted.reminder.text || content,
        dueAt: dueAtISO ? new Date(dueAtISO) : new Date(),
        sourceMessageId: messageId
      }
    });
  } else {
    const parsedDue = parseReminder(content);
    if (parsedDue) {
      reminder = await prisma.reminder.create({
        data: {
          userId,
          text: content,
          dueAt: parsedDue,
          sourceMessageId: messageId
        }
      });
    }
  }

  return { reminder };
}

export async function retrieveRelevantMemories({
  userId,
  query,
  topK = 6
}: {
  userId: string;
  query: string;
  topK?: number;
}) {
  const cached = getCachedMemories(userId);
  const memoryItems =
    cached ??
    (await prisma.memoryItem.findMany({
      where: { userId, archived: false },
      orderBy: { createdAt: "desc" },
      take: 2000
    }));

  if (!cached) {
    setCachedMemories(userId, memoryItems);
  }

  if (memoryItems.length === 0) {
    return [];
  }

  const queryEmbedding = await generateEmbedding(query, "search_query");
  const scored = memoryItems
    .filter((item) => Array.isArray(item.embedding))
    .map((item) => ({
      item,
      score: cosineSimilarity(queryEmbedding, item.embedding as number[])
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ item }) => item);

  return scored;
}

export async function maybeRefreshProfileSummary(userId: string) {
  const messageCount = await prisma.message.count({
    where: { userId, role: "user" }
  });
  if (messageCount === 0 || messageCount % 50 !== 0) {
    return;
  }

  const latestMessages = await prisma.message.findMany({
    where: { userId, role: "user" },
    orderBy: { createdAt: "desc" },
    take: 25
  });

  const summaryPrompt = `Summarize the user's job context, responsibilities, key tools, and current goals in 5-7 bullets. Keep it concise.\n\nMessages:\n${latestMessages
    .map((message) => `- ${message.content}`)
    .join("\n")}`;

  const summary = await cohereChat([
    { role: "user", content: summaryPrompt }
  ]);

  await prisma.memoryItem.updateMany({
    where: { userId, type: "profile_summary" },
    data: { archived: true }
  });

  const embedding = await generateEmbedding(summary, "search_document");
  await prisma.memoryItem.create({
    data: {
      userId,
      type: "profile_summary",
      title: "Profile Summary",
      content: summary,
      embedding
    }
  });

  clearCachedMemories(userId);
}
