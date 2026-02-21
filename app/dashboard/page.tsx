"use client";

export const dynamic = 'force-dynamic';

import React, { useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getTrustBadges, calculateProfileCompletion, buildActivityFeed } from "@/lib/matching";
import type { ActivityFeedItem } from "@/lib/matching";
import type { BusinessRecord, TrustBadge, SavedAssessmentRecord } from "@/lib/types";
import Link from "next/link";
import {
  Archive,
  Award,
  BadgeCheck,
  Clock,
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
import PageAccentRule from "@/app/components/PageAccentRule";

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
        <div className="sortir-card-elevated">
          <div className="h-4 w-40 animate-skeleton-pulse" />
          <div className="mt-3 h-6 w-56 animate-skeleton-pulse" />
          <div className="mt-2 h-4 w-72 animate-skeleton-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="sortir-card-elevated" key={i}>
              <div className="h-4 w-24 animate-skeleton-pulse" />
              <div className="mt-3 h-8 w-16 animate-skeleton-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <p className="px-5 py-4 text-sm" style={{ borderRadius: '2px', background: 'rgba(200,98,42,0.08)', color: 'var(--color-accent)', border: '1px solid rgba(200,98,42,0.2)' }}>
        {error.message}
      </p>
    );

  const badges: TrustBadge[] = data?.business
    ? getTrustBadges(data.business)
    : [];

  const isNewUser = data?.business?.created_at
    ? Date.now() - new Date(data.business.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    : false;

  const profileCompletion = data?.business ? calculateProfileCompletion(data.business) : 100;

  const statCards = [
    { label: "Connections", value: data?.matchCount, icon: Handshake },
    { label: "Connection Requests", value: data?.connectionRequestCount, icon: Users },
    { label: "Messages Sent", value: data?.sentCount, icon: MessageCircle },
    { label: "Messages Received", value: data?.receivedCount, icon: MessageCircle },
    { label: "Pending Partnerships", value: data?.pendingPartnerships, icon: Clock },
    { label: "Active Partnerships", value: data?.activePartnerships, icon: TrendingUp },
    { label: "Completed Partnerships", value: data?.completedPartnerships, icon: Award },
    { label: "Archived Partnerships", value: data?.archivedPartnerships, icon: Archive },
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

  const statusColor: Record<string, React.CSSProperties> = {
    pending: { background: 'var(--color-paper-dark)', color: 'var(--color-ink)' },
    active: { background: 'rgba(26,58,42,0.1)', color: 'var(--color-accent-2)' },
    completed: { background: 'var(--color-paper-dark)', color: 'var(--color-muted)' },
    paused: { background: 'var(--color-paper-dark)', color: 'var(--color-muted)' },
    cancelled: { background: 'rgba(200,98,42,0.1)', color: 'var(--color-accent)' },
    archived: { background: 'var(--color-paper-dark)', color: 'var(--color-muted)' },
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
      <PageAccentRule />
      {/* Editorial page title */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 6vw, 5rem)', letterSpacing: '-0.02em', lineHeight: '1.0', color: 'var(--color-ink)', borderBottom: '1px solid var(--color-rule)', paddingBottom: '24px' }}>
        Dashboard
      </h1>
      {profileCompletion < 60 && (
        <div className="p-5" style={{ background: 'var(--color-accent)', borderRadius: '2px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontStyle: 'italic', color: 'var(--color-paper)' }}>
            Your profile is {profileCompletion}% complete — finish it so partners can find you.
          </p>
          <Link
            href="/settings"
            className="mt-3 inline-block"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-paper)', textDecoration: 'underline' }}
          >
            Complete your profile →
          </Link>
        </div>
      )}
      {/* First-time user welcome banner */}
      {isNewUser && profileCompletion < 60 && (
        <div className="mb-8 p-6" style={{ background: 'var(--color-accent-2)', borderRadius: '2px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontStyle: 'italic', color: 'var(--color-paper)' }}>
            Welcome to Sortir! Here&apos;s your first move.
          </h2>
          <p className="mt-2" style={{ fontSize: '14px', color: 'rgba(245,242,235,0.75)' }}>
            Head to <Link href="/discover" style={{ color: 'var(--color-paper)', textDecoration: 'underline' }}>Discover</Link> to browse businesses near you, or finish filling out your profile so partners can find you.
          </p>
        </div>
      )}
      {/* Header */}
      <div className="sortir-card-elevated">
        <p className="mb-1.5 section-label" style={{ color: 'var(--color-muted)' }}>Your partnership hub</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)' }}>
          {data?.business.name}
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          {data?.business.business_type}
        </p>
        {data?.business.created_at && (
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>Member since {new Date(data.business.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
        )}
        <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
          Track your active partnerships, see who&apos;s collaborating with you, and measure the impact of every connection.
        </p>
      </div>


      {/* Performance Stats or Welcome State */}
      {data?.matchCount === 0 && data?.sentCount === 0 && data?.connectionRequestCount === 0 ? (
        <div className="sortir-card-elevated">
          <p className="mb-1.5 section-label" style={{ color: 'var(--color-muted)' }}>You&apos;re all set up</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontStyle: 'italic', color: 'var(--color-ink)' }}>
            Welcome to Sortir, {data.business.name}! You&apos;re all set up.
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>Your stats will appear here once you start connecting.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/discover" className="btn-primary">Discover Partners</Link>
            <Link href="/partnership-ideas" className="btn-secondary">Get Inspired</Link>
            <Link href="/refer" className="btn-secondary">Invite a Business</Link>
          </div>
        </div>
      ) : (
        <>
        {/* Forest green full-bleed performance block — mirrors the "How it Works" dark section on the landing page.
            The -24px horizontal margin breaks out of the layout container's padding to go full-width. */}
        <div style={{ background: 'var(--color-accent-2)', padding: '40px', margin: '32px -24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontStyle: 'italic', color: 'var(--color-paper)', marginBottom: '24px' }}>
          Your performance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((item) => (
            <div key={item.label} style={{ borderTop: '1px solid rgba(245,242,235,0.15)', padding: '24px 0' }}>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center" style={{ borderRadius: '2px', backgroundColor: 'rgba(245,242,235,0.1)' }}>
                  <item.icon className="h-4 w-4" style={{ color: 'rgba(245,242,235,0.6)' }} />
                </div>
                <p className="text-sm" style={{ color: 'rgba(245,242,235,0.7)' }}>{item.label}</p>
              </div>
              <p className="mt-3 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-paper)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
        </div>
        </>
      )}

      {/* Activity Feed */}
      {(data?.activityFeed?.length ?? 0) > 0 && (
        <div className="sortir-card-elevated">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>Activity Feed</h2>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
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
              const Icon = iconMap[item.type] ?? Zap;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-5 py-3.5 transition-colors"
                  style={{ borderRadius: '2px', border: '1px solid var(--color-rule)', background: 'var(--color-paper)' }}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center" style={{ borderRadius: '2px', background: 'var(--color-paper-dark)', color: 'var(--color-muted)' }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{item.title}</p>
                    <p className="mt-0.5 text-xs line-clamp-2" style={{ color: 'var(--color-muted)' }}>{item.description}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        {new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                      {item.actionHref && (
                        <Link href={item.actionHref} className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
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
        <div className="sortir-card-elevated">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>ROI Summary</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="p-4" style={{ borderRadius: '2px', background: 'var(--color-paper-dark)' }}>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Revenue per Partnership</p>
              <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--color-ink)' }}>
                $
                {data?.completedPartnerships
                  ? Math.round(
                      data.totalRevenue / data.completedPartnerships,
                    ).toLocaleString()
                  : 0}
              </p>
            </div>
            <div className="p-4" style={{ borderRadius: '2px', background: 'var(--color-paper-dark)' }}>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Total Partnerships</p>
              <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--color-ink)' }}>
                {(data?.activePartnerships ?? 0) +
                  (data?.completedPartnerships ?? 0)}
              </p>
            </div>
            <div className="p-4" style={{ borderRadius: '2px', background: 'var(--color-paper-dark)' }}>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Total Revenue</p>
              <p className="mt-1 text-xl font-semibold" style={{ color: 'var(--color-ink)' }}>
                ${(data?.totalRevenue ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Partnership Activity */}
      {(data?.recentPartnerships?.length ?? 0) > 0 && (
        <div className="sortir-card-elevated">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>
            Partnership Activity
          </h2>
          <div className="mt-4 space-y-3">
            {data?.recentPartnerships.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between"
                style={{ borderRadius: '2px', border: '1px solid var(--color-rule)', background: 'var(--color-paper)', padding: '14px 20px' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                    {p.partnership_type}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    Started {new Date(p.start_date).toLocaleDateString()}
                    {p.end_date &&
                      ` · Ended ${new Date(p.end_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {p.revenue_generated > 0 && (
                    <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                      ${Number(p.revenue_generated).toLocaleString()}
                    </span>
                  )}
                  <span
                    className="px-2.5 py-0.5 text-xs font-medium"
                    style={{ borderRadius: '2px', ...(statusColor[p.status] ?? { background: 'var(--color-paper-dark)', color: 'var(--color-muted)' }) }}
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
      <div className="sortir-card-elevated">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>Saved Assessments</h2>
        {(data?.savedAssessments?.length ?? 0) > 0 ? (
          <div className="mt-4 space-y-3">
            {data?.savedAssessments.map((a) => (
              <div
                key={a.id}
                className="px-5 py-4"
                style={{ borderRadius: '2px', border: '1px solid var(--color-rule)', background: 'var(--color-paper)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-medium" style={{ borderRadius: '2px', background: 'var(--color-paper-dark)', color: 'var(--color-ink)', border: '1px solid var(--color-rule)' }}>
                      {a.scenario}
                    </span>
                    {a.shared_with_match && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium" style={{ borderRadius: '2px', background: 'rgba(26,58,42,0.08)', color: 'var(--color-accent-2)', border: '1px solid rgba(26,58,42,0.15)' }}>
                        <Share2 className="h-3 w-3" /> Shared
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-muted)' }}>
                    <span>A: {a.business_a_percent}%</span>
                    <span>B: {a.business_b_percent}%</span>
                  </div>
                  <div className="mt-1.5 flex h-2 overflow-hidden" style={{ borderRadius: '2px', background: 'var(--color-paper-dark)' }}>
                    <div
                      className="transition-all"
                      style={{ width: `${a.business_a_percent}%`, background: 'var(--color-accent)' }}
                    />
                    <div
                      className="transition-all"
                      style={{ width: `${a.business_b_percent}%`, background: 'var(--color-accent-2)' }}
                    />
                  </div>
                </div>

                {a.proposed_split_a != null && (
                  <p className="mt-2 text-xs" style={{ color: 'var(--color-muted)' }}>
                    Proposed split: {a.proposed_split_a}% / {100 - a.proposed_split_a}%
                  </p>
                )}

                {a.notes && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>{a.notes}</p>
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
                    className="px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{ borderRadius: '2px', background: 'var(--color-paper-dark)', color: 'var(--color-ink)', border: '1px solid var(--color-rule)' }}
                  >
                    View / Edit
                  </Link>
                  <button
                    onClick={() => deleteAssessment.mutate(a.id)}
                    disabled={deleteAssessment.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                    style={{ borderRadius: '2px', background: 'rgba(200,98,42,0.08)', color: 'var(--color-accent)', border: '1px solid rgba(200,98,42,0.15)' }}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              No saved assessments yet. Use the Partnership Builder to create one.
            </p>
            <Link href="/partnership-builder" className="btn-primary mt-3 inline-block">
              Partnership Builder
            </Link>
          </div>
        )}
      </div>

      {/* Trust & Verification */}
      <div className="sortir-card-elevated">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>
          Trust & Verification
        </h2>

        {/* Trust Badges */}
        {badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div
                key={badge.type}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                style={{ borderRadius: '2px', background: 'rgba(26,58,42,0.08)', color: 'var(--color-accent-2)', border: '1px solid rgba(26,58,42,0.15)' }}
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
                style={{ borderRadius: '2px', border: '1px solid var(--color-rule)', background: 'var(--color-paper)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ color: 'var(--color-ink)', fontSize: '14px' }}>
                  {verificationLabel[v.verification_type] ??
                    v.verification_type}
                </span>
                <span
                  className="px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    borderRadius: '2px',
                    ...(v.status === "approved"
                      ? { background: 'rgba(26,58,42,0.08)', color: 'var(--color-accent-2)' }
                      : v.status === "pending"
                        ? { background: 'var(--color-paper-dark)', color: 'var(--color-muted)' }
                        : { background: 'rgba(200,98,42,0.08)', color: 'var(--color-accent)' })
                  }}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm" style={{ color: 'var(--color-muted)' }}>
            No verifications submitted yet.
          </p>
        )}

        <Link href="/verify" className="btn-primary mt-5 inline-block">
          Submit Verification
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="sortir-card-elevated">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-ink)' }}>Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/discover" className="group" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '2px', border: '1px solid var(--color-rule)', background: 'var(--color-paper)', padding: '16px 20px', transition: 'all 0.2s' }}>
            <div style={{ borderRadius: '2px', background: 'var(--color-paper-dark)', color: 'var(--color-ink)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Discover Partners</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Browse businesses near you</p>
            </div>
          </Link>
          <Link href="/partnership-ideas" className="group" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '2px', border: '1px solid var(--color-rule)', background: 'var(--color-paper)', padding: '16px 20px', transition: 'all 0.2s' }}>
            <div style={{ borderRadius: '2px', background: 'var(--color-paper-dark)', color: 'var(--color-ink)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Partnership Ideas</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Get inspired by examples</p>
            </div>
          </Link>
          <Link href="/partnership-builder" className="group" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '2px', border: '1px solid var(--color-rule)', background: 'var(--color-paper)', padding: '16px 20px', transition: 'all 0.2s' }}>
            <div style={{ borderRadius: '2px', background: 'rgba(26,58,42,0.08)', color: 'var(--color-accent-2)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Partnership Builder</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Structure fair deals</p>
            </div>
          </Link>
          <Link href="/refer" className="group" style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '2px', border: '1px solid var(--color-rule)', background: 'var(--color-paper)', padding: '16px 20px', transition: 'all 0.2s' }}>
            <div style={{ borderRadius: '2px', background: 'var(--color-paper-dark)', color: 'var(--color-ink)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Invite &amp; Earn</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Refer businesses for rewards</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
