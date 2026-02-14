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
    return variant === "table" ? "text-slate-900 bg-slate-50" : "bg-slate-50 text-slate-900";
  }
  if (tier === "medium") {
    return variant === "table" ? "text-slate-800 bg-slate-50" : "bg-slate-50 text-slate-800";
  }
  return variant === "table" ? "text-slate-700 bg-slate-50" : "bg-slate-50 text-slate-700";
}

export function getPermitStatusClasses(status: Permit["status"]) {
  if (status === "Approved") return "bg-slate-100 text-slate-700";
  if (status === "Under Review") return "bg-slate-100 text-slate-700";
  if (status === "Started") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
}
