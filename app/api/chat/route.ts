import { NextResponse } from "next/server";
import { summarizeMetric, type AreaMetric } from "@/lib/areaHealth";

type ChatPayload = {
  question?: string;
  metrics?: AreaMetric[];
};

function defaultPrompt(metrics: AreaMetric[]) {
  if (metrics.length <= 1) {
    return "Give a short, practical summary of this area. Mention missing data and what it means.";
  }

  return "Compare these areas and highlight trade-offs in air quality, unemployment, food access proxy, and drug recalls. End with one plain-language recommendation.";
}

async function getAnswer(question: string, metrics: AreaMetric[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const context = metrics.map(summarizeMetric).join("\n");

  if (!apiKey) {
    return `Automatic area summary:\n${context}\n\nFocus: ${question}`;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `You are a factual civic health analyst. Explain trade-offs clearly without hyperbole. Data:\n${context}\n\nInstruction: ${question}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return `I could not reach the language model right now.\n${context}`;
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    return (
      data.content?.find((item) => item.type === "text")?.text ??
      `No model response was returned.\n${context}`
    );
  } catch {
    return `I could not process that request right now.\n${context}`;
  }
}

function streamText(text: string) {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    async pull(controller) {
      if (index >= text.length) {
        controller.close();
        return;
      }
      const chunk = text.slice(index, index + 3);
      index += 3;
      controller.enqueue(encoder.encode(chunk));
      await new Promise((resolve) => setTimeout(resolve, 15));
    },
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as ChatPayload;
  const metrics = body.metrics ?? [];

  if (!metrics.length) {
    return NextResponse.json({ error: "At least one location result is required." }, { status: 400 });
  }

  const question = body.question?.trim() || defaultPrompt(metrics);
  const answer = await getAnswer(question, metrics);
  return new Response(streamText(answer), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
