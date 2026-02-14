"use client";

import { useMemo } from "react";

type FilterBarProps = {
  search: string;
  city: string;
  type: string;
  onChange: (name: string, value: string) => void;
  cities: string[];
};

export function FilterBar({ search, city, type, onChange, cities }: FilterBarProps) {
  const activeFilters = useMemo(() => [search, city, type].filter(Boolean).length, [search, city, type]);

  return (
    <section className="sticky top-16 z-40 mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <input
          aria-label="Search by address"
          value={search}
          onChange={(event) => onChange("search", event.target.value)}
          placeholder="Search address"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          aria-label="Filter by city"
          value={city}
          onChange={(event) => onChange("city", event.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All cities</option>
          {cities.map((cityOption) => (
            <option key={cityOption} value={cityOption}>
              {cityOption}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by permit type"
          value={type}
          onChange={(event) => onChange("type", event.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All types</option>
          <option value="Commercial">Commercial</option>
          <option value="Residential">Residential</option>
          <option value="Renovation">Renovation</option>
          <option value="New Construction">New Construction</option>
        </select>
        <button
          onClick={() => {
            onChange("search", "");
            onChange("city", "");
            onChange("type", "");
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm transition hover:bg-gray-50"
        >
          Clear all {activeFilters ? `(${activeFilters})` : ""}
        </button>
      </div>
    </section>
  );
}
