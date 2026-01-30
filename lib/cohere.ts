import { CohereClient } from "cohere-ai";

const apiKey = process.env.COHERE_API_KEY;
let cohereClient: CohereClient | null = null;

function getCohereClient() {
  if (!apiKey) {
    throw new Error("COHERE_API_KEY is not set");
  }
  if (!cohereClient) {
    cohereClient = new CohereClient({ token: apiKey });
  }
  return cohereClient;
}

export async function generateEmbedding(text: string, type: "search_document" | "search_query") {
  const response = await getCohereClient().embed({
    model: "embed-english-v3.0",
    texts: [text],
    inputType: type
  });

  if (Array.isArray(response.embeddings) && Array.isArray(response.embeddings[0])) {
    return response.embeddings[0] as number[];
  }

  const byType = response.embeddings as {
    prompt?: number[][];
    document?: number[][];
    search_document?: number[][];
    search_query?: number[][];
  };

  const fromType =
    byType?.search_document?.[0] ??
    byType?.search_query?.[0] ??
    byType?.prompt?.[0] ??
    byType?.document?.[0];

  return (fromType ?? []) as number[];
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function cohereChat(
  messages: ChatMessage[],
  temperature = 0.4
) {
  const systemMessage = messages.find((message) => message.role === "system");
  const chatHistory = messages
    .filter((message) => message.role !== "system")
    .slice(0, -1)
    .map((message) => ({
      role: message.role === "assistant" ? "CHATBOT" : "USER",
      message: message.content
    })) as { role: "CHATBOT" | "USER"; message: string }[];

  const lastMessage = messages[messages.length - 1];
  const response = await getCohereClient().chat({
    model: "command-r",
    message: lastMessage.content,
    temperature,
    preamble: systemMessage?.content,
    chatHistory
  });

  return response.text ?? "";
}

export async function cohereExtractJson(prompt: string) {
  const response = await getCohereClient().chat({
    model: "command-r",
    message: prompt,
    temperature: 0.1
  });

  return response.text ?? "";
}
