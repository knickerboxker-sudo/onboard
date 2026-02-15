export const formatPrice = (value) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num)
    : "$0.00";
};

export const formatChangePercent = (value) => {
  const num = Number(value ?? 0);
  const formatted = Number.isFinite(num) ? num.toFixed(2) : "0.00";
  return `${num >= 0 ? "+" : ""}${formatted}%`;
};
