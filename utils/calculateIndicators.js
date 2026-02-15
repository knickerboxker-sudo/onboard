const avg = (values) =>
  values.reduce((sum, value) => sum + Number(value || 0), 0) / (values.length || 1);

export const calculateSMA = (candles, period = 20) =>
  candles.map((_, index) => {
    const slice = candles.slice(Math.max(0, index - period + 1), index + 1);
    return Number(avg(slice.map((item) => item.close)).toFixed(2));
  });

export const calculateRSI = (candles, period = 14) => {
  if (candles.length < 2) {
    return [];
  }

  const gains = [];
  const losses = [];

  for (let i = 1; i < candles.length; i += 1) {
    const delta = candles[i].close - candles[i - 1].close;
    gains.push(Math.max(delta, 0));
    losses.push(Math.max(delta * -1, 0));
  }

  return gains.map((_, index) => {
    const start = Math.max(0, index - period + 1);
    const avgGain = avg(gains.slice(start, index + 1));
    const avgLoss = avg(losses.slice(start, index + 1));
    if (avgLoss === 0) {
      return 100;
    }
    const rs = avgGain / avgLoss;
    return Number((100 - 100 / (1 + rs)).toFixed(2));
  });
};

export const calculateMACD = (candles) => {
  const closes = candles.map((item) => item.close);
  const ema = (period) => {
    const multiplier = 2 / (period + 1);
    return closes.reduce((acc, price, index) => {
      if (index === 0) {
        return [price];
      }
      return [...acc, price * multiplier + acc[index - 1] * (1 - multiplier)];
    }, []);
  };

  const ema12 = ema(12);
  const ema26 = ema(26);
  return ema12.map((value, index) => Number((value - (ema26[index] || value)).toFixed(2)));
};
