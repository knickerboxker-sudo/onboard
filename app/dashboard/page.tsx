"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getTrustBadges, calculateProfileCompletion, buildActivityFeed } from "@/lib/matching";
import type { ActivityFeedItem } from "@/lib/matching";
import type { BusinessRecord, TrustBadge, SavedAssessmentRecord } from "@/lib/types";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  DollarSign,
  Eye,
  Handshake,
  MessageCircle,
  Share2,
  Star,
  Trash2,
  TrendingUp,
  Users,
  Zap,
  PartyPopper,
  Pause,
  Trophy,
  UserPlus,
  ArrowRight,
} from "lucide-react";

type Partnership = {
  id: string;
  partnership_type: string;
  status: string;
  revenue_generated: number;
  customers_acquired: number;
  start_date: string;
  end_date: string | null;
  updated_at?: string;
};

type MatchRow = {
  id: string;
  created_at: string;
};

type RecentMessage = {
  id: string;
  match_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
};

type Verification = {
  verification_type: string;
  status: string;
};

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in.");

      const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single();
      if (!business) throw new Error("Please complete onboarding.");

      const bizId = business.id;

      // Fetch match IDs once for reuse in received messages and partnerships queries
      const { data: matchRows } = await supabase
        .from("matches")
        .select("id")
        .or(`business_1_id.eq.${bizId},business_2_id.eq.${bizId}`);
      const matchIds = (matchRows ?? []).map((m: { id: string }) => m.id);

      const [
        { count: matchCount },
        { count: sentCount },
        { count: receivedCount },
        { count: profileViewCount },
        { data: partnerships },
        { data: verifications },
        { data: reviews },
        { data: savedAssessments },
        { count: connectionRequestCount },
        { data: recentMatchRows },
        { data: recentMsgRows },
      ] = await Promise.all([
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .or(`business_1_id.eq.${bizId},business_2_id.eq.${bizId}`),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("sender_business_id", bizId),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .neq("sender_business_id", bizId)
          .in("match_id", matchIds),
        supabase
          .from("profile_views")
          .select("id", { count: "exact", head: true })
          .eq("viewed_business_id", bizId),
        supabase
          .from("partnerships")
          .select("id, partnership_type, status, revenue_generated, customers_acquired, start_date, end_date, updated_at")
          .in("match_id", matchIds)
          .order("start_date", { ascending: false }),
        supabase
          .from("verifications")
          .select("verification_type, status")
          .eq("business_id", bizId),
        supabase
          .from("reviews")
          .select("rating")
          .eq("reviewed_business_id", bizId),
        supabase
          .from("saved_assessments")
          .select("*")
          .eq("creator_business_id", bizId)
          .order("created_at", { ascending: false }),
        supabase
          .from("connection_requests")
          .select("id", { count: "exact", head: true })
          .eq("receiver_business_id", bizId)
          .eq("status", "pending"),
        supabase
          .from("matches")
          .select("id, created_at")
          .or(`business_1_id.eq.${bizId},business_2_id.eq.${bizId}`)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("messages")
          .select("id, match_id, content, created_at")
          .neq("sender_business_id", bizId)
          .in("match_id", matchIds)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const activePartnerships = (partnerships ?? []).filter(
        (p: Partnership) => p.status === "active",
      );
      const completedPartnerships = (partnerships ?? []).filter(
        (p: Partnership) => p.status === "completed",
      );
      const pendingPartnerships = (partnerships ?? []).filter(
        (p: Partnership) => p.status === "pending",
      );
      const archivedPartnerships = (partnerships ?? []).filter(
        (p: Partnership) => p.status === "archived",
      );
      const totalRevenue = (partnerships ?? []).reduce(
        (sum: number, p: Partnership) => sum + (Number(p.revenue_generated) || 0),
        0,
      );

      const ratings = (reviews ?? []).map((r: { rating: number }) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          : null;

      const activityFeed = buildActivityFeed({
        partnerships: (partnerships ?? []) as Partnership[],
        matches: (recentMatchRows ?? []) as MatchRow[],
        recentMessages: (recentMsgRows ?? []) as RecentMessage[],
      });

      return {
        business: business as BusinessRecord,
        matchCount: matchCount ?? 0,
        sentCount: sentCount ?? 0,
        receivedCount: receivedCount ?? 0,
        profileViewCount: profileViewCount ?? 0,
        connectionRequestCount: connectionRequestCount ?? 0,
        activePartnerships: activePartnerships.length,
        completedPartnerships: completedPartnerships.length,
        pendingPartnerships: pendingPartnerships.length,
        archivedPartnerships: archivedPartnerships.length,
        totalRevenue,
        avgRating,
        recentPartnerships: (partnerships ?? []).slice(0, 5) as Partnership[],
        verifications: (verifications ?? []) as Verification[],
        savedAssessments: (savedAssessments ?? []) as SavedAssessmentRecord[],
        activityFeed,
      };
    },
  });

  const deleteAssessment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_assessments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
  });

  if (isLoading)
    return (
      <div className="space-y-5">
        <div className="glass rounded-2xl p-7">
          <div className="h-4 w-40 animate-skeleton-pulse rounded-lg bg-neutral-200" />
          <div className="mt-3 h-6 w-56 animate-skeleton-pulse rounded-lg bg-neutral-200" />
          <div className="mt-2 h-4 w-72 animate-skeleton-pulse rounded-lg bg-neutral-200" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="glass rounded-2xl p-6" key={i}>
              <div className="h-4 w-24 animate-skeleton-pulse rounded-lg bg-neutral-200" />
              <div className="mt-3 h-8 w-16 animate-skeleton-pulse rounded-lg bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 border border-red-100">
        {error.message}
      </p>
    );

  const badges: TrustBadge[] = data?.business
    ? getTrustBadges(data.business)
    : [];

  const statCards = [
    { label: "Connections", value: data?.matchCount, icon: Handshake },
    { label: "Connection Requests", value: data?.connectionRequestCount, icon: Users },
    { label: "Messages Sent", value: data?.sentCount, icon: MessageCircle },
    { label: "Messages Received", value: data?.receivedCount, icon: MessageCircle },
    { label: "Pending Partnerships", value: data?.pendingPartnerships, icon: Handshake },
    { label: "Active Partnerships", value: data?.activePartnerships, icon: TrendingUp },
    { label: "Completed Partnerships", value: data?.completedPartnerships, icon: Award },
    { label: "Archived Partnerships", value: data?.archivedPartnerships, icon: Award },
    {
      label: "Total Revenue",
      value: `$${(data?.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
    },
    { label: "Profile Views", value: data?.profileViewCount, icon: Eye },
    {
      label: "Avg Rating",
      value: data?.avgRating != null ? data.avgRating.toFixed(1) : "—",
      icon: Star,
    },
  ];

  const statusColor: Record<string, string> = {
    pending: "bg-indigo-100 text-indigo-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    paused: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    archived: "bg-neutral-100 text-neutral-600",
  };

  const verificationLabel: Record<string, string> = {
    business_license: "Business License",
    storefront_photo: "Storefront Photo",
    tax_id: "Tax ID",
    social_media: "Social Media",
    website: "Website",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass rounded-2xl p-7">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-lavender-600">Your partnership hub</p>
        <h1 className="text-2xl font-semibold text-neutral-900">
          {data?.business.name}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {data?.business.business_type}
        </p>
        {data?.business.created_at && (
          <p className="mt-0.5 text-xs text-neutral-400">Member since {new Date(data.business.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
        )}
        <p className="mt-2 text-sm text-neutral-500">
          Track your active partnerships, see who&apos;s collaborating with you, and measure the impact of every connection.
        </p>
      </div>

      {/* Profile Completion */}
      {data?.business && (() => {
        const completion = calculateProfileCompletion(data.business);
        return completion < 100 ? (
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Profile Completion</h3>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Complete your profile to attract more partnership opportunities.
                </p>
              </div>
              <span className={`text-lg font-bold ${completion >= 75 ? "text-spearmint-600" : completion >= 50 ? "text-warning" : "text-neutral-600"}`}>
                {completion}%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${completion >= 75 ? "bg-spearmint-500" : completion >= 50 ? "bg-warning" : "bg-neutral-400"}`}
                style={{ width: `${completion}%` }}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <Link href="/settings" className="text-xs font-medium text-lavender-600 hover:text-lavender-700">
                Edit Profile →
              </Link>
              {(data.business.looking_for ?? []).length === 0 && (
                <span className="text-xs text-neutral-400">Add &quot;Looking For&quot; and &quot;Can Offer&quot; sections to stand out</span>
              )}
            </div>
          </div>
        ) : null;
      })()}

      {/* Performance Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => (
          <div className="stat-card" key={item.label}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                <item.icon className="h-4 w-4 text-neutral-500" />
              </div>
              <p className="text-sm text-neutral-500">{item.label}</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-neutral-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      {(data?.activityFeed?.length ?? 0) > 0 && (
        <div className="glass rounded-2xl p-7">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-neutral-900">Activity Feed</h2>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Recent activity across your partnerships and connections.
          </p>
          <div className="mt-4 space-y-3">
            {data?.activityFeed.slice(0, 10).map((item: ActivityFeedItem) => {
              const iconMap: Record<string, typeof Zap> = {
                partnership_started: Handshake,
                partnership_completed: PartyPopper,
                partnership_paused: Pause,
                revenue_milestone: Trophy,
                customer_milestone: Users,
                new_match: UserPlus,
                message_received: MessageCircle,
              };
              const colorMap: Record<string, string> = {
                partnership_started: "bg-spearmint-50 text-spearmint-600",
                partnership_completed: "bg-blue-50 text-blue-600",
                partnership_paused: "bg-yellow-50 text-yellow-600",
                revenue_milestone: "bg-amber-50 text-amber-600",
                customer_milestone: "bg-indigo-50 text-indigo-600",
                new_match: "bg-lavender-50 text-lavender-600",
                message_received: "bg-neutral-100 text-neutral-600",
              };
              const Icon = iconMap[item.type] ?? Zap;
              const color = colorMap[item.type] ?? "bg-neutral-100 text-neutral-600";
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white px-5 py-3.5 transition-all duration-200 hover:shadow-sm"
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-500 line-clamp-2">{item.description}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="text-xs text-neutral-400">
                        {new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                      {item.actionHref && (
                        <Link href={item.actionHref} className="inline-flex items-center gap-1 text-xs font-medium text-lavender-600 hover:text-lavender-700">
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ROI Summary */}
      {(data?.completedPartnerships ?? 0) > 0 && (
        <div className="glass rounded-2xl p-7">
          <h2 className="text-lg font-semibold text-neutral-900">ROI Summary</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Revenue per Partnership</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">
                $
                {data?.completedPartnerships
                  ? Math.round(
                      data.totalRevenue / data.completedPartnerships,
                    ).toLocaleString()
                  : 0}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Total Partnerships</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">
                {(data?.activePartnerships ?? 0) +
                  (data?.completedPartnerships ?? 0)}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Total Revenue</p>
              <p className="mt-1 text-xl font-semibold text-neutral-900">
                ${(data?.totalRevenue ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Partnership Activity */}
      {(data?.recentPartnerships?.length ?? 0) > 0 && (
        <div className="glass rounded-2xl p-7">
          <h2 className="text-lg font-semibold text-neutral-900">
            Partnership Activity
          </h2>
          <div className="mt-4 space-y-3">
            {data?.recentPartnerships.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-5 py-3.5 transition-all duration-200 hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {p.partnership_type}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Started {new Date(p.start_date).toLocaleDateString()}
                    {p.end_date &&
                      ` · Ended ${new Date(p.end_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {p.revenue_generated > 0 && (
                    <span className="text-sm font-medium text-neutral-700">
                      ${Number(p.revenue_generated).toLocaleString()}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[p.status] ?? "bg-neutral-100 text-neutral-700"}`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Assessments */}
      <div className="glass rounded-2xl p-7">
        <h2 className="text-lg font-semibold text-neutral-900">Saved Assessments</h2>
        {(data?.savedAssessments?.length ?? 0) > 0 ? (
          <div className="mt-4 space-y-3">
            {data?.savedAssessments.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-neutral-100 bg-white px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-lavender-50 px-2.5 py-0.5 text-xs font-medium text-lavender-700 border border-lavender-100">
                      {a.scenario}
                    </span>
                    {a.shared_with_match && (
                      <span className="flex items-center gap-1 rounded-full bg-spearmint-50 px-2.5 py-0.5 text-xs font-medium text-spearmint-700 border border-spearmint-100">
                        <Share2 className="h-3 w-3" /> Shared
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>A: {a.business_a_percent}%</span>
                    <span>B: {a.business_b_percent}%</span>
                  </div>
                  <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="bg-lavender-500 transition-all"
                      style={{ width: `${a.business_a_percent}%` }}
                    />
                    <div
                      className="bg-spearmint-400 transition-all"
                      style={{ width: `${a.business_b_percent}%` }}
                    />
                  </div>
                </div>

                {a.proposed_split_a != null && (
                  <p className="mt-2 text-xs text-neutral-600">
                    Proposed split: {a.proposed_split_a}% / {100 - a.proposed_split_a}%
                  </p>
                )}

                {a.notes && (
                  <p className="mt-1 text-xs text-neutral-500">{a.notes}</p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/partnership-builder?${new URLSearchParams({
                      assessment: a.id,
                      scenario: a.scenario,
                      a: String(a.business_a_percent),
                      b: String(a.business_b_percent),
                      ...(a.proposed_split_a != null && { split: String(a.proposed_split_a) }),
                      ...(a.match_id && { match: a.match_id }),
                    }).toString()}`}
                    className="rounded-xl bg-lavender-50 px-3 py-1.5 text-xs font-medium text-lavender-700 transition-colors hover:bg-lavender-100"
                  >
                    View / Edit
                  </Link>
                  <button
                    onClick={() => deleteAssessment.mutate(a.id)}
                    disabled={deleteAssessment.isPending}
                    className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-neutral-500">
              No saved assessments yet. Use the Partnership Builder to create one.
            </p>
            <Link href="/partnership-builder" className="btn-primary mt-3 inline-block">
              Partnership Builder
            </Link>
          </div>
        )}
      </div>

      {/* Trust & Verification */}
      <div className="glass rounded-2xl p-7">
        <h2 className="text-lg font-semibold text-neutral-900">
          Trust & Verification
        </h2>

        {/* Trust Badges */}
        {badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div
                key={badge.type}
                className="flex items-center gap-1.5 rounded-full bg-spearmint-50 px-3 py-1.5 text-xs font-medium text-spearmint-700 border border-spearmint-100"
                title={badge.description}
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                {badge.label}
              </div>
            ))}
          </div>
        )}

        {/* Verification Status */}
        {(data?.verifications?.length ?? 0) > 0 ? (
          <div className="mt-4 space-y-2">
            {data?.verifications.map((v) => (
              <div
                key={v.verification_type}
                className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-5 py-3"
              >
                <span className="text-sm text-neutral-700">
                  {verificationLabel[v.verification_type] ??
                    v.verification_type}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    v.status === "approved"
                      ? "bg-spearmint-50 text-spearmint-700"
                      : v.status === "pending"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">
            No verifications submitted yet.
          </p>
        )}

        <Link href="/verify" className="btn-primary mt-5 inline-block">
          Submit Verification
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-7">
        <h2 className="text-lg font-semibold text-neutral-900">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link href="/discover" className="group flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-5 py-4 transition-all duration-200 hover:shadow-elevated">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <Users className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Discover Partners</p>
              <p className="text-xs text-neutral-500">Browse businesses near you</p>
            </div>
          </Link>
          <Link href="/partnership-ideas" className="group flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-5 py-4 transition-all duration-200 hover:shadow-elevated">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender-50">
              <Handshake className="h-5 w-5 text-lavender-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Partnership Ideas</p>
              <p className="text-xs text-neutral-500">Get inspired by examples</p>
            </div>
          </Link>
          <Link href="/partnership-builder" className="group flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-5 py-4 transition-all duration-200 hover:shadow-elevated">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-spearmint-50">
              <TrendingUp className="h-5 w-5 text-spearmint-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Partnership Builder</p>
              <p className="text-xs text-neutral-500">Structure fair deals</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
