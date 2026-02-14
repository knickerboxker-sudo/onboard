"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { AreaMetric } from "@/lib/areaHealth";
import {
  MAX_LOCATIONS,
  MIN_LOCATIONS,
  parseLocationsParam,
  serializeLocationsParam,
  validationMessage,
} from "@/lib/location";

const metricInfo: Record<string, string> = {
  airQualityPm25:
    "PM2.5 shows fine particle pollution. Lower values generally mean easier breathing outdoors.",
  unemploymentRate:
    "Unemployment rate provides labor market pressure context. Lower values indicate stronger job availability.",
  foodAccessScore:
    "Food access score approximates nutrition availability signals from USDA food records.",
  drugRecallCount:
    "Drug recall count reflects reported FDA drug enforcement recalls tied to the selected area query.",
};
const softTransition = "transition-colors duration-200";

function formatNumber(value: number | null, suffix = "") {
  if (value == null) return "Data unavailable";
  return `${value.toLocaleString()}${suffix}`;
}

function inlineComparison(value: number | null, baseline: number | null) {
  if (value == null || baseline == null || baseline === 0) return "Context unavailable";
  const delta = ((value - baseline) / baseline) * 100;
  const dir = delta < 0 ? "lower" : "higher";
  return `${Math.abs(delta).toFixed(1)}% ${dir} than comparison average`;
}

export default function Page() {
  const [input, setInput] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<AreaMetric[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLocations(parseLocationsParam(params.get("locations")));
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serialized = serializeLocationsParam(locations);
    if (serialized) {
      params.set("locations", serialized);
    } else {
      params.delete("locations");
    }
    const query = params.toString();
    window.history.replaceState({}, "", query ? `?${query}` : "/");
    setShareUrl(window.location.href);

    if (locations.length < MIN_LOCATIONS) {
      setMetrics([]);
      setAnalysis("");
      return;
    }

    const loadMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/compare?locations=${encodeURIComponent(serialized)}`,
        );
        const data = (await response.json()) as { metrics?: AreaMetric[]; error?: string };
        if (!response.ok || !data.metrics) {
          setError(data.error ?? "Could not load data.");
          return;
        }
        setMetrics(data.metrics);
      } catch {
        setError("Could not load data.");
      } finally {
        setLoading(false);
      }
    };

    void loadMetrics();
  }, [locations]);

  useEffect(() => {
    if (!metrics.length) {
      setAnalysis("");
      return;
    }

    const loadAnalysis = async () => {
      setAnalysisLoading(true);
      setAnalysis("");
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ metrics }),
        });

        if (!response.ok || !response.body) {
          setAnalysis("Automatic analysis unavailable right now.");
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setAnalysis(accumulated);
        }
      } catch {
        setAnalysis("Automatic analysis unavailable right now.");
      } finally {
        setAnalysisLoading(false);
      }
    };

    void loadAnalysis();
  }, [metrics]);

  const validation = validationMessage(input, locations);

  const averages = useMemo(() => {
    const valid = (list: Array<number | null>) => list.filter((item): item is number => item != null);
    const average = (items: Array<number | null>) => {
      const values = valid(items);
      if (!values.length) return null;
      return values.reduce((sum, item) => sum + item, 0) / values.length;
    };

    return {
      airQualityPm25: average(metrics.map((item) => item.airQualityPm25)),
      unemploymentRate: average(metrics.map((item) => item.unemploymentRate)),
      foodAccessScore: average(metrics.map((item) => item.foodAccessScore)),
      drugRecallCount: average(metrics.map((item) => item.drugRecallCount)),
    };
  }, [metrics]);

  function addLocation() {
    const message = validationMessage(input, locations);
    if (message) {
      setError(message);
      return;
    }

    setError(null);
    setLocations((prev) => [...prev, input.trim()]);
    setInput("");
  }

  return (
    <main className="min-h-screen bg-base text-ink">
      <header className="border-b border-border bg-card/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Image src="/sortir-logo.png" alt="Area Health Dashboard" width={24} height={24} />
            <p className="text-sm">Area health dashboard</p>
          </div>
          <button
            disabled
            aria-disabled="true"
            title="Settings are coming soon."
            className={`rounded border border-border px-2 py-1 text-xs text-muted ${softTransition} hover:bg-highlight disabled:cursor-not-allowed`}
          >
            Settings
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-[2fr,1fr] sm:px-6">
        <article className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-lg font-medium">Search one area or compare up to four</h1>
          <p className="mt-1 text-sm text-muted">
            Enter a city, city + state, or ZIP. Results load automatically without asking a question.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <label htmlFor="location-input" className="sr-only">
              City or ZIP code
            </label>
            <input
              id="location-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Austin, TX or 78701"
              className={`min-w-0 flex-1 rounded border border-border bg-base px-3 py-2 text-sm outline-none ${softTransition} focus:border-accent`}
            />
            <button
              type="button"
              onClick={addLocation}
              disabled={Boolean(validation)}
              className={`rounded border border-accent bg-accent px-3 py-2 text-sm text-white ${softTransition} hover:bg-accent-hover disabled:opacity-60`}
            >
              Add location
            </button>
          </div>
          <p className="mt-2 text-xs text-muted" aria-live="polite">
            {input ? validation ?? "Location looks good." : "Use natural language location names."}
          </p>

          {error ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Selected locations">
            {locations.map((location) => (
              <li key={location} className="rounded bg-highlight px-2 py-1 text-xs text-ink">
                {location}
              </li>
            ))}
          </ul>
        </article>

        <aside className="rounded-xl border border-border bg-card p-4 text-sm text-muted">
          <p>Share this comparison</p>
          <p className="mt-1 break-all text-xs">{shareUrl}</p>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <article className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3 text-sm text-muted">
            {loading ? "Loading location metrics…" : "Results"}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-highlight text-left text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Location</th>
                  <th className="px-4 py-2 font-medium" title={metricInfo.airQualityPm25}>
                    PM2.5
                  </th>
                  <th className="px-4 py-2 font-medium" title={metricInfo.unemploymentRate}>
                    Unemployment
                  </th>
                  <th className="px-4 py-2 font-medium" title={metricInfo.foodAccessScore}>
                    Food access
                  </th>
                  <th className="px-4 py-2 font-medium" title={metricInfo.drugRecallCount}>
                    Drug safety
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, index) => (
                  <tr
                    key={metric.location}
                    className={`${softTransition} ${index % 2 === 0 ? "bg-card" : "bg-highlight/50"}`}
                  >
                    <td className="border-t border-border px-4 py-3 align-top">
                      <div>{metric.location}</div>
                      <p className="text-xs text-muted">{metric.notes.join(" ") || "All sources returned values."}</p>
                    </td>
                    <td className="border-t border-border px-4 py-3 align-top">
                      <div>{formatNumber(metric.airQualityPm25, " µg/m³")}</div>
                      <p className="text-xs text-muted">
                        {inlineComparison(metric.airQualityPm25, averages.airQualityPm25)}
                      </p>
                    </td>
                    <td className="border-t border-border px-4 py-3 align-top">
                      <div>{formatNumber(metric.unemploymentRate, "%")}</div>
                      <p className="text-xs text-muted">
                        {inlineComparison(metric.unemploymentRate, averages.unemploymentRate)}
                      </p>
                    </td>
                    <td className="border-t border-border px-4 py-3 align-top">
                      <div>{formatNumber(metric.foodAccessScore)}</div>
                      <p className="text-xs text-muted">
                        {inlineComparison(metric.foodAccessScore, averages.foodAccessScore)}
                      </p>
                    </td>
                    <td className="border-t border-border px-4 py-3 align-top">
                      <div>{formatNumber(metric.drugRecallCount)}</div>
                      <p className="text-xs text-muted">
                        {inlineComparison(metric.drugRecallCount, averages.drugRecallCount)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && locations.length < MIN_LOCATIONS ? (
            <p className="border-t border-border px-4 py-3 text-sm text-muted">
              Add at least one location to start.
            </p>
          ) : null}
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <article className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm text-muted">Automatic analysis</h2>
          <div className="mt-3 min-h-20 rounded border border-border bg-base p-3 text-sm text-ink" aria-live="polite">
            {analysis || (analysisLoading ? "Preparing automatic summary…" : "Summary appears here after results load.")}
          </div>
          <p className="mt-2 text-xs text-muted">You do not need to ask a question for analysis.</p>
        </article>
      </section>
    </main>
  );
}
