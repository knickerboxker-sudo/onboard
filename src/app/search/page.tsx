"use client";

import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { SearchBar } from "@/src/components/SearchBar";
import { RecallCard } from "@/src/components/RecallCard";
import { useSearchParams } from "next/navigation";
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

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const sourceFilter = searchParams.get("source") || "";

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryFilter) params.set("category", categoryFilter);
    if (sourceFilter) params.set("source", sourceFilter);

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
  }, [q, categoryFilter, sourceFilter]);

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
                    href={`/search?q=${encodeURIComponent(q)}&source=${sourceFilter}`}
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
                      href={`/search?q=${encodeURIComponent(q)}&category=${cat}&source=${sourceFilter}`}
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
                    href={`/search?q=${encodeURIComponent(q)}&category=${categoryFilter}`}
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
                      href={`/search?q=${encodeURIComponent(q)}&category=${categoryFilter}&source=${src}`}
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
