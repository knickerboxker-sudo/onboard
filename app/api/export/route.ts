import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultUserId } from "@/lib/default-user";
import { getMissingEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const missingEnv = getMissingEnv(["DATABASE_URL"]);
  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        error: "Missing environment configuration.",
        missing: missingEnv
      },
      { status: 500 }
    );
  }

  const userId = await getDefaultUserId();

  const [messages, memories, reminders] = await Promise.all([
    prisma.message.findMany({ where: { userId } }),
    prisma.memoryItem.findMany({ where: { userId } }),
    prisma.reminder.findMany({ where: { userId } })
  ]);

  return NextResponse.json({ messages, memories, reminders });
}
