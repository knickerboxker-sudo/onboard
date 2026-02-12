"use client";

import { useState, useEffect, useCallback } from "react";

interface SearchResult {
  cik: string;
  ticker: string;
  name: string;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
      }
    } catch {
      // Ignore search errors in UI
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="flex flex-col items-center gap-8 pt-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-ink">Edgar Per Employee</h1>
        <p className="mt-2 max-w-lg text-muted">
          Public SEC filing data. Search a company by ticker or name and see
          buybacks, dividends, and per-employee metrics. Math you can verify.
        </p>
      </div>

      <div className="w-full max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by ticker (e.g., AAPL) or company name..."
          className="w-full rounded-xl border border-border bg-base px-4 py-3 text-ink shadow-soft outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          autoFocus
        />

        {loading && (
          <p className="mt-2 text-center text-sm text-muted">Searching...</p>
        )}

        {results.length > 0 && (
          <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-base shadow-card">
            {results.map((r) => (
              <li key={r.cik}>
                <a
                  href={`/c/${r.cik}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-card-hover"
                >
                  <div>
                    <span className="font-medium text-ink">{r.name}</span>
                    {r.ticker && (
                      <span className="ml-2 rounded bg-highlight px-2 py-0.5 text-xs font-mono text-muted">
                        {r.ticker}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">
                    CIK {r.cik.replace(/^0+/, "")}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {!loading && query.trim().length > 0 && results.length === 0 && (
          <p className="mt-2 text-center text-sm text-muted">
            No results found.
          </p>
        )}
      </div>

      <div className="mt-8 max-w-lg text-center text-xs text-muted">
        <p>
          Source:{" "}
          <a
            href="https://www.sec.gov/edgar"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            SEC EDGAR
          </a>{" "}
          (Form 10-K / 10-Q). No investment advice.
        </p>
      </div>
    </div>
  );
}
