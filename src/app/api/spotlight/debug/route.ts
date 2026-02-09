import { NextRequest, NextResponse } from "next/server";
import { fetchRecallResults } from "@/src/lib/api-fetcher";
import {
  buildRecallDataset,
} from "@/src/lib/recall-pipeline";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const companyId = url.searchParams.get("companyId");
  if (!companyId) {
    return NextResponse.json({ error: "companyId is required." }, { status: 400 });
  }

  try {
    const { results } = await fetchRecallResults({ dateRange: "all" });
    const { recalls, companies } = buildRecallDataset(results);
    const company = companies.find((c) => c.id === companyId);
    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 });
    }

    const linkedRecalls = recalls.filter((recall) =>
      recall.companyLinks.some((link) => link.companyId === companyId)
    );

    const sample = linkedRecalls
      .slice(0, 10)
      .map((recall) => ({
        source_agency: recall.sourceAgency,
        source_recall_id: recall.sourceRecallId,
        title: recall.title,
      }));

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.canonicalName,
      },
      distinct_recall_count: linkedRecalls.length,
      sample_recall_ids: sample,
    });
  } catch (err) {
    console.error("Spotlight debug API error:", err);
    return NextResponse.json(
      { error: "Failed to load debug data." },
      { status: 500 }
    );
  }
}
