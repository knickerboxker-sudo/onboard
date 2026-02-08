"use client";

import { useEffect, useState } from "react";
import { Play, RefreshCw } from "lucide-react";
import { formatDate } from "@/src/lib/utils";

interface JobRun {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  triggeredBy: string;
  sourcesRun: string[];
  stats: Record<string, { fetched: number; inserted: number; updated: number; skipped: number; errors: number }> | null;
  error: string | null;
}

export default function AdminJobsPage() {
  const [runs, setRuns] = useState<JobRun[]>([]);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  const loadRuns = async () => {
    try {
      const res = await fetch("/api/jobs/status", {
        headers: { "x-admin-key": document.cookie.split("admin_key=")[1]?.split(";")[0] || "" },
      });
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const runJob = async (sources?: string) => {
    setRunning(true);
    setMessage("");
    try {
      const adminKey = document.cookie.split("admin_key=")[1]?.split(";")[0] || "";
      let url = `/api/jobs/run?key=${adminKey}`;
      if (sources) url += `&sources=${sources}`;

      const res = await fetch(url);
      const data = await res.json();
      setMessage(`Job ${data.status}: ${JSON.stringify(data.stats)}`);
      await loadRuns();
    } catch (err) {
      setMessage("Failed to run job");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ingestion Jobs</h1>
        <div className="flex gap-2">
          <button
            onClick={() => runJob()}
            disabled={running}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
          >
            {running ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            {running ? "Running..." : "Run All Sources"}
          </button>
          <button
            onClick={() => loadRuns()}
            className="flex items-center gap-2 border border-border text-muted hover:text-ink px-3 py-2 rounded text-sm transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-highlight border border-border rounded p-3 mb-4 text-sm break-all">
          {message}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-muted font-medium">
                Started
              </th>
              <th className="text-left px-4 py-3 text-muted font-medium">
                Status
              </th>
              <th className="text-left px-4 py-3 text-muted font-medium">
                Trigger
              </th>
              <th className="text-left px-4 py-3 text-muted font-medium">
                Sources
              </th>
              <th className="text-left px-4 py-3 text-muted font-medium">
                Stats
              </th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr
                key={run.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDate(run.startedAt)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      run.status === "SUCCESS"
                        ? "bg-success/20 text-success"
                        : run.status === "FAILED"
                          ? "bg-danger/20 text-danger"
                          : "bg-warning/20 text-warning"
                    }`}
                  >
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{run.triggeredBy}</td>
                <td className="px-4 py-3 text-muted">
                  {run.sourcesRun.join(", ")}
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {run.stats
                    ? Object.entries(run.stats)
                        .map(
                          ([src, s]) =>
                            `${src}: ${s.inserted}i/${s.updated}u/${s.skipped}s/${s.errors}e`
                        )
                        .join(", ")
                    : "-"}
                </td>
              </tr>
            ))}
            {runs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted"
                >
                  No job runs yet. Click "Run All Sources" to start ingestion.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
