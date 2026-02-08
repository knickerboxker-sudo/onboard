import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";

export async function GET(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }
    const url = new URL(req.url);
    const source = url.searchParams.get("source") || undefined;
    const take = parseInt(url.searchParams.get("take") || "50");

    const records = await prisma.rawRecallRecord.findMany({
      where: source ? { source } : undefined,
      orderBy: { fetchedAt: "desc" },
      take,
      select: {
        id: true,
        source: true,
        sourceRecordId: true,
        fetchedAt: true,
        publishedAt: true,
        title: true,
        hash: true,
      },
    });

    return NextResponse.json({ records });
  } catch (err) {
    console.error("Admin raw records error:", err);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
