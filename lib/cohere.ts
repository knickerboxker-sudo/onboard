import { CohereClient } from "cohere-ai";

const apiKey = process.env.COHERE_API_KEY;
if (!apiKey) {
  throw new Error("COHERE_API_KEY is not set");
}

export const cohere = new CohereClient({ token: apiKey });

export async function generateEmbedding(text: string, type: "search_document" | "search_query") {
  const response = await cohere.embed({
    model: "embed-english-v3.0",
    texts: [text],
    inputType: type
  });

  return response.embeddings[0] as number[];
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
    }));

  const lastMessage = messages[messages.length - 1];
  const response = await cohere.chat({
    model: "command-r",
    message: lastMessage.content,
    temperature,
    preamble: systemMessage?.content,
    chatHistory
  });

  return response.text ?? "";
}

export async function cohereExtractJson(prompt: string) {
  const response = await cohere.chat({
    model: "command-r",
    message: prompt,
    temperature: 0.1
  });

  return response.text ?? "";
}
