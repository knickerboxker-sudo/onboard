import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return "Unknown date";
  }
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len).trimEnd() + "...";
}

export function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    vehicle: "Vehicle",
    consumer: "Consumer Product",
    food: "Food",
    drug: "Drug",
    device: "Medical Device",
    environmental: "Environmental",
    marine: "Marine",
  };
  return labels[cat] || cat;
}

export function sectorLabel(sector: string): string {
  const labels: Record<string, string> = {
    FOOD: "Food",
    DRUGS: "Drugs",
    MEDICAL_DEVICE: "Medical Device",
    CONSUMER_PRODUCT: "Consumer Product",
    VEHICLE: "Vehicle",
    MARITIME: "Maritime",
    ENVIRONMENTAL: "Environmental",
    OTHER: "Other",
  };
  return labels[sector] || sector;
}

export function sectorColor(sector: string): string {
  const colors: Record<string, string> = {
    FOOD: "bg-emerald-50 text-emerald-700 border-emerald-200",
    DRUGS: "bg-amber-50 text-amber-700 border-amber-200",
    MEDICAL_DEVICE: "bg-rose-50 text-rose-700 border-rose-200",
    CONSUMER_PRODUCT: "bg-purple-50 text-purple-700 border-purple-200",
    VEHICLE: "bg-blue-50 text-blue-700 border-blue-200",
    MARITIME: "bg-cyan-50 text-cyan-700 border-cyan-200",
    ENVIRONMENTAL: "bg-teal-50 text-teal-700 border-teal-200",
    OTHER: "bg-gray-50 text-gray-700 border-gray-200",
  };
  return colors[sector] || "bg-gray-50 text-gray-700 border-gray-200";
}

export function sourceLabel(src: string): string {
  const labels: Record<string, string> = {
    CPSC: "CPSC",
    NHTSA: "NHTSA",
    FSIS: "USDA FSIS",
    FDA: "FDA",
    EPA: "EPA",
    USCG: "USCG",
  };
  return labels[src] || src;
}

export function categoryColor(cat: string): string {
  const colors: Record<string, string> = {
    vehicle: "bg-blue-50 text-blue-700 border-blue-200",
    consumer: "bg-purple-50 text-purple-700 border-purple-200",
    food: "bg-emerald-50 text-emerald-700 border-emerald-200",
    drug: "bg-amber-50 text-amber-700 border-amber-200",
    device: "bg-rose-50 text-rose-700 border-rose-200",
    environmental: "bg-teal-50 text-teal-700 border-teal-200",
    marine: "bg-cyan-50 text-cyan-700 border-cyan-200",
  };
  return colors[cat] || "bg-gray-50 text-gray-700 border-gray-200";
}
