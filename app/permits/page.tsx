"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { PermitTable } from "@/components/dashboard/PermitTable";
import type { Permit } from "@/lib/types";
import { getPermits } from "@/lib/api/permits";

export default function PermitsPage() {
  const router = useRouter();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    zipCode: "",
    type: "",
    sortBy: "",
  });

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const nextPermits = await getPermits(filters);
      setPermits(nextPermits);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      router.replace(params.toString() ? `/permits?${params.toString()}` : "/permits");
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, router]);

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
        onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
      />
      <p className="text-sm text-gray-600">{permits.length} permits found</p>
      <section className="space-y-4">
        <PermitTable permits={permits} />
      </section>
    </div>
  );
}
