import type { Permit } from "@/lib/types";

export type PermitValueTier = "high" | "medium" | "low";
export type PermitValueClassVariant = "card" | "table";

export const HIGH_VALUE_THRESHOLD = 200000;
export const MEDIUM_VALUE_THRESHOLD = 50000;

export function getPermitValueTier(value: number): PermitValueTier {
  if (value > HIGH_VALUE_THRESHOLD) return "high";
  if (value >= MEDIUM_VALUE_THRESHOLD) return "medium";
  return "low";
}

export function getPermitValueClasses(value: number, variant: PermitValueClassVariant) {
  const tier = getPermitValueTier(value);
  if (tier === "high") {
    return variant === "table" ? "text-emerald-600 bg-emerald-50" : "bg-emerald-50 text-emerald-700";
  }
  if (tier === "medium") {
    return variant === "table" ? "text-blue-600 bg-blue-50" : "bg-blue-50 text-blue-700";
  }
  return variant === "table" ? "text-slate-600 bg-slate-100" : "bg-slate-100 text-slate-700";
}

export function getPermitStatusClasses(status: Permit["status"]) {
  if (status === "Approved") return "bg-emerald-100 text-emerald-700";
  if (status === "Under Review") return "bg-amber-100 text-amber-700";
  if (status === "Started") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
}
