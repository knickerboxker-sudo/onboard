"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { PermitTable } from "@/components/dashboard/PermitTable";
import type { Permit } from "@/lib/types";
import { getPermits } from "@/lib/api/permits";
import type { PermitFilters } from "@/lib/api/permits";

type PermitPageFilters = {
  search: string;
  city: string;
  zipCode: string;
  type: string;
  sortBy: NonNullable<PermitFilters["sortBy"]> | "";
};

export default function PermitsPage() {
  const router = useRouter();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<PermitPageFilters>({
    search: "",
    city: "",
    zipCode: "",
    type: "",
    sortBy: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<PermitPageFilters>({
    search: "",
    city: "",
    zipCode: "",
    type: "",
    sortBy: "",
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setAppliedFilters((current) => ({
        ...current,
        search: filters.search,
        zipCode: filters.zipCode,
      }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.search, filters.zipCode]);

  useEffect(() => {
    let isCurrent = true;

    async function loadPermits() {
      setIsLoading(true);
      const nextPermits = await getPermits({
        ...appliedFilters,
        sortBy: appliedFilters.sortBy || undefined,
      });
      if (!isCurrent) return;

      setPermits(nextPermits);
      setIsLoading(false);
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
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
    if (name === "city" || name === "type" || name === "sortBy") {
      setAppliedFilters((current) => ({ ...current, [name as keyof PermitPageFilters]: value }));
    }
  };


  const cities = useMemo(() => [...new Set(permits.map((permit) => permit.city))], [permits]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-gray-900">All Permits</h1>
      <p className="text-sm text-gray-600">
        Search by location (including ZIP code), then sort by price or date to prioritize the best jobs.
      </p>
      <FilterBar
        search={filters.search}
        city={filters.city}
        zipCode={filters.zipCode}
        type={filters.type}
        sortBy={filters.sortBy}
        cities={cities}
        onChange={handleFilterChange}
      />
      <p className="flex items-center gap-2 text-sm text-gray-600">
        {permits.length} permits found {filters.sortBy ? "" : "(sorted by most recent)"}
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
            <p className="mt-1">
              Try clearing filters or broadening your search terms. ZIP code searches such as 48160 or
              48176 can return zero matches when there are no permits in those areas.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
