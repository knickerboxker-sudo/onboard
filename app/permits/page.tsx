"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { PermitTable } from "@/components/dashboard/PermitTable";
import type { Permit } from "@/lib/types";
import { getPermits } from "@/lib/api/permits";
import type { PermitFilters } from "@/lib/api/permits";

type PermitPageFilters = {
  zipCode: string;
  sortBy: NonNullable<PermitFilters["sortBy"]>;
  dateFrom: string;
  dateTo: string;
};

export default function PermitsPage() {
  const router = useRouter();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<PermitPageFilters>({
    zipCode: "",
    sortBy: "filed-newest",
    dateFrom: "",
    dateTo: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<PermitPageFilters>(filters);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setAppliedFilters((current) => ({ ...current, zipCode: filters.zipCode }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.zipCode]);

  useEffect(() => {
    let isCurrent = true;

    async function loadPermits() {
      const shouldSearch = appliedFilters.zipCode.length === 5;
      if (!shouldSearch) {
        setPermits([]);
        setIsLoading(false);
        router.replace("/permits");
        return;
      }

      setIsLoading(true);
      const nextPermits = await getPermits(appliedFilters);
      if (!isCurrent) return;

      setPermits(nextPermits);
      setIsLoading(false);
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value && !(key === "sortBy" && value === "filed-newest")) params.set(key, value);
      });
      router.replace(params.toString() ? `/permits?${params.toString()}` : "/permits");
    }

    void loadPermits();

    return () => {
      isCurrent = false;
    };
  }, [appliedFilters, router]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((current) => ({ ...current, [name as keyof PermitPageFilters]: value }));
    if (name !== "zipCode") {
      setAppliedFilters((current) => ({ ...current, [name as keyof PermitPageFilters]: value }));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Permit Search</h1>
      <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
        Start with a ZIP code to view local permits. Then refine by filing date and sort by newest filing or value.
      </p>
      <FilterBar
        zipCode={filters.zipCode}
        sortBy={filters.sortBy}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onChange={handleFilterChange}
      />
      {appliedFilters.zipCode.length === 5 ? (
        <p className="flex items-center gap-2 text-sm text-slate-600">
          {permits.length} permits found
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              <span>Searching permits...</span>
            </>
          ) : null}
        </p>
      ) : (
        <p className="text-sm text-slate-500">Enter a 5-digit ZIP code to view permit results.</p>
      )}
      <section className="space-y-4">
        {appliedFilters.zipCode.length < 5 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">
            <p className="font-medium text-slate-900">No results shown yet.</p>
            <p className="mt-1">Search by ZIP code to explore permits in a specific area.</p>
          </div>
        ) : permits.length ? (
          <PermitTable permits={permits} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700">
            <p className="font-medium text-slate-900">No permits found matching your search criteria.</p>
            <p className="mt-1">Try another ZIP code or expand your selected date range.</p>
          </div>
        )}
      </section>
    </div>
  );
}
