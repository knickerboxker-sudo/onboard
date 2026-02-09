import { NextRequest, NextResponse } from "next/server";
import { fetchRecallResults } from "@/src/lib/api-fetcher";
import {
  buildRecallDataset,
  parseRecallOccurrenceId,
} from "@/src/lib/recall-pipeline";

export async function GET(
  _req: NextRequest,
  { params }: { params: { recallId: string } }
) {
  const parsed = parseRecallOccurrenceId(params.recallId);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid recall ID." }, { status: 400 });
  }

  try {
    const { results } = await fetchRecallResults({ dateRange: "all" });
    const { recalls, companies } = buildRecallDataset(results);
    const recall = recalls.find(
      (item) =>
        item.sourceAgency === parsed.sourceAgency &&
        item.sourceRecallId === parsed.sourceRecallId
    );

    if (!recall) {
      return NextResponse.json({ error: "Recall not found." }, { status: 404 });
    }

    const companyLookup = new Map(companies.map((c) => [c.id, c.canonicalName]));
    return NextResponse.json({
      recall: {
        id: recall.id,
        source_agency: recall.sourceAgency,
        source_recall_id: recall.sourceRecallId,
        title: recall.title,
        summary: recall.summary,
        recalled_at: recall.recalledAt,
        published_at: recall.publishedAt,
        status: recall.status,
        classification: recall.classification,
        hazard: recall.hazard,
        sector: recall.sector,
        source_url: recall.sourceUrl,
      },
      companies: recall.companyLinks.map((link) => ({
        company_id: link.companyId,
        company_name:
          companyLookup.get(link.companyId) || link.rawCompanyName,
        role: link.role,
        raw_company_name: link.rawCompanyName,
      })),
      products: recall.products.map((product) => ({
        id: product.id,
        product_name: product.productName,
        product_description: product.productDescription,
        brand: product.brand,
        model: product.model,
        lot_codes: product.lotCodes,
        upc_gtin: product.upcGtin,
        quantity_affected: product.quantityAffected,
        source_product_id: product.sourceProductId,
      })),
    });
  } catch (err) {
    console.error("Recall detail API error:", err);
    return NextResponse.json(
      { error: "Failed to load recall detail." },
      { status: 500 }
    );
  }
}
