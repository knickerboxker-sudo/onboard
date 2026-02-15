"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Customized,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStockData } from "@/hooks/useStockData";
import { formatChangePercent, formatPrice } from "@/utils/formatPrice";
import { formatVolume } from "@/utils/formatVolume";

const symbols = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "SPY"];
const timeframes = ["1D", "1W", "1M", "3M", "1Y"];

const CandlestickLayer = ({ data, xAxisMap, yAxisMap, offset }) => {
  const xAxis = xAxisMap?.[0];
  const yAxis = yAxisMap?.[0];
  if (!xAxis || !yAxis) {
    return null;
  }

  const step = Math.max(3, (offset?.width || 100) / Math.max(data.length, 1) - 1);

  return (
    <g>
      {data.map((entry, index) => {
        const x = xAxis.scale(index) + (xAxis.bandSize || 0) / 2;
        const openY = yAxis.scale(entry.open);
        const closeY = yAxis.scale(entry.close);
        const highY = yAxis.scale(entry.high);
        const lowY = yAxis.scale(entry.low);
        const bullish = entry.close >= entry.open;
        const color = bullish ? "#22c55e" : "#ef4444";
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(1, Math.abs(openY - closeY));

        return (
          <g key={`${entry.time}-${index}`}>
            <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={1.2} />
            <rect x={x - step / 2} y={bodyY} width={step} height={bodyHeight} fill={color} rx={1} />
          </g>
        );
      })}
    </g>
  );
};

export default function TradingTerminal() {
  const [symbol, setSymbol] = useState(symbols[0]);
  const [timeframe, setTimeframe] = useState(timeframes[0]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { quote, candles, overview, indicators, loading, error, refresh } = useStockData(symbol, timeframe);

  const latestRsi = useMemo(() => indicators.rsi[indicators.rsi.length - 1], [indicators.rsi]);
  const latestMacd = useMemo(() => indicators.macd[indicators.macd.length - 1], [indicators.macd]);
  const positive = (quote?.change || 0) >= 0;

  return (
    <main className="min-h-screen bg-[#05070b] p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        <header className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-slate-100">Live Trading Terminal</h1>
            <div className="flex flex-wrap gap-2">
              {symbols.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSymbol(item)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition ${
                    symbol === item
                      ? "border-sky-500 bg-sky-500/20 text-sky-200"
                      : "border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">{symbol}</p>
                <div className="flex items-end gap-3">
                  <p className={`text-3xl font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>{formatPrice(quote?.price)}</p>
                  <p className={`pb-1 text-sm ${positive ? "text-emerald-300" : "text-rose-300"}`}>
                    {formatPrice(quote?.change)} ({formatChangePercent(quote?.changePercent)})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={refresh}
                className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500"
              >
                Refresh
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {timeframes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTimeframe(item)}
                  className={`rounded-md border px-3 py-1 text-sm ${
                    timeframe === item
                      ? "border-violet-500 bg-violet-500/20 text-violet-200"
                      : "border-slate-700 text-slate-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {error ? <p className="mb-2 text-sm text-amber-300">{error}</p> : null}
            {loading ? <p className="mb-2 text-sm text-slate-400">Loading market data…</p> : null}

            {isMounted ? (
              <>
                <div className="h-[360px] w-full">
                  <ResponsiveContainer>
                    <ComposedChart data={candles} margin={{ top: 16, right: 8, bottom: 10, left: 0 }}>
                      <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        tickFormatter={(value) =>
                          new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        }
                        minTickGap={28}
                      />
                      <YAxis domain={["dataMin", "dataMax"]} tick={{ fill: "#94a3b8", fontSize: 11 }} width={64} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#020617", border: "1px solid #334155", borderRadius: 10 }}
                        labelFormatter={(value) => new Date(value).toLocaleString()}
                        formatter={(value, name) => [formatPrice(value), String(name).toUpperCase()]}
                      />
                      <Line dataKey="sma20" stroke="#38bdf8" dot={false} strokeWidth={1.2} />
                      <Customized component={<CandlestickLayer />} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 h-28 w-full">
                  <ResponsiveContainer>
                    <BarChart data={candles} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Bar dataKey="volume" maxBarSize={8}>
                        {candles.map((entry, index) => (
                          <Cell key={`${entry.time}-vol-${index}`} fill={entry.close >= entry.open ? "#22c55e" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="h-[472px] w-full rounded-lg border border-slate-800 bg-slate-900/40" />
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Market Snapshot</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-400">High</dt>
                  <dd>{formatPrice(quote?.high)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Low</dt>
                  <dd>{formatPrice(quote?.low)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Volume</dt>
                  <dd>{formatVolume(quote?.volume)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Technical Indicators</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-400">SMA (20)</dt>
                  <dd>{formatPrice(indicators.sma20[indicators.sma20.length - 1])}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">RSI (14)</dt>
                  <dd>{Number.isFinite(latestRsi) ? latestRsi.toFixed(2) : "--"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">MACD</dt>
                  <dd>{Number.isFinite(latestMacd) ? latestMacd.toFixed(2) : "--"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Fundamentals</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Market Cap</dt>
                  <dd>{formatVolume(overview?.marketCap)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">P/E Ratio</dt>
                  <dd>{overview?.peRatio ? Number(overview.peRatio).toFixed(2) : "--"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">52W High</dt>
                  <dd>{formatPrice(overview?.weekHigh)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">52W Low</dt>
                  <dd>{formatPrice(overview?.weekLow)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Avg Volume</dt>
                  <dd>{formatVolume(overview?.averageVolume)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
