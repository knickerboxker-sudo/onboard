import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";

export async function GET() {
  const userId = await getDefaultUserId();

  const [messages, memories, reminders] = await Promise.all([
    prisma.message.findMany({ where: { userId } }),
    prisma.memoryItem.findMany({ where: { userId } }),
    prisma.reminder.findMany({ where: { userId } })
  ]);

  return NextResponse.json({ messages, memories, reminders });
}
