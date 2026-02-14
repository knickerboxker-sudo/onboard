import mockPermits from "@/public/data/mock-permits.json";
import type { Permit } from "@/lib/types";
import { isDateAfter, subDays } from "@/lib/date";

type PermitFilters = {
  search?: string;
  city?: string;
  zipCode?: string;
  type?: string;
  sortBy?: "value-high" | "value-low" | "filed-newest" | "filed-oldest";
};

const permits = mockPermits as Permit[];

export async function getPermits(filters?: PermitFilters) {
  if (!filters) {
    return permits;
  }

  const filtered = permits.filter((permit) => {
    const matchSearch =
      !filters.search || permit.address.toLowerCase().includes(filters.search.toLowerCase());
    const matchCity = !filters.city || permit.city === filters.city;
    const matchZipCode = !filters.zipCode || permit.zipCode.startsWith(filters.zipCode);
    const matchType = !filters.type || permit.permitType === filters.type;

    return matchSearch && matchCity && matchZipCode && matchType;
  });

  if (!filters.sortBy) {
    return filtered;
  }

  return [...filtered].sort((a, b) => {
    if (filters.sortBy === "value-high") {
      return b.estimatedValue - a.estimatedValue;
    }
    if (filters.sortBy === "value-low") {
      return a.estimatedValue - b.estimatedValue;
    }
    if (filters.sortBy === "filed-oldest") {
      return new Date(a.filedDate).getTime() - new Date(b.filedDate).getTime();
    }

    return new Date(b.filedDate).getTime() - new Date(a.filedDate).getTime();
  });
}

export async function getPermitById(id: string) {
  return permits.find((permit) => permit.id === id) ?? null;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getPermitStats(items: Permit[]) {
  const weekAgo = subDays(new Date(), 7);
  const totalThisWeek = items.filter((permit) => isDateAfter(permit.filedDate, weekAgo)).length;
  const totalValue = items.reduce((sum, permit) => sum + permit.estimatedValue, 0);
  const newValueThisWeek = items
    .filter((permit) => isDateAfter(permit.filedDate, weekAgo))
    .reduce((sum, permit) => sum + permit.estimatedValue, 0);

  return {
    totalThisWeek,
    averageValue: items.length ? totalValue / items.length : 0,
    hotLeads: items.filter((permit) => permit.estimatedValue >= 200000).length,
    newValueThisWeek,
  };
}
