"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/src/lib/utils";

interface RawRecord {
  id: string;
  source: string;
  sourceRecordId: string;
  fetchedAt: string;
  publishedAt: string | null;
  title: string | null;
  hash: string;
}

export default function AdminRawPage() {
  const [records, setRecords] = useState<RawRecord[]>([]);
  const [source, setSource] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedRaw, setExpandedRaw] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (source) params.set("source", source);
        params.set("take", "50");
        const res = await fetch(`/api/admin/raw?${params.toString()}`, {
          headers: {
            "x-admin-key":
              document.cookie.split("admin_key=")[1]?.split(";")[0] || "",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setRecords(data.records || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [source]);

  const viewRaw = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    try {
      const res = await fetch(`/api/admin/raw/${id}`, {
        headers: {
          "x-admin-key":
            document.cookie.split("admin_key=")[1]?.split(";")[0] || "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setExpandedRaw(data.raw);
        setExpandedId(id);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Raw Records</h1>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="bg-card border border-border rounded px-3 py-2 text-sm text-ink"
        >
          <option value="">All Sources</option>
          <option value="CPSC">CPSC</option>
          <option value="NHTSA">NHTSA</option>
          <option value="FSIS">FSIS</option>
          <option value="FDA">FDA</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Source
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Record ID
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Fetched
                </th>
                <th className="text-left px-4 py-3 text-muted font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <>
                  <tr
                    key={rec.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-muted">{rec.source}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {rec.sourceRecordId}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {rec.title || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {formatDate(rec.fetchedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewRaw(rec.id)}
                        className="text-accent text-xs hover:text-accent-hover"
                      >
                        {expandedId === rec.id ? "Hide" : "View JSON"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === rec.id && (
                    <tr key={`${rec.id}-raw`}>
                      <td colSpan={5} className="px-4 py-3 bg-highlight">
                        <pre className="text-xs overflow-x-auto max-h-64 overflow-y-auto">
                          {JSON.stringify(expandedRaw, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted"
                  >
                    No raw records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
