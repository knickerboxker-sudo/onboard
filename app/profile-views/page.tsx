"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { BusinessRecord } from "@/lib/types";
import { TIER_LIMITS } from "@/lib/matching";
import Link from "next/link";

type ProfileViewWithViewer = {
  id: string;
  viewer_business_id: string;
  viewed_at: string;
  viewer: Pick<BusinessRecord, "name" | "business_type"> | null;
};

const FREE_VIEW_LIMIT = 3;

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ProfileViewsPage() {
  const supabase = useMemo(() => createClient(), []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile-views"],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) throw new Error("Please sign in to view profile views.");

      const { data: currentBusiness, error: bizError } = await supabase
        .from("businesses")
        .select("id, subscription_tier")
        .eq("owner_id", user.id)
        .single<Pick<BusinessRecord, "id" | "subscription_tier">>();

      if (bizError || !currentBusiness) throw new Error("Complete onboarding to see who viewed your profile.");

      const { data: views, error: viewsError } = await supabase
        .from("profile_views")
        .select("id, viewer_business_id, viewed_at")
        .eq("viewed_business_id", currentBusiness.id)
        .order("viewed_at", { ascending: false });

      if (viewsError) throw new Error(viewsError.message);

      const viewerIds = [...new Set((views ?? []).map((v) => v.viewer_business_id))];
      let viewerMap: Record<string, Pick<BusinessRecord, "name" | "business_type">> = {};

      if (viewerIds.length > 0) {
        const { data: viewers } = await supabase
          .from("businesses")
          .select("id, name, business_type")
          .in("id", viewerIds);

        viewerMap = Object.fromEntries(
          (viewers ?? []).map((v) => [v.id, { name: v.name, business_type: v.business_type }]),
        );
      }

      const enriched: ProfileViewWithViewer[] = (views ?? []).map((v) => ({
        ...v,
        viewer: viewerMap[v.viewer_business_id] ?? null,
      }));

      return {
        views: enriched,
        tier: (currentBusiness.subscription_tier ?? "free") as "free" | "pro" | "premium",
      };
    },
  });

  const tier = data?.tier ?? "free";
  const canSeeAll = TIER_LIMITS[tier].canSeeWhoLiked;
  const views = data?.views ?? [];
  const visibleViews = canSeeAll ? views : views.slice(0, FREE_VIEW_LIMIT);
  const hiddenCount = canSeeAll ? 0 : Math.max(0, views.length - FREE_VIEW_LIMIT);

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile Views</h1>
        <p className="mt-1 text-sm text-slate-500">See who&apos;s been checking out your business</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-skeleton-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
      ) : null}

      {!isLoading && !error && views.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-900">No profile views yet</h3>
          <p className="mt-2 text-sm text-slate-600">
            When other businesses view your profile while swiping, they&apos;ll appear here.
          </p>
          <Link href="/swipe" className="btn-primary mt-4 inline-block">
            Start swiping
          </Link>
        </div>
      ) : null}

      {!isLoading && !error && views.length > 0 ? (
        <div className="space-y-3">
          {visibleViews.map((view) => (
            <div key={view.id} className="glass flex items-center justify-between rounded-2xl p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">
                  {view.viewer?.name ?? "Unknown Business"}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {view.viewer?.business_type ?? "Business"} · {formatTimeAgo(view.viewed_at)}
                </p>
              </div>
              <Link href="/swipe" className="btn-muted ml-3 shrink-0 text-sm">
                View Their Profile
              </Link>
            </div>
          ))}

          {hiddenCount > 0 ? (
            <>
              {Array.from({ length: Math.min(hiddenCount, 3) }).map((_, i) => (
                <div key={`blur-${i}`} className="glass relative rounded-2xl p-4 select-none">
                  <div className="blur-sm">
                    <p className="font-medium text-slate-900">Hidden Business Name</p>
                    <p className="mt-0.5 text-sm text-slate-500">Business Type · 2d ago</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60">
                    <span className="text-xs font-medium text-slate-400">🔒</span>
                  </div>
                </div>
              ))}

              <div className="glass rounded-3xl p-6 text-center">
                <p className="text-sm font-medium text-slate-700">
                  +{hiddenCount} more business{hiddenCount === 1 ? "" : "es"} viewed your profile
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Upgrade to Pro to see everyone who&apos;s interested in your business.
                </p>
                <Link href="/settings" className="btn-primary mt-3 inline-block text-sm">
                  Upgrade to Pro
                </Link>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
