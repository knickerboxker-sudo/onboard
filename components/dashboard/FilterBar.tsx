"use client";

import { useMemo } from "react";
import { ArrowUpDown, CalendarDays, Search, SlidersHorizontal } from "lucide-react";

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
    <section className="sticky top-16 z-40 mb-4 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur md:p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
        <SlidersHorizontal className="h-4 w-4 text-blue-600" />
        Filters
        {activeFilters ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">{activeFilters} active</span> : null}
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-12">
        <label className="relative block xl:col-span-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Filter by zip code"
            value={zipCode}
            onChange={(event) => onChange("zipCode", event.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder="ZIP code"
            className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-sm"
          />
        </label>
        <label className="relative block xl:col-span-3">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            aria-label="Sort permits"
            value={sortBy}
            onChange={(event) => onChange("sortBy", event.target.value)}
            className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-sm"
          >
            <option value="filed-newest">Filed: Newest First</option>
            <option value="filed-oldest">Filed: Oldest First</option>
            <option value="value-high">Price: High to Low</option>
            <option value="value-low">Price: Low to High</option>
          </select>
        </label>
        <label className="relative block xl:col-span-2">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Filed from"
            type="date"
            value={dateFrom}
            onChange={(event) => onChange("dateFrom", event.target.value)}
            className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-sm"
          />
        </label>
        <label className="relative block xl:col-span-2">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Filed to"
            type="date"
            value={dateTo}
            onChange={(event) => onChange("dateTo", event.target.value)}
            className="min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 md:text-sm"
          />
        </label>
        <button
          onClick={() => {
            onChange("zipCode", "");
            onChange("sortBy", "filed-newest");
            onChange("dateFrom", "");
            onChange("dateTo", "");
          }}
          className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base font-medium text-slate-700 transition hover:bg-slate-50 md:text-sm xl:col-span-2"
        >
          Clear all {activeFilters ? `(${activeFilters})` : ""}
        </button>
      </div>
    </section>
  );
}
