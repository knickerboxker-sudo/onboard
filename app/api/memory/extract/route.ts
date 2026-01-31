import { NextResponse } from "next/server";
import { storeExtractedMemories } from "@/lib/memory";
import { getDefaultUserId } from "@/lib/default-user";

export async function POST(request: Request) {
  const userId = await getDefaultUserId();

  const body = await request.json();
  const { content, messageId } = body;
  if (!content || !messageId) {
    return NextResponse.json({ error: "Missing content or messageId" }, { status: 400 });
  }

  const result = await storeExtractedMemories({
    userId,
    messageId,
    content
  });

  return NextResponse.json({ ok: true, reminder: result.reminder });
}
