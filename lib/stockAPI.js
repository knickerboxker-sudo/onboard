const BASE_URL = "https://www.alphavantage.co/query";
const cache = new Map();
const CACHE_TTL_MS = 8_000;

const getApiKey = () =>
  process.env.NEXT_PUBLIC_STOCK_API_KEY || process.env.REACT_APP_STOCK_API_KEY || "";

const getCached = (key) => {
  const cached = cache.get(key);
  if (!cached || Date.now() > cached.expiresAt) {
    return null;
  }
  return cached.value;
};

const setCached = (key, value) => {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
};

const request = async (params) => {
  const apiKey = getApiKey();
  const url = new URL(BASE_URL);
  Object.entries({ ...params, apikey: apiKey }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const cacheKey = url.toString();
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  if (!apiKey) {
    throw new Error("Missing API key. Set NEXT_PUBLIC_STOCK_API_KEY (or REACT_APP_STOCK_API_KEY).");
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Stock API request failed (${response.status})`);
  }

  const payload = await response.json();
  if (payload.Note) {
    throw new Error("API rate limit reached. Waiting for next refresh window.");
  }

  if (payload["Error Message"]) {
    throw new Error(payload["Error Message"]);
  }

  setCached(cacheKey, payload);
  return payload;
};

const seedPrice = (symbol) => {
  const hash = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 100 + (hash % 250);
};

const buildMockCandles = (symbol, points = 60) => {
  const base = seedPrice(symbol);
  return Array.from({ length: points }, (_, index) => {
    const date = new Date(Date.now() - (points - index) * 60 * 1000);
    const wave = Math.sin((index + base) / 7) * 1.2;
    const open = base + wave + index * 0.05;
    const close = open + Math.sin(index / 3) * 0.9;
    const high = Math.max(open, close) + 0.8;
    const low = Math.min(open, close) - 0.8;

    return {
      time: date.toISOString(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round((Math.abs(wave) + 1) * 1_000_000 + index * 10_000),
    };
  });
};

export const fetchQuote = async (symbol) => {
  try {
    const payload = await request({ function: "GLOBAL_QUOTE", symbol });
    const quote = payload["Global Quote"] || {};
    return {
      symbol,
      price: Number(quote["05. price"] || 0),
      change: Number(quote["09. change"] || 0),
      changePercent: Number(String(quote["10. change percent"] || "0").replace("%", "")),
      high: Number(quote["03. high"] || quote["05. price"] || 0),
      low: Number(quote["04. low"] || quote["05. price"] || 0),
      volume: Number(quote["06. volume"] || 0),
    };
  } catch {
    const candles = buildMockCandles(symbol, 2);
    const [prev, latest] = candles;
    return {
      symbol,
      price: latest.close,
      change: Number((latest.close - prev.close).toFixed(2)),
      changePercent: Number((((latest.close - prev.close) / prev.close) * 100).toFixed(2)),
      high: latest.high,
      low: latest.low,
      volume: latest.volume,
    };
  }
};

export const fetchIntradayData = async (symbol, interval = "5min", points = 120) => {
  try {
    const payload = await request({
      function: "TIME_SERIES_INTRADAY",
      symbol,
      interval,
      outputsize: "compact",
    });
    const series = payload[`Time Series (${interval})`] || {};
    return Object.entries(series)
      .map(([time, row]) => ({
        time,
        open: Number(row["1. open"]),
        high: Number(row["2. high"]),
        low: Number(row["3. low"]),
        close: Number(row["4. close"]),
        volume: Number(row["5. volume"]),
      }))
      .sort((a, b) => new Date(a.time) - new Date(b.time))
      .slice(-points);
  } catch {
    return buildMockCandles(symbol, points);
  }
};

export const fetchOverview = async (symbol) => {
  try {
    const payload = await request({ function: "OVERVIEW", symbol });
    return {
      marketCap: Number(payload.MarketCapitalization || 0),
      peRatio: Number(payload.PERatio || 0),
      weekHigh: Number(payload["52WeekHigh"] || 0),
      weekLow: Number(payload["52WeekLow"] || 0),
      averageVolume: Number(payload.AverageDailyVolume10Day || 0),
    };
  } catch {
    return {
      marketCap: 1_000_000_000_000,
      peRatio: 28.4,
      weekHigh: 250,
      weekLow: 170,
      averageVolume: 88_000_000,
    };
  }
};
