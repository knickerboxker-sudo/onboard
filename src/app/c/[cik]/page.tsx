"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Filing {
  formType: string;
  accessionNo: string;
  filingDate: string;
  periodEndDate: string;
  primaryDocumentUrl: string;
}

interface MetricNotes {
  tagsUsed: string[];
  usedXbrl: boolean;
  fallbacks: string[];
  warnings: string[];
  evidence?: { matchedSentence: string; url: string };
}

interface MetricSnapshot {
  filing: Filing;
  dividendsPaidUSD: number | null;
  shareRepurchaseUSD: number | null;
  totalReturnedUSD: number | null;
  employeeCount: number | null;
  employeeCountSource: string;
  perEmployeeBuybacksUSD: number | null;
  perEmployeeDividendsUSD: number | null;
  perEmployeeTotalUSD: number | null;
  notes: MetricNotes;
}

interface TTMSummary {
  available: boolean;
  reason?: string;
  dividendsPaidUSD: number | null;
  shareRepurchaseUSD: number | null;
  totalReturnedUSD: number | null;
  employeeCount: number | null;
  employeeCountSource: string;
  perEmployeeBuybacksUSD: number | null;
  perEmployeeDividendsUSD: number | null;
  perEmployeeTotalUSD: number | null;
  quartersUsed: number;
}

interface CompanyMetrics {
  company: { cik: string; ticker?: string; name: string };
  snapshots: MetricSnapshot[];
  ttm: TTMSummary | null;
  lastUpdated: string;
}

function fmt(n: number | null): string {
  if (n === null) return "--";
  return "$" + n.toLocaleString("en-US");
}

function fmtCount(n: number | null): string {
  if (n === null) return "Unknown";
  return n.toLocaleString("en-US");
}

export default function CompanyPage() {
  const params = useParams();
  const cik = params.cik as string;
  const [data, setData] = useState<CompanyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/company/${cik}/metrics`);
        if (!res.ok) throw new Error("Failed to load");
        setData(await res.json());
      } catch {
        setError("Failed to load company data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cik]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/company/${cik}/refresh`, { method: "POST" });
      if (res.ok) setData(await res.json());
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <p className="text-muted">Loading company data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20">
        <p className="text-danger">{error ?? "Unknown error"}</p>
        <a href="/" className="text-sm text-accent underline">
          Back to search
        </a>
      </div>
    );
  }

  const { company, snapshots, ttm } = data;
  const latest = snapshots[0] ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{company.name}</h1>
          <div className="mt-1 flex gap-3 text-sm text-muted">
            {company.ticker && (
              <span className="rounded bg-highlight px-2 py-0.5 font-mono">
                {company.ticker}
              </span>
            )}
            <span>CIK {company.cik.replace(/^0+/, "")}</span>
            <span>Last updated: {new Date(data.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:bg-card-hover disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Buybacks (latest period)"
          value={fmt(latest?.shareRepurchaseUSD ?? null)}
          sub={latest ? `${latest.filing.formType} ending ${latest.filing.periodEndDate}` : undefined}
        />
        <MetricCard
          label="Dividends (latest period)"
          value={fmt(latest?.dividendsPaidUSD ?? null)}
          sub={latest ? `${latest.filing.formType} ending ${latest.filing.periodEndDate}` : undefined}
        />
        <MetricCard
          label="Total returned (latest period)"
          value={fmt(latest?.totalReturnedUSD ?? null)}
          sub="Buybacks + dividends"
        />
        <MetricCard
          label="Employee count"
          value={fmtCount(latest?.employeeCount ?? null)}
          sub={`Source: ${latest?.employeeCountSource ?? "unknown"}`}
        />
        <MetricCard
          label="Per employee (buybacks)"
          value={fmt(latest?.perEmployeeBuybacksUSD ?? null)}
        />
        <MetricCard
          label="Per employee (total)"
          value={fmt(latest?.perEmployeeTotalUSD ?? null)}
        />
      </div>

      {/* TTM Summary */}
      {ttm && (
        <div className="rounded-xl border border-border bg-base p-4 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">
            Trailing 12 Months (TTM)
          </h2>
          {!ttm.available ? (
            <p className="mt-2 text-sm text-muted">{ttm.reason}</p>
          ) : (
            <>
              <p className="mt-1 text-xs text-muted">{ttm.reason}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MiniCard label="TTM Buybacks" value={fmt(ttm.shareRepurchaseUSD)} />
                <MiniCard label="TTM Dividends" value={fmt(ttm.dividendsPaidUSD)} />
                <MiniCard label="TTM Total" value={fmt(ttm.totalReturnedUSD)} />
                <MiniCard label="TTM Per Employee" value={fmt(ttm.perEmployeeTotalUSD)} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Filings table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink">
          Metrics by Period
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="pb-2 pr-4">Period</th>
                <th className="pb-2 pr-4">Form</th>
                <th className="pb-2 pr-4 text-right">Buybacks</th>
                <th className="pb-2 pr-4 text-right">Dividends</th>
                <th className="pb-2 pr-4 text-right">Employees</th>
                <th className="pb-2 pr-4 text-right">Per Employee</th>
                <th className="pb-2">Filing</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4">{s.filing.periodEndDate}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-mono ${
                        s.filing.formType === "10-K"
                          ? "bg-accent-light text-accent"
                          : "bg-highlight text-muted"
                      }`}
                    >
                      {s.filing.formType}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right font-mono">
                    {fmt(s.shareRepurchaseUSD)}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono">
                    {fmt(s.dividendsPaidUSD)}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {fmtCount(s.employeeCount)}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono">
                    {fmt(s.perEmployeeTotalUSD)}
                  </td>
                  <td className="py-2">
                    <a
                      href={s.filing.primaryDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline hover:text-accent-hover"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transparency section */}
      <div className="rounded-xl border border-border bg-highlight/50 p-4">
        <h2 className="text-lg font-semibold text-ink">Transparency</h2>
        <p className="mt-1 text-xs text-muted">
          Source: SEC EDGAR (Form 10-K / 10-Q). All numbers cite the source filing.
        </p>
        {latest && (
          <div className="mt-3 space-y-2 text-sm">
            {latest.notes.tagsUsed.length > 0 && (
              <p>
                <span className="font-medium">XBRL tags used:</span>{" "}
                <span className="font-mono text-xs">
                  {latest.notes.tagsUsed.join(", ")}
                </span>
              </p>
            )}
            {latest.notes.fallbacks.length > 0 && (
              <p>
                <span className="font-medium">Fallbacks:</span>{" "}
                {latest.notes.fallbacks.join(", ")}
              </p>
            )}
            {latest.notes.warnings.length > 0 && (
              <div className="mt-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-ink">
                <p className="font-medium">Warnings:</p>
                <ul className="mt-1 list-inside list-disc">
                  {latest.notes.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            {latest.notes.evidence && (
              <div className="mt-2 rounded-lg border border-border bg-base px-3 py-2 text-xs">
                <p className="font-medium">Employee count evidence:</p>
                <blockquote className="mt-1 border-l-2 border-accent pl-2 italic text-muted">
                  &quot;{latest.notes.evidence.matchedSentence}&quot;
                </blockquote>
                <a
                  href={latest.notes.evidence.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-accent underline"
                >
                  Source document
                </a>
              </div>
            )}
            {latest.employeeCountSource === "unknown" && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-ink">
                Employee count not available for this period. Per-employee
                metrics cannot be calculated.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-muted">
        <a href="/methodology" className="underline hover:text-ink">
          Read our full methodology
        </a>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-base p-4 shadow-soft">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-base p-2 text-center">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-bold text-ink">{value}</p>
    </div>
  );
}
