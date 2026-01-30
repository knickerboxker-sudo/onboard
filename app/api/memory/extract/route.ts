import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { storeExtractedMemories } from "@/lib/memory";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content, messageId } = body;
  if (!content || !messageId) {
    return NextResponse.json({ error: "Missing content or messageId" }, { status: 400 });
  }

  const result = await storeExtractedMemories({
    userId: session.user.id,
    messageId,
    content
  });

  return NextResponse.json({ ok: true, reminder: result.reminder });
}
