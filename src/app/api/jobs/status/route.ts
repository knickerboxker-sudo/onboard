import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";

export async function GET() {
  try {
    const runs = await prisma.sourceJobRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ runs });
  } catch (err) {
    console.error("Jobs status error:", err);
    return NextResponse.json(
      { error: "Failed to fetch job status" },
      { status: 500 }
    );
  }
}
