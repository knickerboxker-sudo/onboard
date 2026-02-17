"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: { address: string; lat: number; lng: number }) => void;
  required?: boolean;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function AddressAutocomplete({ value, onChange, onSelect, required }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!MAPBOX_TOKEN || query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=address,poi&limit=5`;
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setSuggestions(data.features ?? []);
      setOpen((data.features ?? []).length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (text: string) => {
    onChange(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const handleSelect = (suggestion: Suggestion) => {
    const [lng, lat] = suggestion.center;
    onSelect({ address: suggestion.place_name, lat, lng });
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Fallback: no Mapbox token — plain text input
  if (!MAPBOX_TOKEN) {
    return <input className="input" onChange={(e) => onChange(e.target.value)} required={required} value={value} />;
  }

  return (
    <div className="relative" ref={containerRef}>
      <input
        autoComplete="off"
        className="input"
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        required={required}
        value={value}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-neutral-200 bg-white/90 shadow-lg backdrop-blur-sm">
          {suggestions.map((s, i) => (
            <li
              className={`cursor-pointer px-3 py-2 text-sm text-neutral-700 ${i === activeIndex ? "bg-sky-50 text-sky-800" : "hover:bg-neutral-50"}`}
              key={s.id}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {s.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
