import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchCompany } from "@/src/lib/metrics";
import { normalizeCik } from "@/src/lib/cik";

const paramsSchema = z.object({
  cik: z.string().min(1).max(10),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { cik: string } }
) {
  try {
    const parsed = paramsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid CIK" }, { status: 400 });
    }

    const cik = normalizeCik(parsed.data.cik);
    const { company, filings } = await fetchCompany(cik);

    return NextResponse.json({ company, filings });
  } catch (error) {
    console.error("Company fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company data." },
      { status: 500 }
    );
  }
}
