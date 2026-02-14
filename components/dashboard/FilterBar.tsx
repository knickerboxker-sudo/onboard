"use client";

import { useMemo } from "react";

type FilterBarProps = {
  zipCode: string;
  sortBy: string;
  dateFrom: string;
  dateTo: string;
  onChange: (name: string, value: string) => void;
};

export function FilterBar({ zipCode, sortBy, dateFrom, dateTo, onChange }: FilterBarProps) {
  const activeFilters = useMemo(() => [zipCode, sortBy !== "filed-newest" ? sortBy : "", dateFrom, dateTo].filter(Boolean).length, [zipCode, sortBy, dateFrom, dateTo]);

  return (
    <section className="sticky top-16 z-40 mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <input
          aria-label="Filter by zip code"
          value={zipCode}
          onChange={(event) => onChange("zipCode", event.target.value.replace(/\D/g, "").slice(0, 5))}
          placeholder="ZIP code"
          className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-sm"
        />
        <select
          aria-label="Sort permits"
          value={sortBy}
          onChange={(event) => onChange("sortBy", event.target.value)}
          className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-sm"
        >
          <option value="filed-newest">Filed: Newest First</option>
          <option value="filed-oldest">Filed: Oldest First</option>
          <option value="value-high">Price: High to Low</option>
          <option value="value-low">Price: Low to High</option>
        </select>
        <input
          aria-label="Filed from"
          type="date"
          value={dateFrom}
          onChange={(event) => onChange("dateFrom", event.target.value)}
          className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-sm"
        />
        <input
          aria-label="Filed to"
          type="date"
          value={dateTo}
          onChange={(event) => onChange("dateTo", event.target.value)}
          className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-sm"
        />
        <button
          onClick={() => {
            onChange("zipCode", "");
            onChange("sortBy", "filed-newest");
            onChange("dateFrom", "");
            onChange("dateTo", "");
          }}
          className="min-h-11 w-full rounded-md border border-gray-300 px-3 py-2.5 text-base transition hover:bg-gray-50 md:text-sm"
        >
          Clear all {activeFilters ? `(${activeFilters})` : ""}
        </button>
      </div>
    </section>
  );
}
