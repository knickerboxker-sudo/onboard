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
      <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Permit Search</h1>
      <p className="text-sm text-gray-600">
        Search by ZIP code, optionally set a filed date range, and sort by newest filing date or permit value.
      </p>
      <FilterBar
        zipCode={filters.zipCode}
        sortBy={filters.sortBy}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onChange={handleFilterChange}
      />
      <p className="flex items-center gap-2 text-sm text-gray-600">
        {permits.length} permits found
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span>Searching permits...</span>
          </>
        ) : null}
      </p>
      <section className="space-y-4">
        {permits.length ? (
          <PermitTable permits={permits} />
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-700">
            <p className="font-medium text-gray-900">No permits found matching your search criteria.</p>
            <p className="mt-1">Try another ZIP code or expand your selected date range.</p>
          </div>
        )}
      </section>
    </div>
  );
}
