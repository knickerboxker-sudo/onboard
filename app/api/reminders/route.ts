import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

function buildIcs(reminders: { text: string; dueAt: Date }[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//OnboardAI//EN"];
  reminders.forEach((reminder, index) => {
    const dt = reminder.dueAt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:onboardai-${index}@onboardai`);
    lines.push(`DTSTAMP:${dt}`);
    lines.push(`DTSTART:${dt}`);
    lines.push(`SUMMARY:${reminder.text.replace(/\n/g, " ")}`);
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id },
    orderBy: { dueAt: "asc" }
  });

  if (format === "ics") {
    const ics = buildIcs(reminders);
    return new NextResponse(ics, {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": "attachment; filename=onboardai-reminders.ics"
      }
    });
  }

  return NextResponse.json({ reminders });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder || reminder.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.reminder.update({
    where: { id },
    data: { completed: !reminder.completed }
  });

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id },
    orderBy: { dueAt: "asc" }
  });

  return NextResponse.json({ reminders });
}
