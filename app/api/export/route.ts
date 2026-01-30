import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [messages, memories, reminders] = await Promise.all([
    prisma.message.findMany({ where: { userId: session.user.id } }),
    prisma.memoryItem.findMany({ where: { userId: session.user.id } }),
    prisma.reminder.findMany({ where: { userId: session.user.id } })
  ]);

  return NextResponse.json({ messages, memories, reminders });
}
