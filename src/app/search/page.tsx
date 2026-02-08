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
}

const CATEGORIES = ["vehicle", "consumer", "food", "drug", "device"];
const SOURCES = ["CPSC", "NHTSA", "FSIS", "FDA"];
const YEAR_RANGE_OPTIONS = [
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "5", label: "5 years" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const sourceFilter = searchParams.get("source") || "";
  const yearFilter = searchParams.get("year") || "";
  const rangeFilter = searchParams.get("range") || "";

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, index) =>
    String(currentYear - index)
  );

  const buildSearchHref = (overrides: {
    category?: string;
    source?: string;
    year?: string;
    range?: string;
  }) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const nextCategory = overrides.category ?? categoryFilter;
    const nextSource = overrides.source ?? sourceFilter;
    const nextYear = overrides.year ?? yearFilter;
    const nextRange = overrides.range ?? rangeFilter;

    if (nextCategory) params.set("category", nextCategory);
    if (nextSource) params.set("source", nextSource);
    if (nextYear) params.set("year", nextYear);
    if (nextRange && nextYear) params.set("range", nextRange);

    return `/search?${params.toString()}`;
  };

  const updateFilters = (updates: { year?: string; range?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextYear = updates.year ?? yearFilter;
    const nextRange = updates.range ?? rangeFilter;

    if (nextYear) {
      params.set("year", nextYear);
    } else {
      params.delete("year");
      params.delete("range");
    }

    if (nextRange && nextYear) {
      params.set("range", nextRange);
    } else {
      params.delete("range");
    }

    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryFilter) params.set("category", categoryFilter);
    if (sourceFilter) params.set("source", sourceFilter);
    if (yearFilter) params.set("year", yearFilter);
    if (rangeFilter && yearFilter) params.set("range", rangeFilter);

    setLoading(true);
    fetch(`/api/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Search failed");
        }
        return res.json();
      })
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [q, categoryFilter, sourceFilter, yearFilter, rangeFilter]);

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
                  Year
                </h4>
                <div className="space-y-2">
                  <select
                    value={yearFilter}
                    onChange={(event) => {
                      const nextYear = event.target.value;
                      updateFilters({
                        year: nextYear,
                        range: nextYear ? rangeFilter || "1" : "",
                      });
                    }}
                    className="w-full text-sm px-2 py-2 rounded border border-border bg-card text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="">All years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rangeFilter || "1"}
                    onChange={(event) =>
                      updateFilters({ range: event.target.value })
                    }
                    disabled={!yearFilter}
                    className="w-full text-sm px-2 py-2 rounded border border-border bg-card text-ink focus:outline-none focus:border-accent disabled:opacity-50"
                  >
                    {YEAR_RANGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-12 text-muted">
                Fetching live recall data...
              </div>
            ) : data && data.results.length > 0 ? (
              <>
                <p className="text-sm text-muted mb-4">
                  {data.total} result{data.total !== 1 ? "s" : ""} found
                  {q ? ` for "${q}"` : ""}
                </p>
                <div className="space-y-3">
                  {data.results.map((event) => (
                    <RecallCard key={event.id} {...event} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted">
                {q
                  ? `No results found for "${q}". Try a different search term.`
                  : "No recall events found yet. Try a search to fetch live data."}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
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
