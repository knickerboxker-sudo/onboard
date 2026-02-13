"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import { occupationOptions } from "@/lib/bls";

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

const geographyOptions = [
  { value: "national", label: "National" },
  { value: "state-ca", label: "State: California" },
  { value: "metro-nyc", label: "Metro: New York-Newark-Jersey City" },
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function HomePage() {
  const [occupationInput, setOccupationInput] = useState("Software Developers");
  const [geography, setGeography] = useState("national");
  const [experience, setExperience] = useState("median");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const options = useMemo(() => occupationOptions.map((item) => `${item.title} (${item.soc})`), []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ occupation: occupationInput, geography, experience }),
    });
    const data = (await response.json()) as AnalyzeResponse;
    setResult(data);
    setLoading(false);
  }

  return (
    <main>
      <div className="row" style={{ marginBottom: 12 }}>
        <Image src="/sortir-logo.png" alt="Onboard logo" width={40} height={40} className="logo" />
        <h1>Labor Market Truth Instrument</h1>
      </div>
      <form className="panel" onSubmit={onSubmit}>
        <div className="grid">
          <div>
            <label htmlFor="occupation">Occupation selector (BLS SOC normalized)</label>
            <input
              id="occupation"
              list="occupation-list"
              value={occupationInput}
              onChange={(event) => setOccupationInput(event.target.value)}
              required
            />
            <datalist id="occupation-list">
              {options.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="geography">Geography selector</label>
            <select id="geography" value={geography} onChange={(event) => setGeography(event.target.value)}>
              {geographyOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="experience">Experience level emphasis</label>
            <select id="experience" value={experience} onChange={(event) => setExperience(event.target.value)}>
              <option value="entry">Entry (10th percentile)</option>
              <option value="median">Median (50th percentile)</option>
              <option value="senior">Senior (90th percentile)</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">{loading ? "Analyzing..." : "Analyze Market"}</button>
        </div>
      </form>

      {result?.error && (
        <div className="panel" style={{ marginTop: 12 }}>
          <p>{result.error}</p>
        </div>
      )}

      {result?.metrics && !result.error && (
        <section className="panel" style={{ marginTop: 12 }}>
          <div>
            <h2>1. Market Signal</h2>
            <p>{result.metrics.marketSignal}</p>
          </div>
          <div className="metric">
            <h3>2. Demand vs Saturation summary</h3>
            <p>
              Demand Score {result.metrics.demandScore} vs Saturation Score {result.metrics.saturationScore}. Projected growth is {result.projectedGrowthPct}% compared with national {result.nationalAverageGrowthPct}%.
            </p>
          </div>
          <div className="metric">
            <h3>3. Wage outlook</h3>
            <p>
              Selected percentile ({result.percentile}) wage is {formatMoney(result.selectedWage || 0)}. Wage momentum is {result.metrics.wageMomentum === null ? "limited" : `${result.metrics.wageMomentum}% above inflation-adjusted baseline`}.
            </p>
          </div>
          <div className="metric">
            <h3>4. Regional comparison</h3>
            <p>
              Regional Opportunity Delta is {formatMoney(result.metrics.regionalOpportunityDelta)} versus national wage {formatMoney(result.nationalWage || 0)} for the same percentile.
            </p>
          </div>
          <div className="metric">
            <h3>5. Plain-language explanation</h3>
            <p>
              {result.occupation?.title} ({result.occupation?.soc}) shows a {result.metrics.marketSignal.toLowerCase()} market signal based on BLS projected growth, employment size, and inflation-adjusted wage trend. This output is deterministic for the same input values and does not include recommendations.
            </p>
            {!!result.limitations?.length && <p>{result.limitations.join(" ")}</p>}
            <small>
              Data source: {result.source}. OEWS updated {result.updated?.oews}; Projections updated {result.updated?.projections}; Historical updated {result.updated?.historical}.
            </small>
          </div>
        </section>
      )}
    </main>
  );
}
