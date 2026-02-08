import { RecallSource } from "@/src/lib/api-fetcher";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { sourceLabel } from "@/src/lib/utils";

type SourceStatus = {
  source: RecallSource;
  status: "loading" | "complete" | "error";
  count?: number;
  duration?: number;
  error?: string;
};

interface StreamingSearchStatusProps {
  sources: SourceStatus[];
  totalResults: number;
  isComplete: boolean;
}

export function StreamingSearchStatus({
  sources,
  totalResults,
  isComplete,
}: StreamingSearchStatusProps) {
  const completedCount = sources.filter((s) => s.status === "complete").length;
  const failedCount = sources.filter((s) => s.status === "error").length;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-ink">
            {isComplete ? "Search Complete" : "Searching..."}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {isComplete
              ? `Found ${totalResults} results from ${completedCount} sources`
              : `Checking ${sources.length} government sources`}
          </p>
        </div>
        {!isComplete && (
          <Loader2 size={18} className="text-accent animate-spin" />
        )}
      </div>

      <div className="space-y-2">
        {sources.map((source) => (
          <div
            key={source.source}
            className="flex items-center justify-between text-sm py-2 px-3 rounded-lg bg-base/50"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {source.status === "loading" && (
                <Loader2 size={14} className="text-muted animate-spin flex-shrink-0" />
              )}
              {source.status === "complete" && (
                <CheckCircle2 size={14} className="text-success flex-shrink-0" />
              )}
              {source.status === "error" && (
                <AlertCircle size={14} className="text-warning flex-shrink-0" />
              )}
              <span className="text-ink font-medium">
                {sourceLabel(source.source)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted">
              {source.status === "complete" && source.count !== undefined && (
                <span className="font-medium">
                  {source.count} result{source.count !== 1 ? "s" : ""}
                </span>
              )}
              {source.status === "complete" && source.duration !== undefined && (
                <span className="text-muted/60">
                  {(source.duration / 1000).toFixed(1)}s
                </span>
              )}
              {source.status === "error" && (
                <span className="text-warning text-xs">Failed</span>
              )}
              {source.status === "loading" && (
                <span className="text-muted/60">Loading...</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {failedCount > 0 && (
        <div className="mt-3 text-xs text-warning bg-warning/10 px-3 py-2 rounded-lg">
          {failedCount} source{failedCount !== 1 ? "s" : ""} failed to respond.
          Showing results from available sources.
        </div>
      )}
    </div>
  );
}
