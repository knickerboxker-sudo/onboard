"use client";

import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { buildMatchPair, filterBusinessesForSwipe } from "@/lib/matching";
import type { BusinessRecord, SwipeDirection, SwipeFilters } from "@/lib/types";

const defaultFilters: SwipeFilters = {
  radiusMiles: 25,
  categories: [],
  partnershipTypes: [],
};
const SWIPE_CONFLICT_COLUMNS = "swiper_business_id,swiped_business_id";
const MATCH_CONFLICT_COLUMNS = "business_1_id,business_2_id";

function SwipeCard({
  business,
  onSwipe,
}: {
  business: BusinessRecord & { distanceMiles: number | null };
  onSwipe: (direction: SwipeDirection) => void;
}) {
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

      <div className="mt-4 flex gap-3">
        <button className="btn-muted flex-1" onClick={() => onSwipe("left")} type="button">
          Pass
        </button>
        <button className="btn-primary flex-1" onClick={() => onSwipe("right")} type="button">
          Interested
        </button>
      </div>
    </motion.div>
  );
}

export default function SwipePage() {
  const supabase = useMemo(() => createClient(), []);
  const [filters, setFilters] = useState<SwipeFilters>(defaultFilters);
  const [position, setPosition] = useState(0);
  const [matchName, setMatchName] = useState<string | null>(null);
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

  const handleSwipe = async (direction: SwipeDirection) => {
    if (!data || !activeCard) return;

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
      }
    }

    setPosition((value) => value + 1);
  };

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="glass rounded-3xl p-5">
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
            void refetch();
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
          {!isLoading && activeCard ? (
            <SwipeCard
              business={activeCard}
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
        {actionError ? <p className="fixed bottom-6 left-6 z-40 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{actionError}</p> : null}

        {!isLoading && !activeCard && !error ? (
          <div className="glass max-w-md rounded-3xl p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-900">No more businesses in this stack</h3>
            <p className="mt-2 text-sm text-slate-600">Try a wider radius, update your filters, or invite more local businesses to PartnerSwipe.</p>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {matchName ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-40 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-card"
            exit={{ opacity: 0, y: 12 }}
            initial={{ opacity: 0, y: 12 }}
          >
            <p className="text-sm font-semibold text-emerald-700">It&apos;s a match with {matchName}</p>
            <button className="mt-1 text-xs text-slate-500 underline" onClick={() => setMatchName(null)} type="button">
              Dismiss
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
