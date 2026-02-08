import { RecallSource, SOURCE_SCOPE } from "@/src/lib/api-fetcher";
import { CheckCircle2, Loader2, MinusCircle, AlertCircle } from "lucide-react";
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
  // Sources that errored but simply don't cover the search (not applicable)
  const notApplicableSources = sources.filter(
    (s) => s.status === "error" && s.count === undefined
  );
  // True failures are sources that were expected to work but broke
  const trueFailures = sources.filter(
    (s) => s.status === "error" && s.count !== undefined
  );

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-ink">
            {isComplete ? "Search Complete" : "Searching..."}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {isComplete
              ? `Found ${totalResults} results from ${completedCount} source${completedCount !== 1 ? "s" : ""}`
              : `Checking ${sources.length} government sources`}
          </p>
        </div>
        {!isComplete && (
          <Loader2 size={18} className="text-accent animate-spin" />
        )}
      </div>

      <div className="space-y-2">
        {sources.map((source) => {
          const isNotApplicable =
            source.status === "error" && source.count === undefined;
          const isTrueFailure =
            source.status === "error" && source.count !== undefined;
          return (
            <div
              key={source.source}
              className={`flex items-center justify-between text-sm py-2 px-3 rounded-lg ${
                isNotApplicable ? "bg-base/30 opacity-60" : "bg-base/50"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {source.status === "loading" && (
                  <Loader2 size={14} className="text-muted animate-spin flex-shrink-0" />
                )}
                {source.status === "complete" && (
                  <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                )}
                {isNotApplicable && (
                  <MinusCircle size={14} className="text-muted/50 flex-shrink-0" />
                )}
                {isTrueFailure && (
                  <AlertCircle size={14} className="text-warning flex-shrink-0" />
                )}
                <span className={`font-medium ${isNotApplicable ? "text-muted" : "text-ink"}`}>
                  {sourceLabel(source.source)}
                </span>
                {isNotApplicable && (
                  <span className="text-xs text-muted/60 hidden sm:inline">
                    — {SOURCE_SCOPE[source.source]}
                  </span>
                )}
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
                {isNotApplicable && (
                  <span className="text-muted/50 text-xs">Not applicable</span>
                )}
                {isTrueFailure && (
                  <span className="text-warning text-xs">Failed</span>
                )}
                {source.status === "loading" && (
                  <span className="text-muted/60">Loading...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {notApplicableSources.length > 0 && trueFailures.length === 0 && isComplete && (
        <div className="mt-3 text-xs text-muted bg-highlight px-3 py-2 rounded-lg">
          {notApplicableSources.length} source{notApplicableSources.length !== 1 ? "s" : ""}{" "}
          {notApplicableSources.length !== 1 ? "don't" : "doesn't"} cover this type of product.
          Showing results from applicable sources.
        </div>
      )}

      {trueFailures.length > 0 && (
        <div className="mt-3 text-xs text-warning bg-warning/10 px-3 py-2 rounded-lg">
          {trueFailures.length} source{trueFailures.length !== 1 ? "s" : ""} failed to respond.
          Showing results from available sources.
        </div>
      )}
    </div>
  );
}
