"use client";

import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { buildMatchPair, filterBusinessesForSwipe, getTrustBadges, complementarityScore, canSwipe, getIcebreakers, getContextualIcebreaker } from "@/lib/matching";
import type { BusinessRecord, SwipeDirection, SwipeFilters, TrustBadge } from "@/lib/types";

const defaultFilters: SwipeFilters = {
  radiusMiles: 25,
  categories: [],
  partnershipTypes: [],
};
const SWIPE_CONFLICT_COLUMNS = "swiper_business_id,swiped_business_id";
const MATCH_CONFLICT_COLUMNS = "business_1_id,business_2_id";

const BADGE_STYLES: Record<TrustBadge["type"], string> = {
  verified: "border-emerald-100 bg-emerald-50 text-emerald-700",
  established: "border-amber-100 bg-amber-50 text-amber-700",
  top_partner: "border-violet-100 bg-violet-50 text-violet-700",
  fast_responder: "border-sky-100 bg-sky-50 text-sky-700",
};

function scoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-slate-400";
}

function ActivityIndicator({ business }: { business: BusinessRecord }) {
  if (business.last_active_at) {
    const diffMs = Date.now() - new Date(business.last_active_at).getTime();
    if (diffMs < 60 * 60 * 1000) {
      return <span className="text-xs font-medium text-emerald-600">● Active now</span>;
    }
  }
  if (business.avg_response_time_minutes != null) {
    const hours = Math.max(1, Math.round(business.avg_response_time_minutes / 60));
    return <span className="text-xs text-slate-500">Responds in ~{hours}h</span>;
  }
  return null;
}

function SwipeCard({
  business,
  onSwipe,
  currentBusiness,
}: {
  business: BusinessRecord & { distanceMiles: number | null };
  onSwipe: (direction: SwipeDirection) => void;
  currentBusiness: BusinessRecord;
}) {
  const badges = getTrustBadges(business);
  const matchScore = complementarityScore(currentBusiness.business_type, business.business_type);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const icebreakerPrompts = useMemo(() => {
    const prompts: string[] = [];
    const contextual = getContextualIcebreaker(currentBusiness.business_type, business.business_type, business.name);
    if (contextual) prompts.push(contextual);
    const typed = getIcebreakers(currentBusiness.partnership_types ?? [], business.partnership_types ?? []);
    for (const t of typed) {
      if (prompts.length >= 3) break;
      if (!prompts.includes(t.prompt)) prompts.push(t.prompt);
    }
    return prompts.slice(0, 3);
  }, [currentBusiness.business_type, currentBusiness.partnership_types, business.business_type, business.partnership_types, business.name]);

  const copyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-7, 0, 7]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const passOpacity = useTransform(x, [-140, -40], [1, 0]);

  return (
    <motion.div
      animate={{ scale: 1, opacity: 1 }}
      className="glass relative w-full max-w-md rounded-3xl p-5"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      initial={{ scale: 0.96, opacity: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onSwipe("right");
        if (info.offset.x < -120) onSwipe("left");
      }}
      style={{ x, rotate }}
      transition={{ type: "spring", damping: 24, stiffness: 240 }}
    >
      <motion.div className="pointer-events-none absolute right-5 top-5 rounded-xl bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700" style={{ opacity: likeOpacity }}>
        Interested
      </motion.div>
      <motion.div className="pointer-events-none absolute left-5 top-5 rounded-xl bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700" style={{ opacity: passOpacity }}>
        Pass
      </motion.div>

      <div className="mb-4 h-52 overflow-hidden rounded-2xl bg-slate-200">
        {business.photos?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={business.name} className="h-full w-full object-cover" src={business.photos[0]} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No image uploaded</div>
        )}
      </div>

      <h2 className="text-xl font-semibold text-slate-900">{business.name}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {business.business_type}
        {business.distanceMiles != null ? ` · ${business.distanceMiles.toFixed(1)} mi away` : ""}
      </p>
      <p className="mt-3 text-sm text-slate-600">{business.description || "No description yet."}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(business.partnership_types ?? []).map((type) => (
          <span className="rounded-lg border border-sky-100 bg-sky-50 px-2 py-1 text-xs text-sky-700" key={type}>
            {type}
          </span>
        ))}
      </div>

      {badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${BADGE_STYLES[badge.type]}`}
              key={badge.type}
              title={badge.description}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Match Quality</span>
            <span className="font-medium text-slate-700">{matchScore}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full rounded-full ${scoreColor(matchScore)}`} style={{ width: `${matchScore}%` }} />
          </div>
        </div>
        <ActivityIndicator business={business} />
      </div>

      <div className="mt-4 flex gap-3">
        <button className="btn-muted flex-1" onClick={() => onSwipe("left")} type="button">
          Pass
        </button>
        <button className="btn-primary flex-1" onClick={() => onSwipe("right")} type="button">
          Interested
        </button>
      </div>

      {icebreakerPrompts.length > 0 && (
        <div className="mt-3">
          <button
            className="flex w-full items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
            onClick={() => setShowIcebreakers((v) => !v)}
            type="button"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${showIcebreakers ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Message ideas
          </button>
          <AnimatePresence>
            {showIcebreakers && (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                className="mt-2 flex flex-col gap-2 overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {icebreakerPrompts.map((prompt, idx) => (
                  <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2" key={idx}>
                    <p className="flex-1 text-xs text-slate-600">&ldquo;{prompt}&rdquo;</p>
                    <button
                      className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 shadow-sm hover:text-slate-700"
                      onClick={() => copyPrompt(prompt, idx)}
                      type="button"
                    >
                      {copiedIdx === idx ? "Copied!" : "Copy"}
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default function SwipePage() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SwipeFilters>(defaultFilters);
  const [position, setPosition] = useState(0);
  const [matchName, setMatchName] = useState<string | null>(null);
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [swipeLimitReached, setSwipeLimitReached] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["swipe-data", filters],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in to view local partners.");
      }

      const { data: currentBusiness, error: currentBusinessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single<BusinessRecord>();

      if (currentBusinessError || !currentBusiness) {
        throw new Error("Complete onboarding to unlock matching.");
      }

      const { data: swipes } = await supabase
        .from("swipes")
        .select("swiped_business_id")
        .eq("swiper_business_id", currentBusiness.id);

      const swipedIds = new Set((swipes ?? []).map((swipe) => swipe.swiped_business_id as string));

      const { data: allBusinesses, error: businessesError } = await supabase
        .from("businesses")
        .select("*")
        .neq("id", currentBusiness.id);

      if (businessesError) {
        throw new Error(businessesError.message);
      }

      return {
        currentBusiness,
        candidates: filterBusinessesForSwipe(currentBusiness, (allBusinesses ?? []) as BusinessRecord[], swipedIds, filters),
      };
    },
  });

  const activeCard = data?.candidates[position] ?? null;

  // Track profile views (debounced, once per card)
  const viewedCardsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!activeCard || !data?.currentBusiness) return;
    if (viewedCardsRef.current.has(activeCard.id)) return;
    viewedCardsRef.current.add(activeCard.id);

    const timer = setTimeout(() => {
      supabase
        .from("profile_views")
        .insert({
          viewer_business_id: data.currentBusiness.id,
          viewed_business_id: activeCard.id,
        })
        .then(() => {
          // fire-and-forget
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [activeCard, data?.currentBusiness, supabase]);

  const handleSwipe = async (direction: SwipeDirection) => {
    if (!data || !activeCard) return;

    if (!canSwipe(data.currentBusiness)) {
      setSwipeLimitReached(true);
      return;
    }

    const { error: swipeError } = await supabase.from("swipes").upsert(
      {
        swiper_business_id: data.currentBusiness.id,
        swiped_business_id: activeCard.id,
        direction,
      },
      { onConflict: SWIPE_CONFLICT_COLUMNS },
    );
    if (swipeError) {
      setActionError(`Unable to save swipe: ${swipeError.message}`);
      return;
    }
    setActionError(null);

    // Increment daily swipe count for rate limiting
    const today = new Date().toISOString().split("T")[0];
    const lastReset = data.currentBusiness.last_swipe_reset_at?.split("T")[0] ?? "";
    const isNewDay = lastReset !== today;
    const newCount = isNewDay ? 1 : (data.currentBusiness.daily_swipes_used ?? 0) + 1;
    await supabase
      .from("businesses")
      .update({
        daily_swipes_used: newCount,
        ...(isNewDay ? { last_swipe_reset_at: today } : {}),
      })
      .eq("id", data.currentBusiness.id);
    data.currentBusiness.daily_swipes_used = newCount;
    if (isNewDay) data.currentBusiness.last_swipe_reset_at = today;

    if (direction === "right") {
      const { data: reverseSwipe, error: reverseSwipeError } = await supabase
        .from("swipes")
        .select("id")
        .eq("swiper_business_id", activeCard.id)
        .eq("swiped_business_id", data.currentBusiness.id)
        .eq("direction", "right")
        .maybeSingle();
      if (reverseSwipeError) {
        setActionError(`Unable to validate reverse swipe: ${reverseSwipeError.message}`);
        return;
      }

      if (reverseSwipe) {
        const [business1, business2] = buildMatchPair(data.currentBusiness.id, activeCard.id);
        const { error: matchError } = await supabase.from("matches").upsert(
          {
            business_1_id: business1,
            business_2_id: business2,
          },
          { onConflict: MATCH_CONFLICT_COLUMNS },
        );
        if (matchError) {
          setActionError(`Unable to create match: ${matchError.message}`);
          return;
        }
        setMatchName(activeCard.name);
        try {
          const prompts = getIcebreakers(
            data.currentBusiness.partnership_types ?? [],
            activeCard.partnership_types ?? [],
          );
          if (prompts.length > 0) {
            setIcebreaker(prompts[Math.floor(Math.random() * prompts.length)].prompt);
          }
        } catch {
          // icebreaker generation should not block match notification
        }
      }
    }

    setPosition((value) => value + 1);
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="glass min-w-0 rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        <label className="label mt-4">Distance radius</label>
        <select
          className="input"
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              radiusMiles: Number(event.target.value) as SwipeFilters["radiusMiles"],
            }))
          }
          value={filters.radiusMiles}
        >
          {[5, 10, 25, 50].map((miles) => (
            <option key={miles} value={miles}>
              {miles} miles
            </option>
          ))}
        </select>
        <button
          className="btn-muted mt-4 w-full"
          onClick={() => {
            setPosition(0);
            setMatchName(null);
            setIcebreaker(null);
            setSwipeLimitReached(false);
            setActionError(null);
            void queryClient.invalidateQueries({ queryKey: ["swipe-data", filters] }).then(() => refetch());
          }}
          type="button"
        >
          Refresh stack
        </button>
      </aside>

      <div className="flex min-h-[560px] items-center justify-center">
        {isLoading ? <div className="h-96 w-full max-w-md animate-skeleton-pulse rounded-3xl bg-slate-200" /> : null}
        {!isLoading && error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p> : null}

        <AnimatePresence mode="wait">
          {!isLoading && activeCard && !swipeLimitReached ? (
            <SwipeCard
              business={activeCard}
              currentBusiness={data!.currentBusiness}
              key={activeCard.id}
              onSwipe={(direction) => {
                handleSwipe(direction).catch((error: unknown) =>
                  setActionError(
                    `Unexpected swipe error: ${error instanceof Error ? error.message : "unknown error"}`,
                  ),
                );
              }}
            />
          ) : null}
        </AnimatePresence>

        {!isLoading && swipeLimitReached ? (
          <div className="glass max-w-md rounded-3xl p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-900">Daily swipe limit reached</h3>
            <p className="mt-2 text-sm text-slate-600">Upgrade to Pro for unlimited swipes.</p>
          </div>
        ) : null}
        {actionError ? <p className="fixed bottom-6 left-6 z-40 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}

        {!isLoading && !activeCard && !error && !swipeLimitReached ? (
          <div className="glass max-w-md rounded-3xl p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-900">No more businesses in this stack</h3>
            <p className="mt-2 text-sm text-slate-600">Try a wider radius, update your filters, or invite more local businesses to Sortir.</p>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {matchName ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-40 max-w-sm rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-card"
            exit={{ opacity: 0, y: 12 }}
            initial={{ opacity: 0, y: 12 }}
          >
            <p className="text-sm font-semibold text-emerald-700">It&apos;s a match with {matchName}</p>
            {icebreaker ? (
              <div className="mt-2">
                <p className="text-xs text-slate-500">Suggested icebreaker:</p>
                <p className="mt-1 text-xs italic text-slate-700">&ldquo;{icebreaker}&rdquo;</p>
                <button
                  className="mt-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                  onClick={() => { navigator.clipboard.writeText(icebreaker).catch(() => { /* clipboard not available */ }); }}
                  type="button"
                >
                  Copy icebreaker
                </button>
              </div>
            ) : null}
            <button
              className="mt-1 text-xs text-slate-500 underline"
              onClick={() => {
                setMatchName(null);
                setIcebreaker(null);
              }}
              type="button"
            >
              Dismiss
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
