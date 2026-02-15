export const formatVolume = (value) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num)
    ? new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(num)
    : "0";
};
