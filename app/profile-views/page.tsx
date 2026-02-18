"use client";

export const dynamic = 'force-dynamic';

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { BusinessRecord } from "@/lib/types";
import Link from "next/link";

type ProfileViewWithViewer = {
  id: string;
  viewer_business_id: string;
  viewed_at: string;
  viewer: Pick<BusinessRecord, "name" | "business_type"> | null;
};

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
        .select("id")
        .eq("owner_id", user.id)
        .single<Pick<BusinessRecord, "id">>();

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
      };
    },
  });

  const views = data?.views ?? [];

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Profile Views</h1>
        <p className="mt-1 text-sm text-neutral-500">See who&apos;s been checking out your business</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-skeleton-pulse rounded-2xl bg-neutral-200" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
      ) : null}

      {!isLoading && !error && views.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center">
          <h3 className="text-xl font-semibold text-neutral-900">No profile views yet</h3>
          <p className="mt-2 text-sm text-neutral-600">
            When other businesses view your profile while browsing, they&apos;ll appear here.
          </p>
          <Link href="/discover" className="btn-primary mt-4 inline-block">
            Discover businesses
          </Link>
        </div>
      ) : null}

      {!isLoading && !error && views.length > 0 ? (
        <div className="space-y-3">
          {views.map((view) => (
            <div key={view.id} className="glass flex items-center justify-between rounded-2xl p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-neutral-900">
                  {view.viewer?.name ?? "Unknown Business"}
                </p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {view.viewer?.business_type ?? "Business"} · {formatTimeAgo(view.viewed_at)}
                </p>
              </div>
              <Link href="/discover" className="btn-muted ml-3 shrink-0 text-sm">
                View Their Profile
              </Link>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
