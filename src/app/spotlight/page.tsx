"use client";

import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { useEffect, useState } from "react";
import { formatDate } from "@/src/lib/utils";
import {
  TrendingUp,
  AlertTriangle,
  Award,
  RefreshCw,
  Building2,
  Calendar,
  ArrowUpDown,
  Filter,
} from "lucide-react";

interface SpotlightCompany {
  company_id: string;
  company_name: string;
  recall_count: number;
}

interface SpotlightResponse {
  companies: SpotlightCompany[];
  metadata: {
    timeframe_start: string;
    timeframe_end: string;
    sector: string;
    total_companies: number;
    total_recalls: number;
  };
  fetchedAt?: number;
  countLabel?: string;
}

const DATE_RANGE_OPTIONS = [
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
] as const;

type SortMode = "most" | "fewest";

export default function SpotlightPage() {
  const [data, setData] = useState<SpotlightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("2y");
  const [sortMode, setSortMode] = useState<SortMode>("most");
  const [limit, setLimit] = useState(20);
  const [sector, setSector] = useState("all");

  const fetchSpotlight = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        timeframe: dateRange,
        sort: sortMode,
        limit: String(limit),
        sector,
      });
      const res = await fetch(`/api/spotlight/companies?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load data");
      }
      const json: SpotlightResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpotlight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, sortMode, limit, sector]);

  const dateRangeLabel =
    DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? dateRange;

  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-2">
            Recall Spotlight
          </h1>
          <p className="text-sm text-muted max-w-xl leading-relaxed">
            See which companies have the most — and fewest — recall occurrences
            over a given time period. Each count represents a distinct recall
            instance published by an agency, even if the same product is
            recalled multiple times. Data sourced in real-time from U.S.
            government recall databases.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Date range selector */}
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort toggle */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-muted" />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="text-sm px-3 py-2 rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            >
              <option value="most">Most recall occurrences</option>
              <option value="fewest">Fewest recall occurrences</option>
            </select>
          </div>

          {/* Sector filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted" />
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            >
              {SECTOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Limit */}
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="text-sm px-3 py-2 rounded-lg border border-border bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchSpotlight}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors ml-auto"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 mb-4">
              <AlertTriangle size={24} className="text-danger" />
            </div>
            <p className="text-muted mb-4">{error}</p>
            <button
              onClick={fetchSpotlight}
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : data && data.companies.length > 0 ? (
          <>
            {/* Summary bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted">
              <span>
                <strong className="text-ink">
                  {data.metadata.total_companies}
                </strong>{" "}
                companies across{" "}
                <strong className="text-ink">
                  {data.metadata.total_recalls}
                </strong>{" "}
                recall occurrences
              </span>
              {data.fetchedAt && (
                <span className="text-xs">
                  Updated{" "}
                  {new Date(data.fetchedAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              )}
            </div>

            {/* Section title */}
            <div className="flex items-center gap-2 mb-4">
              {sortMode === "most" ? (
                <>
                  <TrendingUp size={18} className="text-danger" />
                  <h2 className="text-lg font-semibold text-ink">
                    Most Recall Occurrences — {dateRangeLabel}
                  </h2>
                </>
              ) : (
                <>
                  <Award size={18} className="text-emerald-600" />
                  <h2 className="text-lg font-semibold text-ink">
                    Fewest Recall Occurrences — {dateRangeLabel}
                  </h2>
                </>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-border shadow-card bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-highlight/60">
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider">
                      Company
                    </th>
                    <th
                      className="text-center px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider"
                      title="Counts represent distinct recall instances published by agencies. A product recalled multiple times counts multiple times."
                    >
                      Recalls
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted text-xs uppercase tracking-wider hidden lg:table-cell">
                      Timeframe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.companies.map((company, index) => (
                    <tr
                      key={company.company_id}
                      className="border-b border-border/50 hover:bg-highlight/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2
                            size={14}
                            className="text-muted/60 flex-shrink-0"
                          />
                          <a
                            className="font-medium text-ink hover:text-accent transition-colors"
                            href={`/companies/${company.company_id}?timeframe=${dateRange}&sector=${sector}`}
                          >
                            {company.company_name}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-bold ${
                            sortMode === "most"
                              ? company.recall_count >= 10
                                ? "bg-red-100 text-red-700"
                                : company.recall_count >= 5
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {company.recall_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs hidden lg:table-cell">
                        {formatDate(data.metadata.timeframe_start)} —{" "}
                        {formatDate(data.metadata.timeframe_end)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted/70 mt-6 leading-relaxed max-w-2xl">
              Counts represent distinct recall instances published by agencies.
              A product recalled multiple times counts multiple times. Data is
              aggregated in real-time from NHTSA, CPSC, USDA FSIS, FDA, EPA, and
              USCG. Company names are normalized for grouping but may not always
              be perfectly de-duplicated. This is not legal advice.
            </p>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted">
              No recall data available for the selected time period.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
        <p className="text-sm font-semibold text-ink">
          Loading recall spotlight data…
        </p>
        <p className="text-xs text-muted mt-1">
          Aggregating recalls from government databases.
        </p>
        <div className="loading-sweep mt-3" aria-hidden="true" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-border rounded-xl p-4 shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="skeleton h-4 w-8" />
            <div className="skeleton h-4 w-48" />
            <div className="skeleton h-4 w-12 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
