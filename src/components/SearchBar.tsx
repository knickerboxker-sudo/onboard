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
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          size={large ? 22 : 18}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search recalls by product, brand, company..."
          className={`w-full bg-card border border-border rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors ${
            large ? "pl-12 pr-4 py-4 text-lg" : "pl-10 pr-4 py-3 text-base"
          }`}
        />
      </div>
    </div>
  );
}
