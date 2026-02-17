"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { haversineMiles, matchQualityScore, getTrustBadges } from "@/lib/matching";
import type { BusinessRecord, TrustBadge } from "@/lib/types";
import {
  Filter,
  Grid3X3,
  List,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  TrendingUp,
  X,
  ArrowRight,
  Bookmark,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PARTNERSHIP_TYPE_OPTIONS = [
  { value: "cross-promotion", label: "Cross Promotion" },
  { value: "product-bundle", label: "Product Bundle" },
  { value: "event-collab", label: "Event Collaboration" },
  { value: "wholesale", label: "Wholesale" },
  { value: "social-media-collab", label: "Social Media Collab" },
];

const INTEREST_TAG_OPTIONS = [
  "Events", "Cross-Promotion", "Product Placement", "Revenue Share",
  "Referral Program", "Joint Marketing", "Space Sharing", "Equipment Sharing", "Bulk Purchasing",
];

const DISTANCE_OPTIONS = [
  { value: 5, label: "5 miles" },
  { value: 10, label: "10 miles" },
  { value: 25, label: "25 miles" },
  { value: 50, label: "50 miles" },
  { value: 100, label: "100 miles" },
];

const SORT_OPTIONS = [
  { value: "match_score", label: "Match Score" },
  { value: "distance", label: "Distance" },
  { value: "newest", label: "Newest" },
  { value: "most_active", label: "Most Active" },
  { value: "recently_updated", label: "Recently Updated" },
  { value: "verified", label: "Most Verified" },
];

const BADGE_STYLES: Record<TrustBadge["type"], string> = {
  verified: "border-emerald-100 bg-emerald-50 text-emerald-700",
  established: "border-amber-100 bg-amber-50 text-amber-700",
  top_partner: "border-violet-100 bg-violet-50 text-violet-700",
  fast_responder: "border-sky-100 bg-sky-50 text-sky-700",
};

type SavedSearch = {
  id: string;
  name: string;
  filters: FilterState;
};

type FilterState = {
  searchQuery: string;
  partnershipTypes: string[];
  interestTags: string[];
  maxDistance: number;
  verifiedOnly: boolean;
  minYears: number;
  categories: string[];
};

const defaultFilters: FilterState = {
  searchQuery: "",
  partnershipTypes: [],
  interestTags: [],
  maxDistance: 50,
  verifiedOnly: false,
  minYears: 0,
  categories: [],
};

function BusinessCard({
  business,
  view,
  userBusiness,
  selected,
  onToggleSelect,
}: {
  business: BusinessRecord & { distanceMiles: number | null; score: number };
  view: "grid" | "list";
  userBusiness: BusinessRecord | null;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const badges = getTrustBadges(business);
  const isGrid = view === "grid";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group rounded-2xl bg-white shadow-card ring-1 ring-slate-100 transition-all hover:shadow-card-hover ${
        isGrid ? "p-5" : "flex items-center gap-4 p-4"
      } ${selected ? "ring-2 ring-sky-500" : ""}`}
    >
      <div className={isGrid ? "" : "min-w-0 flex-1"}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-900">{business.name}</h3>
            <p className="text-xs text-slate-500">{business.business_type}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSelect}
              className={`rounded-lg p-1.5 transition-colors ${
                selected ? "bg-sky-100 text-sky-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
              aria-label={selected ? "Deselect business" : "Select business"}
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>

        {business.description && (
          <p className={`mt-2 text-sm text-slate-500 ${isGrid ? "line-clamp-2" : "line-clamp-1"}`}>
            {business.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {business.distanceMiles != null && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" /> {business.distanceMiles.toFixed(1)} mi
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
            <TrendingUp className="h-3 w-3" /> {Math.round(business.score)}% match
          </span>
          {badges.map((badge) => (
            <span key={badge.type} className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${BADGE_STYLES[badge.type]}`}>
              {badge.label}
            </span>
          ))}
        </div>

        {business.partnership_types && business.partnership_types.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {business.partnership_types.slice(0, 3).map((type) => (
              <span key={type} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {type}
              </span>
            ))}
          </div>
        )}
      </div>

      {!isGrid && (
        <button
          className="flex-shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Connect
        </button>
      )}
    </motion.div>
  );
}

export default function DiscoverPage() {
  const supabase = useMemo(() => createClient(), []);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("match_score");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedSearchName, setSavedSearchName] = useState("");

  const { data: userBusiness } = useQuery({
    queryKey: ["discover-user-business"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      return (data as BusinessRecord) ?? null;
    },
  });

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["discover-businesses"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*").limit(200);
      return (data as BusinessRecord[]) ?? [];
    },
  });

  const filtered = useMemo(() => {
    let result = businesses
      .filter((b) => userBusiness?.id !== b.id)
      .map((b) => {
        const distanceMiles =
          userBusiness?.lat != null && userBusiness?.lng != null && b.lat != null && b.lng != null
            ? haversineMiles(userBusiness.lat, userBusiness.lng, b.lat, b.lng)
            : null;
        const score = userBusiness ? matchQualityScore(userBusiness, b, distanceMiles ?? 10) : 50;
        return { ...b, distanceMiles, score };
      });

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.business_type.toLowerCase().includes(q) ||
          (b.description ?? "").toLowerCase().includes(q)
      );
    }

    if (filters.partnershipTypes.length > 0) {
      result = result.filter((b) =>
        (b.partnership_types ?? []).some((t) => filters.partnershipTypes.includes(t))
      );
    }

    if (filters.maxDistance < 100) {
      result = result.filter((b) => b.distanceMiles == null || b.distanceMiles <= filters.maxDistance);
    }

    if (filters.verifiedOnly) {
      result = result.filter((b) => b.verified);
    }

    if (filters.minYears > 0) {
      result = result.filter((b) => (b.years_in_operation ?? 0) >= filters.minYears);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "match_score":
          return b.score - a.score;
        case "distance":
          return (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999);
        case "newest":
          return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
        case "verified":
          return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
        default:
          return 0;
      }
    });

    return result;
  }, [businesses, userBusiness, filters, sortBy]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function saveCurrentSearch() {
    if (!savedSearchName.trim()) return;
    const search: SavedSearch = {
      id: crypto.randomUUID(),
      name: savedSearchName.trim(),
      filters: { ...filters },
    };
    setSavedSearches((prev) => [...prev, search]);
    setSavedSearchName("");
  }

  function loadSavedSearch(search: SavedSearch) {
    setFilters(search.filters);
  }

  function removeSavedSearch(id: string) {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  }

  function togglePartnershipType(type: string) {
    setFilters((prev) => ({
      ...prev,
      partnershipTypes: prev.partnershipTypes.includes(type)
        ? prev.partnershipTypes.filter((t) => t !== type)
        : [...prev.partnershipTypes, type],
    }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Discover Partners</h1>
          <p className="mt-1 text-sm text-slate-500">
            Find and connect with complementary businesses in your area.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-lg p-2 transition-colors ${showFilters ? "bg-sky-50 text-sky-600" : "text-slate-400 hover:bg-slate-100"}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`rounded-lg p-2 transition-colors ${view === "grid" ? "bg-sky-50 text-sky-600" : "text-slate-400 hover:bg-slate-100"}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-lg p-2 transition-colors ${view === "list" ? "bg-sky-50 text-sky-600" : "text-slate-400 hover:bg-slate-100"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Search businesses by name, type, or description..."
          value={filters.searchQuery}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
        />
      </div>

      {/* Selection actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-sky-50 px-4 py-3 ring-1 ring-sky-200">
          <span className="text-sm font-medium text-sky-800">{selectedIds.size} selected</span>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-sky-600 hover:text-sky-700">
            Clear
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden flex-shrink-0 overflow-hidden lg:block"
            >
              <div className="w-64 space-y-5 rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
                  <button onClick={() => setFilters(defaultFilters)} className="text-xs text-sky-600 hover:text-sky-700">
                    Reset
                  </button>
                </div>

                {/* Sort */}
                <div>
                  <label className="label">Sort by</label>
                  <select className="input text-xs" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Partnership Types */}
                <div>
                  <p className="mb-2 text-xs font-medium text-slate-700">Partnership Type</p>
                  <div className="space-y-1.5">
                    {PARTNERSHIP_TYPE_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={filters.partnershipTypes.includes(opt.value)}
                          onChange={() => togglePartnershipType(opt.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <label className="label">Max Distance</label>
                  <select
                    className="input text-xs"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxDistance: Number(e.target.value) }))}
                  >
                    {DISTANCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Verified */}
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters((prev) => ({ ...prev, verifiedOnly: e.target.checked }))}
                  />
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Verified only
                </label>

                {/* Years in operation */}
                <div>
                  <label className="label">Min Years in Operation</label>
                  <input
                    type="number"
                    className="input text-xs"
                    min={0}
                    value={filters.minYears}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minYears: Number(e.target.value) }))}
                  />
                </div>

                {/* Save search */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-medium text-slate-700">Save Search</p>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1 text-xs"
                      placeholder="Search name"
                      value={savedSearchName}
                      onChange={(e) => setSavedSearchName(e.target.value)}
                    />
                    <button onClick={saveCurrentSearch} disabled={!savedSearchName.trim()} className="btn-muted text-xs px-2 disabled:opacity-50">
                      Save
                    </button>
                  </div>
                  {savedSearches.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {savedSearches.map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5 text-xs">
                          <button onClick={() => loadSavedSearch(s)} className="text-slate-700 hover:text-sky-600">
                            {s.name}
                          </button>
                          <button onClick={() => removeSavedSearch(s.id)} className="text-slate-400 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {isLoading ? "Loading..." : `${filtered.length} business${filtered.length !== 1 ? "es" : ""} found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-skeleton-pulse rounded-2xl bg-slate-100 p-5 h-40" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-slate-100">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm font-medium text-slate-600">No businesses match your filters</p>
              <p className="mt-1 text-xs text-slate-400">Try adjusting your search criteria</p>
              <button onClick={() => setFilters(defaultFilters)} className="btn-muted mt-4 text-xs">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
              <AnimatePresence>
                {filtered.map((b) => (
                  <BusinessCard
                    key={b.id}
                    business={b}
                    view={view}
                    userBusiness={userBusiness ?? null}
                    selected={selectedIds.has(b.id)}
                    onToggleSelect={() => toggleSelect(b.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
