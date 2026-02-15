import { calculateMACD, calculateRSI, calculateSMA } from "@/utils/calculateIndicators";

const candles = [
  { close: 100 },
  { close: 101 },
  { close: 102 },
  { close: 103 },
  { close: 104 },
].map((item, index) => ({ ...item, open: item.close - 0.5, high: item.close + 1, low: item.close - 1, time: `${index}` }));

describe("calculateIndicators", () => {
  it("calculates moving average for each candle", () => {
    const sma = calculateSMA(candles, 3);
    expect(sma).toHaveLength(candles.length);
    expect(sma[2]).toBeCloseTo(101);
  });

  it("returns RSI and MACD arrays", () => {
    const rsi = calculateRSI(candles, 3);
    const macd = calculateMACD(candles);

    expect(rsi.length).toBe(candles.length - 1);
    expect(macd.length).toBe(candles.length);
  });
});
