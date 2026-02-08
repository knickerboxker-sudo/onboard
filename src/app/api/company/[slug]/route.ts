import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }
    const slug = params.slug;

    // Find events by normalized company name
    const events = await prisma.recallEvent.findMany({
      where: { companyNormalized: slug },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });

    if (events.length === 0) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const displayName = events[0].companyName || slug;
    const now = new Date();
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate()
    );

    const recentEvents = events.filter(
      (e) => new Date(e.publishedAt) >= oneYearAgo
    );

    const categoryCounts: Record<string, number> = {};
    for (const e of events) {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    }

    return NextResponse.json({
      companyNormalized: slug,
      displayName,
      totalRecalls: events.length,
      recallsLast12Months: recentEvents.length,
      byCategory: categoryCounts,
      recentRecalls: events.slice(0, 20),
    });
  } catch (err) {
    console.error("Company fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}
