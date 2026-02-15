"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchIntradayData, fetchOverview, fetchQuote } from "@/lib/stockAPI";
import { calculateMACD, calculateRSI, calculateSMA } from "@/utils/calculateIndicators";

const timeframeConfig = {
  "1D": { interval: "1min", points: 60 },
  "1W": { interval: "5min", points: 120 },
  "1M": { interval: "15min", points: 160 },
  "3M": { interval: "60min", points: 180 },
  "1Y": { interval: "60min", points: 240 },
};

export const useStockData = (symbol, timeframe) => {
  const [state, setState] = useState({
    quote: null,
    candles: [],
    overview: null,
    indicators: { sma20: [], rsi: [], macd: [] },
    loading: true,
    error: "",
  });
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setState((prev) => ({ ...prev, loading: prev.candles.length === 0, error: "" }));

    const config = timeframeConfig[timeframe] || timeframeConfig["1D"];

    try {
      const [quote, candles, overview] = await Promise.all([
        fetchQuote(symbol),
        fetchIntradayData(symbol, config.interval, config.points),
        fetchOverview(symbol),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      const sma20 = calculateSMA(candles, 20);
      const rsi = calculateRSI(candles, 14);
      const macd = calculateMACD(candles);

      setState({
        quote,
        candles: candles.map((candle, index) => ({ ...candle, sma20: sma20[index], macd: macd[index] })),
        overview,
        indicators: { sma20, rsi, macd },
        loading: false,
        error: "",
      });
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unable to load stock data.",
        }));
      }
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 10_000);
    return () => clearInterval(timer);
  }, [load]);

  return { ...state, refresh: load };
};
