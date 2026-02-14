"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

type AnalyzeResponse = {
  error?: string;
  source?: string;
  updated?: Record<string, string>;
  occupation?: { soc: string; title: string };
  percentile?: string;
  selectedWage?: number;
  nationalWage?: number;
  currentEmployment?: number;
  projectedGrowthPct?: number;
  projectedChange?: number;
  nationalAverageGrowthPct?: number;
  careerPaths?: string[];
  assistantMessage?: string;
  limitations?: string[];
  metrics?: {
    demandScore: number;
    saturationScore: number;
    wageMomentum: number | null;
    regionalOpportunityDelta: number;
    marketSignal: "Undersupplied" | "Balanced" | "Oversupplied" | "Declining";
    confidence: "high" | "limited";
  };
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function HomePage() {
  const [sector, setSector] = useState("technology");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [message, setMessage] = useState("I want to find a stable career path with room to grow.");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sector, message }),
    });
    const data = (await response.json()) as AnalyzeResponse;
    setResult(data);
    setLoading(false);
  }

  return (
    <main>
      <div className="row" style={{ marginBottom: 12 }}>
        <Image src="/sortir-logo.png" alt="Onboard logo" width={40} height={40} className="logo" />
        <h1>Onboard Career Conversation Agent</h1>
      </div>
      <form className="panel" onSubmit={onSubmit}>
        <div className="grid">
          <div>
            <label htmlFor="sector">Which sector are you exploring?</label>
            <input id="sector" value={sector} onChange={(event) => setSector(event.target.value)} required />
          </div>
          <div>
            <label htmlFor="message">Tell the assistant what kind of work you want</label>
            <input id="message" value={message} onChange={(event) => setMessage(event.target.value)} required />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">{loading ? "Thinking..." : "Ask Career Assistant"}</button>
        </div>
      </form>

      {result?.error && (
        <div className="panel" style={{ marginTop: 12 }}>
          <p>{result.error}</p>
        </div>
      )}

      {result?.metrics && !result.error && (
        <section className="panel" style={{ marginTop: 12 }}>
          <div className="metric">
            <h3>Conversation</h3>
            <p>
              <strong>You:</strong> {message}
            </p>
            <p>
              <strong>Assistant:</strong> {result.assistantMessage}
            </p>
          </div>
          <div className="metric">
            <h3>BLS market snapshot for your sector</h3>
            <p>
              {result.occupation?.title} ({result.occupation?.soc}) currently shows a {result.metrics.marketSignal.toLowerCase()} signal.
              Projected growth is {result.projectedGrowthPct}% versus national {result.nationalAverageGrowthPct}%, with a median wage
              of {formatMoney(result.selectedWage || 0)}.
            </p>
            {!!result.careerPaths?.length && <p>Related career paths: {result.careerPaths.join(", ")}.</p>}
            {!!result.limitations?.length && <p>{result.limitations.join(" ")}</p>}
            <small>
              Data source: {result.source}. OEWS updated {result.updated?.oews}; Projections updated {result.updated?.projections};
              Historical updated {result.updated?.historical}.
            </small>
          </div>
        </section>
      )}
    </main>
  );
}
