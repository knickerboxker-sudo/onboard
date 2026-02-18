"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { haversineMiles, matchQualityScore, getTrustBadges } from "@/lib/matching";
import type { BusinessRecord, TrustBadge } from "@/lib/types";
import {
  Grid3X3,
  List,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  X,
  Bookmark,
  Users,
  Send,
  Clock,
  Sparkles,
  Tag,
  CheckCircle,
  Loader2,
  MessageSquare,
  Navigation,
  AlertCircle,
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
  connectionStatus,
  onRequestConnection,
  isRequesting,
  errorMessage,
}: {
  business: BusinessRecord & { distanceMiles: number | null; score: number };
  view: "grid" | "list";
  userBusiness: BusinessRecord | null;
  selected: boolean;
  onToggleSelect: () => void;
  connectionStatus: "none" | "pending" | "accepted";
  onRequestConnection: () => void;
  isRequesting: boolean;
  errorMessage: string | null;
}) {
  const badges = getTrustBadges(business);
  const isGrid = view === "grid";

  // Find matching interest tags between user and this business
  const userTags = new Set(userBusiness?.partnership_interest_tags ?? []);
  const matchingTags = (business.partnership_interest_tags ?? []).filter((t) => userTags.has(t));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group relative overflow-hidden rounded-2xl bg-white border border-neutral-100 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated ${
        isGrid ? "p-6" : "flex items-center gap-4 p-5"
      } ${selected ? "ring-2 ring-lavender-400 border-lavender-200" : ""}`}
    >
      {/* Top accent line on hover */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-lavender-400 via-spearmint-400 to-lavender-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className={isGrid ? "" : "min-w-0 flex-1"}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-neutral-900">{business.name}</h3>
            <p className="text-xs text-neutral-500">{business.business_type}</p>
          </div>
          <div className="flex items-center gap-1">
            {business.created_at && (
              <span className="text-[10px] text-neutral-400">
                {new Date(business.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </span>
            )}
            <button
              onClick={onToggleSelect}
              className={`rounded-xl p-1.5 transition-all duration-200 ${
                selected ? "bg-lavender-100 text-lavender-600" : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              }`}
              aria-label={selected ? "Deselect business" : "Select business"}
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>

        {business.description && (
          <p className={`mt-2 text-sm text-neutral-500 ${isGrid ? "line-clamp-2" : "line-clamp-1"}`}>
            {business.description}
          </p>
        )}

        {/* Looking For / Can Offer sections */}
        {isGrid && (business.looking_for ?? []).length > 0 && (
          <div className="mt-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-creamsicle-600">Looking for</p>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {(business.looking_for ?? []).slice(0, 2).map((item) => (
                <span key={item} className="rounded-full bg-creamsicle-50 px-2 py-0.5 text-[10px] text-creamsicle-700">{item}</span>
              ))}
            </div>
          </div>
        )}
        {isGrid && (business.can_offer ?? []).length > 0 && (
          <div className="mt-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-spearmint-600">Can offer</p>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {(business.can_offer ?? []).slice(0, 2).map((item) => (
                <span key={item} className="rounded-full bg-spearmint-50 px-2 py-0.5 text-[10px] text-spearmint-700">{item}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {business.distanceMiles != null && (
            <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
              <MapPin className="h-3 w-3" /> {business.distanceMiles.toFixed(1)} mi
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-spearmint-50 px-2 py-0.5 text-[10px] font-semibold text-spearmint-700 border border-spearmint-100">
            <TrendingUp className="h-3 w-3" /> {Math.round(business.score)}% match
          </span>
          {badges.map((badge) => (
            <span key={badge.type} className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${BADGE_STYLES[badge.type]}`}>
              {badge.label}
            </span>
          ))}
        </div>

        {/* Partnership interest tags with matching highlighted */}
        {(business.partnership_interest_tags ?? []).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(business.partnership_interest_tags ?? []).slice(0, 4).map((tag) => (
              <span
                key={tag}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  matchingTags.includes(tag)
                    ? "bg-lavender-100 text-lavender-700 ring-1 ring-lavender-200"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {matchingTags.includes(tag) && <Tag className="mr-0.5 inline h-2.5 w-2.5" />}
                {tag}
              </span>
            ))}
          </div>
        )}

        {business.partnership_types && business.partnership_types.length > 0 && (business.partnership_interest_tags ?? []).length === 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {business.partnership_types.slice(0, 3).map((type) => (
              <span key={type} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600">
                {type}
              </span>
            ))}
          </div>
        )}

        {/* Request Connection button for grid view */}
        {isGrid && (
          <div className="mt-4 space-y-2">
            {connectionStatus === "accepted" ? (
              <Link
                href="/messages"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-spearmint-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-spearmint-700 hover:shadow-md active:scale-[0.98]"
              >
                <MessageSquare className="h-3 w-3" /> Message
              </Link>
            ) : connectionStatus === "pending" ? (
              <button
                disabled
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-neutral-100 px-3 py-2.5 text-xs font-semibold text-neutral-500 cursor-not-allowed"
              >
                <Clock className="h-3 w-3" /> Pending
              </button>
            ) : isRequesting ? (
              <button
                disabled
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2.5 text-xs font-semibold text-white shadow-sm cursor-not-allowed"
              >
                <Loader2 className="h-3 w-3 animate-spin" /> Sending...
              </button>
            ) : (
              <button
                onClick={onRequestConnection}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 hover:shadow-md active:scale-[0.98]"
              >
                <Send className="h-3 w-3" /> Request Connection
              </button>
            )}
            {errorMessage && (
              <p className="text-[10px] text-red-600 text-center">{errorMessage}</p>
            )}
          </div>
        )}
      </div>

      {!isGrid && (
        <div className="flex flex-col flex-shrink-0 gap-1 items-end">
          {connectionStatus === "accepted" ? (
            <Link
              href="/messages"
              className="flex items-center gap-1.5 rounded-xl bg-spearmint-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-spearmint-700 hover:shadow-md active:scale-[0.98]"
            >
              <MessageSquare className="h-3 w-3" /> Message
            </Link>
          ) : connectionStatus === "pending" ? (
            <button
              disabled
              className="flex items-center gap-1.5 rounded-xl bg-neutral-100 px-4 py-2.5 text-xs font-semibold text-neutral-500 cursor-not-allowed"
            >
              <Clock className="h-3 w-3" /> Pending
            </button>
          ) : isRequesting ? (
            <button
              disabled
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm cursor-not-allowed"
            >
              <Loader2 className="h-3 w-3 animate-spin" /> Sending...
            </button>
          ) : (
            <button
              onClick={onRequestConnection}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-neutral-800 hover:shadow-md active:scale-[0.98]"
            >
              <Send className="h-3 w-3" /> Connect
            </button>
          )}
          {errorMessage && (
            <p className="text-[10px] text-red-600">{errorMessage}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function DiscoverPage() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("match_score");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedSearchName, setSavedSearchName] = useState("");
  const [requestingIds, setRequestingIds] = useState<Set<string>>(new Set());
  const [errorMap, setErrorMap] = useState<Map<string, string>>(new Map());
  const [successIds, setSuccessIds] = useState<Set<string>>(new Set());

  // Location permission state
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [browserLat, setBrowserLat] = useState<number | null>(null);
  const [browserLng, setBrowserLng] = useState<number | null>(null);

  // Show location prompt once if user has no lat/lng on their business profile
  useEffect(() => {
    const dismissed = localStorage.getItem("sortir-location-dismissed");
    if (!dismissed) setShowLocationPrompt(true);
  }, []);

  const requestBrowserLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBrowserLat(pos.coords.latitude);
        setBrowserLng(pos.coords.longitude);
        setShowLocationPrompt(false);
        localStorage.setItem("sortir-location-dismissed", "1");
      },
      () => {
        setShowLocationPrompt(false);
        localStorage.setItem("sortir-location-dismissed", "1");
      },
    );
  };

  const dismissLocationPrompt = () => {
    setShowLocationPrompt(false);
    localStorage.setItem("sortir-location-dismissed", "1");
  };

  const { data: userBusiness } = useQuery({
    queryKey: ["discover-user-business"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      return (data as BusinessRecord) ?? null;
    },
  });

  // Effective user coordinates: prefer business profile, fall back to browser location
  const userLat = userBusiness?.lat ?? browserLat;
  const userLng = userBusiness?.lng ?? browserLng;

  // Fetch city launch statuses to know which cities are active
  const { data: launchedCities } = useQuery({
    queryKey: ["launched-cities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("city_launch_status")
        .select("city, launched")
        .eq("launched", true);
      return new Set((data ?? []).map((r: { city: string }) => r.city.toLowerCase()));
    },
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  // City launch status for the user's own city
  const { data: userCityStatus } = useQuery({
    queryKey: ["user-city-status", userBusiness?.city],
    enabled: !!userBusiness?.city,
    queryFn: async () => {
      if (!userBusiness?.city) return null;
      const { data } = await supabase
        .from("city_launch_status")
        .select("city, current_count, threshold, launched")
        .ilike("city", userBusiness.city ?? "")
        .single();
      return data ?? null;
    },
  });

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["discover-businesses"],
    queryFn: async () => {
      const { data } = await supabase.from("businesses").select("*").limit(200);
      return (data as BusinessRecord[]) ?? [];
    },
  });

  const { data: connectionRequests = [] } = useQuery({
    queryKey: ["connection-requests", userBusiness?.id],
    enabled: !!userBusiness?.id,
    queryFn: async () => {
      if (!userBusiness?.id) return [];
      const { data } = await supabase
        .from("connection_requests")
        .select("receiver_business_id, status")
        .eq("sender_business_id", userBusiness.id);
      return (data ?? []) as Array<{ receiver_business_id: string; status: string }>;
    },
  });

  const connectionRequestMutation = useMutation({
    mutationFn: async (receiverBusinessId: string) => {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver_business_id: receiverBusinessId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to send connection request");
      }
      
      return data;
    },
    onMutate: (receiverBusinessId: string) => {
      setRequestingIds((prev) => new Set(prev).add(receiverBusinessId));
      setErrorMap((prev) => {
        const next = new Map(prev);
        next.delete(receiverBusinessId);
        return next;
      });
    },
    onSuccess: (_data, receiverBusinessId) => {
      setSuccessIds((prev) => new Set(prev).add(receiverBusinessId));
      queryClient.invalidateQueries({ queryKey: ["connection-requests", userBusiness?.id] }).then(() => {
        // Clear the optimistic success state after the query has been invalidated
        setSuccessIds((prev) => {
          const next = new Set(prev);
          next.delete(receiverBusinessId);
          return next;
        });
      }).catch(() => {
        // Silently handle invalidation errors
      });
    },
    onError: (error, receiverBusinessId) => {
      setErrorMap((prev) => new Map(prev).set(receiverBusinessId, error.message));
    },
    onSettled: (_data, _error, receiverBusinessId) => {
      setRequestingIds((prev) => {
        const next = new Set(prev);
        next.delete(receiverBusinessId);
        return next;
      });
    },
  });

  const getConnectionStatus = (businessId: string): "none" | "pending" | "accepted" => {
    const request = connectionRequests.find((r) => r.receiver_business_id === businessId);
    if (request) {
      if (request.status === "accepted") return "accepted";
      if (request.status === "pending") return "pending";
    }
    // Fall back to optimistic state if no request found yet
    if (successIds.has(businessId)) return "pending";
    return "none";
  };

  const filtered = useMemo(() => {
    // Any city with known launch status. If launchedCities is empty (no cities launched yet),
    // show all businesses so the page is never empty.
    const hasAnyLaunched = launchedCities && launchedCities.size > 0;

    let result = businesses
      .filter((b) => userBusiness?.id !== b.id)
      .filter((b) => {
        // If there are launched cities, only show businesses whose city is launched
        // OR businesses without a city field (backwards-compat for existing profiles).
        if (!hasAnyLaunched) return true;
        const bCity = b.city;
        if (!bCity) return true; // no city set → include (legacy)
        return launchedCities!.has(bCity.toLowerCase());
      })
      .map((b) => {
        const distanceMiles =
          userLat != null && userLng != null && b.lat != null && b.lng != null
            ? haversineMiles(userLat, userLng, b.lat, b.lng)
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
          (b.description ?? "").toLowerCase().includes(q) ||
          (b.looking_for ?? []).some((lf) => lf.toLowerCase().includes(q)) ||
          (b.can_offer ?? []).some((co) => co.toLowerCase().includes(q))
      );
    }

    if (filters.partnershipTypes.length > 0) {
      result = result.filter((b) =>
        (b.partnership_types ?? []).some((t) => filters.partnershipTypes.includes(t))
      );
    }

    if (filters.interestTags.length > 0) {
      result = result.filter((b) =>
        (b.partnership_interest_tags ?? []).some((t) => filters.interestTags.includes(t))
      );
    }

    // Always enforce 50-mile max radius (hard cap)
    result = result.filter((b) => b.distanceMiles == null || b.distanceMiles <= filters.maxDistance);

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
        case "most_active":
          return new Date(b.last_active_at ?? 0).getTime() - new Date(a.last_active_at ?? 0).getTime();
        case "recently_updated":
          return new Date(b.last_active_at ?? b.created_at ?? 0).getTime() - new Date(a.last_active_at ?? a.created_at ?? 0).getTime();
        case "verified":
          return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
        default:
          return 0;
      }
    });

    return result;
  }, [businesses, userBusiness, userLat, userLng, filters, sortBy, launchedCities]);

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

  function toggleInterestTag(tag: string) {
    setFilters((prev) => ({
      ...prev,
      interestTags: prev.interestTags.includes(tag)
        ? prev.interestTags.filter((t) => t !== tag)
        : [...prev.interestTags, tag],
    }));
  }

  // Recently joined businesses (last 7 days)
  const recentlyJoined = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return businesses
      .filter((b) => userBusiness?.id !== b.id && b.created_at && new Date(b.created_at) > sevenDaysAgo)
      .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
      .slice(0, 5);
  }, [businesses, userBusiness]);

  return (
    <div className="space-y-6">
      {/* Non-invasive location permission banner */}
      <AnimatePresence>
        {showLocationPrompt && !userBusiness?.lat && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm"
          >
            <Navigation className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />
            <div className="flex-1">
              <p className="font-medium text-sky-900">Enable location for better matches</p>
              <p className="mt-0.5 text-xs text-sky-700">
                We&apos;ll use your location to show businesses within 50 miles. Your location is never stored or shared.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={requestBrowserLocation}
                className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 transition-colors"
              >
                Allow
              </button>
              <button
                onClick={dismissLocationPrompt}
                className="rounded-lg px-2 py-1.5 text-xs text-sky-600 hover:bg-sky-100 transition-colors"
                aria-label="Dismiss location prompt"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* City launch status banner */}
      {userBusiness?.city && userCityStatus && !userCityStatus.launched && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="font-medium text-amber-900">
              {userBusiness.city} needs {Math.max(0, userCityStatus.threshold - userCityStatus.current_count)} more{" "}
              business{Math.max(0, userCityStatus.threshold - userCityStatus.current_count) === 1 ? "" : "es"} to unlock
            </p>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-amber-700 mb-1">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {userCityStatus.current_count} / {userCityStatus.threshold} businesses signed up
                </span>
                <span>{Math.round((userCityStatus.current_count / userCityStatus.threshold) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-amber-200">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all"
                  style={{ width: `${Math.min(100, Math.round((userCityStatus.current_count / userCityStatus.threshold) * 100))}%` }}
                />
              </div>
            </div>
            <p className="mt-1.5 text-xs text-amber-700">
              Meanwhile, you can browse and connect with businesses in nearby launched cities within 50 miles.{" "}
              <Link href="/refer" className="font-semibold underline hover:text-amber-800">
                Invite businesses to speed things up →
              </Link>
            </p>
          </div>
        </div>
      )}

      {userBusiness?.city && userCityStatus?.launched && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-600" />
          <p className="font-medium text-emerald-900">
            🎉 {userBusiness.city} is live! Your city has reached {userCityStatus.threshold} businesses.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Discover Partners</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Find and connect with complementary businesses within 50 miles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/partnership-ideas" className="btn-muted text-xs">
            <Sparkles className="mr-1 h-3 w-3" /> Partnership Ideas
          </Link>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-xl p-2 transition-all duration-200 ${showFilters ? "bg-lavender-50 text-lavender-600 shadow-sm" : "text-neutral-400 hover:bg-neutral-100"}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`rounded-xl p-2 transition-all duration-200 ${view === "grid" ? "bg-lavender-50 text-lavender-600 shadow-sm" : "text-neutral-400 hover:bg-neutral-100"}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-xl p-2 transition-all duration-200 ${view === "list" ? "bg-lavender-50 text-lavender-600 shadow-sm" : "text-neutral-400 hover:bg-neutral-100"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          className="input pl-11"
          placeholder="Search by name, type, what they offer, or what they're looking for..."
          value={filters.searchQuery}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
        />
      </div>

      {/* Recently Joined */}
      {recentlyJoined.length > 0 && !filters.searchQuery && filters.interestTags.length === 0 && filters.partnershipTypes.length === 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-creamsicle-50 to-lavender-50 p-5 border border-creamsicle-100/50">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-creamsicle-600" />
            <h3 className="text-sm font-semibold text-neutral-900">Recently Joined</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentlyJoined.map((b) => (
              <div key={b.id} className="flex-shrink-0 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-neutral-100">
                <p className="text-sm font-medium text-neutral-900">{b.name}</p>
                <p className="text-[10px] text-neutral-500">{b.business_type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-lavender-50 px-5 py-3 border border-lavender-100">
          <span className="text-sm font-medium text-lavender-700">{selectedIds.size} selected</span>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs font-medium text-lavender-600 hover:text-lavender-700">
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
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="hidden flex-shrink-0 overflow-hidden lg:block"
            >
              <div className="w-64 space-y-5 rounded-2xl bg-white p-6 shadow-soft border border-neutral-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900">Filters</h3>
                  <button onClick={() => setFilters(defaultFilters)} className="text-xs font-medium text-lavender-600 hover:text-lavender-700">
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

                {/* Partnership Interest Tags */}
                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-700">Partnership Interests</p>
                  <div className="space-y-1.5">
                    {INTEREST_TAG_OPTIONS.map((tag) => (
                      <label key={tag} className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-lavender-600 focus:ring-lavender-500/20"
                          checked={filters.interestTags.includes(tag)}
                          onChange={() => toggleInterestTag(tag)}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Partnership Types */}
                <div>
                  <p className="mb-2 text-xs font-medium text-neutral-700">Partnership Type</p>
                  <div className="space-y-1.5">
                    {PARTNERSHIP_TYPE_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-neutral-300 text-lavender-600 focus:ring-lavender-500/20"
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
                <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 text-lavender-600 focus:ring-lavender-500/20"
                    checked={filters.verifiedOnly}
                    onChange={(e) => setFilters((prev) => ({ ...prev, verifiedOnly: e.target.checked }))}
                  />
                  <ShieldCheck className="h-3.5 w-3.5 text-spearmint-600" />
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
                <div className="border-t border-neutral-100 pt-4">
                  <p className="mb-2 text-xs font-medium text-neutral-700">Save Search</p>
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
                        <div key={s.id} className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-1.5 text-xs">
                          <button onClick={() => loadSavedSearch(s)} className="text-neutral-700 hover:text-lavender-600">
                            {s.name}
                          </button>
                          <button onClick={() => removeSavedSearch(s.id)} className="text-neutral-400 hover:text-red-500">
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
            <p className="text-sm text-neutral-500">
              {isLoading ? "Loading..." : `${filtered.length} business${filtered.length !== 1 ? "es" : ""} found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-skeleton-pulse rounded-2xl bg-neutral-100 p-6 h-44" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-white p-14 text-center shadow-soft border border-neutral-100">
              <SlidersHorizontal className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-sm font-medium text-neutral-600">No businesses match your current filters</p>
              <p className="mt-1 text-xs text-neutral-400">Try adjusting your search criteria</p>
              <button onClick={() => setFilters(defaultFilters)} className="btn-muted mt-4 text-xs">
                Clear all filters
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
                    connectionStatus={getConnectionStatus(b.id)}
                    onRequestConnection={() => connectionRequestMutation.mutate(b.id)}
                    isRequesting={requestingIds.has(b.id)}
                    errorMessage={errorMap.get(b.id) ?? null}
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
