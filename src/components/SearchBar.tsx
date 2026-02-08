"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar({
  defaultValue = "",
  large = false,
}: {
  defaultValue?: string;
  large?: boolean;
}) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSearch = (q?: string) => {
    const searchQ = q || query;
    if (searchQ.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQ.trim())}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/60"
            size={large ? 20 : 18}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search recalls by product, brand, company..."
            className={`w-full bg-white border border-border rounded-xl text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all shadow-card ${
              large ? "pl-12 pr-4 py-4 text-lg" : "pl-11 pr-4 py-3 text-base"
            }`}
          />
        </div>
        <button
          onClick={() => handleSearch()}
          className={`flex-shrink-0 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-all shadow-card hover:shadow-card-hover active:scale-[0.98] ${
            large ? "px-6 py-4 text-base" : "px-5 py-3 text-sm"
          }`}
        >
          Search
        </button>
      </div>
    </div>
  );
}
