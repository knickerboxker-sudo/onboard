import mockPermits from "@/public/data/mock-permits.json";
import { isAfter, parseISO, subDays } from "date-fns";
import type { Permit } from "@/lib/types";

type PermitFilters = {
  search?: string;
  city?: string;
  type?: string;
};

const permits = mockPermits as Permit[];

export async function getPermits(filters?: PermitFilters) {
  if (!filters) {
    return permits;
  }

  return permits.filter((permit) => {
    const matchSearch =
      !filters.search || permit.address.toLowerCase().includes(filters.search.toLowerCase());
    const matchCity = !filters.city || permit.city === filters.city;
    const matchType = !filters.type || permit.permitType === filters.type;

    return matchSearch && matchCity && matchType;
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
  const totalThisWeek = items.filter((permit) => isAfter(parseISO(permit.filedDate), weekAgo)).length;
  const totalValue = items.reduce((sum, permit) => sum + permit.estimatedValue, 0);
  const newValueThisWeek = items
    .filter((permit) => isAfter(parseISO(permit.filedDate), weekAgo))
    .reduce((sum, permit) => sum + permit.estimatedValue, 0);

  return {
    totalThisWeek,
    averageValue: items.length ? totalValue / items.length : 0,
    hotLeads: items.filter((permit) => permit.estimatedValue >= 200000).length,
    newValueThisWeek,
  };
}
