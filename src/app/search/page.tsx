"use client";

import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { SearchBar } from "@/src/components/SearchBar";
import { RecallCard } from "@/src/components/RecallCard";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { categoryLabel, sourceLabel } from "@/src/lib/utils";
import { Filter } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  publishedAt: string;
  companyName?: string;
  url: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  fetchedAt: number;
}

const CATEGORIES = ["vehicle", "consumer", "food", "drug", "device"];
const SOURCES = ["CPSC", "NHTSA", "FSIS", "FDA"];
const DATE_RANGE_OPTIONS = [
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
  { value: "2y", label: "Last 2 years" },
  { value: "all", label: "All time" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const sourceFilter = searchParams.get("source") || "";
  const yearFilter = searchParams.get("year") || "";
  const dateRangeFilter = searchParams.get("dateRange") || "2y";

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, index) =>
    String(currentYear - index)
  );

  const buildSearchHref = (overrides: {
    category?: string;
    source?: string;
    year?: string;
    dateRange?: string;
  }) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const nextCategory = overrides.category ?? categoryFilter;
    const nextSource = overrides.source ?? sourceFilter;
    const nextYear = overrides.year ?? yearFilter;
    const nextDateRange = overrides.dateRange ?? dateRangeFilter;

    if (nextCategory) params.set("category", nextCategory);
    if (nextSource) params.set("source", nextSource);
    if (nextYear) params.set("year", nextYear);
    if (nextDateRange) params.set("dateRange", nextDateRange);

    return `/search?${params.toString()}`;
  };

  const updateFilters = (updates: { year?: string; dateRange?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextYear = updates.year ?? yearFilter;
    const nextDateRange = updates.dateRange ?? dateRangeFilter;

    if (nextYear) {
      params.set("year", nextYear);
    } else {
      params.delete("year");
    }

    if (nextDateRange) params.set("dateRange", nextDateRange);

    router.push(`/search?${params.toString()}`);
  };

  const fetchResults = (options?: { refresh?: boolean }) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryFilter) params.set("category", categoryFilter);
    if (sourceFilter) params.set("source", sourceFilter);
    if (dateRangeFilter === "all") params.set("dateRange", "all");
    if (options?.refresh) params.set("refresh", "1");

    setLoading(true);
    setError(null);
    if (options?.refresh) setRefreshing(true);
    fetch(`/api/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Search failed");
        }
        return res.json();
      })
      .then((d) => setData(d))
      .catch(() => {
        setData(null);
        setError("Unable to load recall data. Please try again.");
      })
      .finally(() => {
        setLoading(false);
        if (options?.refresh) setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchResults();
  }, [q, categoryFilter, sourceFilter, yearFilter, dateRangeFilter]);

  const filteredResults = applyDateFilters(
    data?.results ?? [],
    dateRangeFilter,
    yearFilter
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <div className="mb-6">
          <SearchBar defaultValue={q} />
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-20">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={16} className="text-muted" />
                <span className="text-sm font-medium text-muted">Filters</span>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-medium text-muted mb-2 uppercase tracking-wider">
                  Category
                </h4>
                <div className="space-y-1">
                  <a
                    href={buildSearchHref({ category: "" })}
                    className={`block text-sm px-2 py-1 rounded transition-colors ${
                      !categoryFilter
                        ? "bg-accent/20 text-accent"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    All Categories
                  </a>
                  {CATEGORIES.map((cat) => (
                    <a
                      key={cat}
                      href={buildSearchHref({ category: cat })}
                      className={`block text-sm px-2 py-1 rounded transition-colors ${
                        categoryFilter === cat
                          ? "bg-accent/20 text-accent"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {categoryLabel(cat)}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-muted mb-2 uppercase tracking-wider">
                  Source
                </h4>
                <div className="space-y-1">
                  <a
                    href={buildSearchHref({ source: "" })}
                    className={`block text-sm px-2 py-1 rounded transition-colors ${
                      !sourceFilter
                        ? "bg-accent/20 text-accent"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    All Sources
                  </a>
                  {SOURCES.map((src) => (
                    <a
                      key={src}
                      href={buildSearchHref({ source: src })}
                      className={`block text-sm px-2 py-1 rounded transition-colors ${
                        sourceFilter === src
                          ? "bg-accent/20 text-accent"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {sourceLabel(src)}
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-medium text-muted mb-2 uppercase tracking-wider">
                  Date range
                </h4>
                <div className="space-y-2">
                  <select
                    value={dateRangeFilter}
                    onChange={(event) =>
                      updateFilters({ dateRange: event.target.value })
                    }
                    className="w-full text-sm px-2 py-2 rounded border border-border bg-card text-ink focus:outline-none focus:border-accent"
                  >
                    {DATE_RANGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={yearFilter}
                    onChange={(event) =>
                      updateFilters({ year: event.target.value })
                    }
                    className="w-full text-sm px-2 py-2 rounded border border-border bg-card text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="">All years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted">
                    Filters apply in your browser today. Server-side filtering
                    would reduce payload size for large result sets.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="md:hidden mb-4">
              <details className="rounded-lg border border-border bg-card p-3">
                <summary className="cursor-pointer text-sm font-medium text-ink">
                  Filters
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(event) =>
                        router.push(
                          buildSearchHref({ category: event.target.value })
                        )
                      }
                      className="w-full mt-1 text-sm px-2 py-2 rounded border border-border bg-card text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="">All categories</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {categoryLabel(cat)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                      Source
                    </label>
                    <select
                      value={sourceFilter}
                      onChange={(event) =>
                        router.push(
                          buildSearchHref({ source: event.target.value })
                        )
                      }
                      className="w-full mt-1 text-sm px-2 py-2 rounded border border-border bg-card text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="">All sources</option>
                      {SOURCES.map((src) => (
                        <option key={src} value={src}>
                          {sourceLabel(src)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                      Date range
                    </label>
                    <select
                      value={dateRangeFilter}
                      onChange={(event) =>
                        updateFilters({ dateRange: event.target.value })
                      }
                      className="w-full mt-1 text-sm px-2 py-2 rounded border border-border bg-card text-ink focus:outline-none focus:border-accent"
                    >
                      {DATE_RANGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted uppercase tracking-wider">
                      Year
                    </label>
                    <select
                      value={yearFilter}
                      onChange={(event) =>
                        updateFilters({ year: event.target.value })
                      }
                      className="w-full mt-1 text-sm px-2 py-2 rounded border border-border bg-card text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="">All years</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </details>
            </div>
            {loading ? (
              <div className="text-center py-12 text-muted">
                Fetching live recall data...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-muted">
                {error}
                <div className="mt-3">
                  <button
                    onClick={() => fetchResults({ refresh: true })}
                    className="text-xs text-accent hover:text-accent-hover transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : data && filteredResults.length > 0 ? (
              <>
                <p className="text-sm text-muted mb-4">
                  {filteredResults.length} result
                  {filteredResults.length !== 1 ? "s" : ""} found
                  {q ? ` for "${q}"` : ""}
                  {filteredResults.length !== data.total
                    ? ` (filtered from ${data.total})`
                    : ""}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted mb-4">
                  {data?.fetchedAt ? (
                    <span>
                      Last updated{" "}
                      {new Date(data.fetchedAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  ) : null}
                  <button
                    onClick={() => fetchResults({ refresh: true })}
                    className="text-accent hover:text-accent-hover transition-colors"
                    disabled={refreshing}
                  >
                    {refreshing ? "Refreshing..." : "Refresh data"}
                  </button>
                </div>
                <div className="space-y-3">
                  {filteredResults.map((event) => (
                    <RecallCard key={event.id} {...event} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted">
                {q
                  ? `No recent recalls found for "${q}" in the selected date range.`
                  : "No recent recalls found for the selected filters."}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function applyDateFilters(
  results: SearchResult[],
  dateRange: string,
  year: string
) {
  let filtered = results;
  if (year) {
    filtered = filtered.filter((item) => {
      const publishedAt = new Date(item.publishedAt);
      if (Number.isNaN(publishedAt.getTime())) return false;
      return publishedAt.getFullYear().toString() === year;
    });
  }

  if (dateRange && dateRange !== "all") {
    const start = getDateRangeStart(dateRange);
    if (start) {
      filtered = filtered.filter((item) => {
        const publishedAt = new Date(item.publishedAt);
        if (Number.isNaN(publishedAt.getTime())) return false;
        return publishedAt.getTime() >= start.getTime();
      });
    }
  }

  return filtered.slice().sort((a, b) => {
    const aTime = new Date(a.publishedAt).getTime();
    const bTime = new Date(b.publishedAt).getTime();
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
  });
}

function getDateRangeStart(range: string) {
  const now = new Date();
  const start = new Date(now);
  switch (range) {
    case "30d":
      start.setDate(start.getDate() - 30);
      return start;
    case "3m":
      start.setMonth(start.getMonth() - 3);
      return start;
    case "6m":
      start.setMonth(start.getMonth() - 6);
      return start;
    case "1y":
      start.setFullYear(start.getFullYear() - 1);
      return start;
    case "2y":
      start.setFullYear(start.getFullYear() - 2);
      return start;
    default:
      return null;
  }
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted">
          Loading...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
