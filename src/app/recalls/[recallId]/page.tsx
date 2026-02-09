"use client";

import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { useEffect, useState } from "react";
import {
  formatDate,
  sectorLabel,
  sectorColor,
  sourceLabel,
} from "@/src/lib/utils";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Shield,
  Building2,
  Package,
} from "lucide-react";

type RecallDetailResponse = {
  recall: {
    id: string;
    source_agency: string;
    source_recall_id: string;
    title: string;
    summary: string;
    recalled_at: string;
    published_at: string;
    status?: string;
    classification?: string;
    hazard?: string;
    sector: string;
    source_url: string;
  };
  companies: {
    company_id: string;
    company_name: string;
    role: string;
    raw_company_name: string;
  }[];
  products: {
    id: string;
    product_name: string;
    product_description?: string;
    brand?: string;
    model?: string;
    lot_codes?: string;
    upc_gtin?: string;
    quantity_affected?: string;
    source_product_id?: string;
  }[];
};

export default function RecallDetailPage({
  params,
}: {
  params: { recallId: string };
}) {
  const [data, setData] = useState<RecallDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecall = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/recalls/${params.recallId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load recall details.");
        }
        const json: RecallDetailResponse = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecall();
  }, [params.recallId]);

  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <a
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Back to Search
        </a>

        {loading ? (
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-ink">
              Loading recall details…
            </p>
            <p className="text-xs text-muted mt-1">
              Fetching recall occurrence metadata and products.
            </p>
            <div className="loading-sweep mt-3" aria-hidden="true" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-muted">{error}</div>
        ) : data ? (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div className="bg-white border border-border rounded-xl p-6 shadow-card">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${sectorColor(
                      data.recall.sector
                    )}`}
                  >
                    {sectorLabel(data.recall.sector)}
                  </span>
                  <span className="text-xs font-medium text-muted bg-highlight px-2 py-1 rounded-md">
                    {sourceLabel(data.recall.source_agency)}
                  </span>
                  {data.recall.classification && (
                    <span className="text-xs font-medium text-muted bg-highlight px-2 py-1 rounded-md">
                      {data.recall.classification}
                    </span>
                  )}
                  {data.recall.status && (
                    <span className="text-xs font-medium text-muted bg-highlight px-2 py-1 rounded-md">
                      {data.recall.status}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold leading-tight mb-6">
                  {data.recall.title}
                </h1>

                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
                    <Shield size={14} className="text-muted" />
                    What happened
                  </h2>
                  <p className="text-muted leading-relaxed">
                    {data.recall.summary || "No summary provided."}
                  </p>
                </div>

                {data.recall.source_url && (
                  <a
                    href={data.recall.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors bg-accent-light px-4 py-2 rounded-lg"
                  >
                    <ExternalLink size={14} />
                    View original source
                  </a>
                )}
              </div>

              <div className="bg-white border border-border rounded-xl p-6 shadow-card">
                <h2 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                  <Package size={14} className="text-muted" />
                  Products
                </h2>
                {data.products.length ? (
                  <div className="space-y-4">
                    {data.products.map((product) => (
                      <div
                        key={product.id}
                        className="border border-border/60 rounded-lg p-4 text-sm"
                      >
                        <p className="font-semibold text-ink">
                          {product.product_name}
                        </p>
                        {product.product_description && (
                          <p className="text-muted mt-1">
                            {product.product_description}
                          </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs text-muted">
                          {product.brand && <span>Brand: {product.brand}</span>}
                          {product.model && <span>Model: {product.model}</span>}
                          {product.lot_codes && (
                            <span>Lot codes: {product.lot_codes}</span>
                          )}
                          {product.upc_gtin && (
                            <span>UPC/GTIN: {product.upc_gtin}</span>
                          )}
                          {product.quantity_affected && (
                            <span>
                              Quantity: {product.quantity_affected}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    No product details provided for this recall occurrence.
                  </p>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-white border border-border rounded-xl p-5 shadow-card">
                <h3 className="text-sm font-semibold text-ink mb-4">
                  Quick facts
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar size={15} className="text-muted mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">
                        Published
                      </p>
                      <p className="text-sm text-ink">
                        {formatDate(data.recall.published_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={15} className="text-muted mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">
                        Recall ID
                      </p>
                      <p className="text-sm text-ink">
                        {data.recall.source_recall_id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-5 shadow-card">
                <h3 className="text-sm font-semibold text-ink mb-4">
                  Linked companies
                </h3>
                {data.companies.length ? (
                  <div className="space-y-3">
                    {data.companies.map((company) => (
                      <div key={company.company_id} className="text-sm">
                        <p className="font-semibold text-ink flex items-center gap-2">
                          <Building2 size={14} className="text-muted" />
                          {company.company_name}
                        </p>
                        <p className="text-xs text-muted">
                          {company.role} — {company.raw_company_name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    No linked companies provided.
                  </p>
                )}
              </div>
            </aside>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
