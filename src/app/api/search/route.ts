import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchCompanies } from "@/src/lib/search";

const querySchema = z.object({
  q: z.string().min(1).max(100),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ q: searchParams.get("q") ?? "" });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameter" },
        { status: 400 }
      );
    }

    const results = await searchCompanies(parsed.data.q);
    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}
