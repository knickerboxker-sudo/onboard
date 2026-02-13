import { analyzeMarket } from "@/lib/bls";
import { CohereClient } from "cohere-ai";
import { NextRequest, NextResponse } from "next/server";

const MAX_USER_MESSAGE_LENGTH = 500;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = analyzeMarket(body);
  if ("error" in result) return NextResponse.json(result);

  const userMessage =
    typeof body.message === "string" ? body.message.slice(0, MAX_USER_MESSAGE_LENGTH) : "Help me choose a role.";
  const fallbackResponse = `${result.occupation.title} currently looks ${result.metrics.marketSignal.toLowerCase()} with ${result.projectedGrowthPct}% projected growth. A good next step is to compare your interests with these paths: ${result.careerPaths.join(", ")}.`;

  let assistantMessage = fallbackResponse;
  const token = process.env.COHERE_API_KEY;
  if (token) {
    try {
      const cohere = new CohereClient({ token });
      const completion = await cohere.chat({
        message: `User goal: ${userMessage}\nOccupation: ${result.occupation.title}\nSignal: ${result.metrics.marketSignal}\nGrowth: ${result.projectedGrowthPct}%\nMedian wage for selection: ${result.selectedWage}\nCareer paths: ${result.careerPaths.join(", ")}\nRespond as a concise career coach in 4-6 sentences with concrete next steps.`,
        model: process.env.COHERE_MODEL || undefined,
      });
      if (completion.text) assistantMessage = completion.text;
    } catch (error) {
      console.error("Cohere chat fallback triggered", error);
      assistantMessage = fallbackResponse;
    }
  }

  return NextResponse.json({ ...result, assistantMessage });
}
