import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeMetrics } from "@/src/lib/metrics";
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
    const metrics = await computeMetrics(cik);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Metrics computation error:", error);
    return NextResponse.json(
      { error: "Failed to compute metrics." },
      { status: 500 }
    );
  }
}
