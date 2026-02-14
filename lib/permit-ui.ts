export type PermitValueTier = "high" | "medium" | "low";

export function getPermitValueTier(value: number): PermitValueTier {
  if (value > 200000) return "high";
  if (value >= 50000) return "medium";
  return "low";
}
