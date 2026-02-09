"use client";

import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  formatDate,
  sectorLabel,
  sectorColor,
  sourceLabel,
} from "@/src/lib/utils";
import {
  Building2,
  Calendar,
  Filter,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const TIMEFRAME_OPTIONS = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
  { value: "2y", label: "Last 2 years" },
  { value: "all", label: "All time" },
];

const SECTOR_OPTIONS = [
  { value: "all", label: "All sectors" },
  { value: "FOOD", label: "Food" },
  { value: "DRUGS", label: "Drugs" },
  { value: "MEDICAL_DEVICE", label: "Medical Device" },
  { value: "CONSUMER_PRODUCT", label: "Consumer Product" },
  { value: "VEHICLE", label: "Vehicle" },
  { value: "MARITIME", label: "Maritime" },
  { value: "ENVIRONMENTAL", label: "Environmental" },
  { value: "OTHER", label: "Other" },
];

type CompanyRecall = {
  recall_id: string;
  source_agency: string;
  source_recall_id: string;
  title: string;
  published_at: string;
  recalled_at: string;
  sector: string;
  classification?: string;
  status?: string;
  source_url: string;
  product_count: number;
};

type CompanyRecallsResponse = {
  company: { id: string; name: string };
  recalls: CompanyRecall[];
  metadata: { total_recalls: number; page: number; pageSize: number };
};

export default function CompanyDetailPage({
  params,
}: {
  params: { companyId: string };
}) {
  const searchParams = useSearchParams();
  const [data, setData] = useState<CompanyRecallsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState(
    searchParams.get("timeframe") || "2y"
  );
  const [sector, setSector] = useState(searchParams.get("sector") || "all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchCompanyRecalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const paramsQuery = new URLSearchParams({
        timeframe,
        sector,
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await fetch(
        `/api/companies/${params.companyId}/recalls?${paramsQuery.toString()}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load company recalls.");
      }
      const json: CompanyRecallsResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyRecalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, sector, page]);

  const totalRecalls = data?.metadata.total_recalls ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecalls / pageSize));

  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="mb-6">
          <p className="text-xs text-muted mb-2">Company detail</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-2">
            {data?.company.name || "Loading company…"}
          </h1>
          <p className="text-sm text-muted max-w-xl leading-relaxed">
            Tracking recall occurrences linked to this company. Counts represent
            distinct recall instances published by agencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted" />
            <select
              value={timeframe}
              onChange={(e) => {
                setPage(1);
                setTimeframe(e.target.value);
              }}
              className="text-sm px-3 py-2 rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            >
              {TIMEFRAME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted" />
            <select
              value={sector}
              onChange={(e) => {
                setPage(1);
                setSector(e.target.value);
              }}
              className="text-sm px-3 py-2 rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            >
              {SECTOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-xs text-muted">
            <span className="font-semibold text-ink">{totalRecalls}</span> recall
            occurrences
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
            <p className="text-sm font-semibold text-ink">
              Loading company recalls…
            </p>
            <p className="text-xs text-muted mt-1">
              Gathering recall occurrences for this company.
            </p>
            <div className="loading-sweep mt-3" aria-hidden="true" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-muted">{error}</div>
        ) : data && data.recalls.length ? (
          <>
            <div className="space-y-4">
              {data.recalls.map((recall) => (
                <a
                  key={recall.recall_id}
                  href={`/recalls/${recall.recall_id}`}
                  className="block rounded-xl border border-border bg-white p-4 shadow-card hover:border-accent/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${sectorColor(
                        recall.sector
                      )}`}
                    >
                      {sectorLabel(recall.sector)}
                    </span>
                    <span className="text-[10px] font-medium text-muted bg-highlight px-2 py-0.5 rounded">
                      {sourceLabel(recall.source_agency)}
                    </span>
                    {recall.classification && (
                      <span className="text-[10px] font-medium text-muted bg-highlight px-2 py-0.5 rounded">
                        {recall.classification}
                      </span>
                    )}
                    {recall.status && (
                      <span className="text-[10px] font-medium text-muted bg-highlight px-2 py-0.5 rounded">
                        {recall.status}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-semibold text-ink mb-2">
                    {recall.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />{" "}
                      {formatDate(recall.published_at)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Building2 size={12} /> {recall.source_recall_id}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      Products: {recall.product_count}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 text-sm">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white text-ink disabled:opacity-50"
              >
                <ArrowLeft size={14} />
                Previous
              </button>
              <span className="text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white text-ink disabled:opacity-50"
              >
                Next
                <ArrowRight size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-muted">
            No recall occurrences found for these filters.
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
