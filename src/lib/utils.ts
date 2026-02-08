import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
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
  };
  return labels[cat] || cat;
}

export function sourceLabel(src: string): string {
  const labels: Record<string, string> = {
    CPSC: "CPSC",
    NHTSA: "NHTSA",
    FSIS: "USDA FSIS",
    FDA: "FDA",
  };
  return labels[src] || src;
}

export function categoryColor(cat: string): string {
  const colors: Record<string, string> = {
    vehicle: "bg-blue-900/50 text-blue-300 border-blue-700",
    consumer: "bg-purple-900/50 text-purple-300 border-purple-700",
    food: "bg-green-900/50 text-green-300 border-green-700",
    drug: "bg-orange-900/50 text-orange-300 border-orange-700",
    device: "bg-red-900/50 text-red-300 border-red-700",
  };
  return colors[cat] || "bg-gray-900/50 text-gray-300 border-gray-700";
}
