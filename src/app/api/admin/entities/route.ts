import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/server/db/prisma";
import { normalizeName } from "@/src/server/normalize/utils";

export async function GET() {
  try {
    const aliases = await prisma.entityAlias.findMany({
      orderBy: { canonical: "asc" },
    });

    return NextResponse.json({ aliases });
  } catch (err) {
    console.error("Admin entities error:", err);
    return NextResponse.json(
      { error: "Failed to fetch entities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, canonical, alias } = await req.json();

    if (!type || !canonical || !alias) {
      return NextResponse.json(
        { error: "type, canonical, and alias are required" },
        { status: 400 }
      );
    }

    const normalizedAlias = normalizeName(alias);

    const entity = await prisma.entityAlias.upsert({
      where: {
        type_normalizedAlias: {
          type,
          normalizedAlias,
        },
      },
      update: {
        canonical,
        alias,
        source: "manual",
        confidence: 100,
      },
      create: {
        type,
        canonical,
        alias,
        normalizedAlias,
        source: "manual",
        confidence: 100,
      },
    });

    return NextResponse.json({ entity });
  } catch (err) {
    console.error("Admin entity create error:", err);
    return NextResponse.json(
      { error: "Failed to create entity alias" },
      { status: 500 }
    );
  }
}
