import { NextRequest, NextResponse } from "next/server";
import { checkJobsAuth, unauthorizedResponse } from "@/src/lib/auth";
import { prisma } from "@/src/server/db/prisma";

export async function GET(req: NextRequest) {
  if (!checkJobsAuth(req)) {
    return unauthorizedResponse();
  }

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
