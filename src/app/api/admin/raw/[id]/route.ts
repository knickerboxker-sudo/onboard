import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }
    const record = await prisma.rawRecallRecord.findUnique({
      where: { id: params.id },
    });

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (err) {
    console.error("Admin raw record error:", err);
    return NextResponse.json(
      { error: "Failed to fetch record" },
      { status: 500 }
    );
  }
}
