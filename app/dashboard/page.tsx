"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getTrustBadges } from "@/lib/matching";
import type { BusinessRecord, TrustBadge } from "@/lib/types";
import {
  Activity,
  Award,
  BadgeCheck,
  DollarSign,
  Eye,
  Handshake,
  MessageCircle,
  Star,
  TrendingUp,
} from "lucide-react";

type Partnership = {
  id: string;
  partnership_type: string;
  status: string;
  revenue_generated: number;
  start_date: string;
  end_date: string | null;
};

type Verification = {
  verification_type: string;
  status: string;
};

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);

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
        { count: swipeCount },
        { count: matchCount },
        { count: sentCount },
        { count: receivedCount },
        { count: profileViewCount },
        { data: partnerships },
        { data: verifications },
        { data: reviews },
      ] = await Promise.all([
        supabase
          .from("swipes")
          .select("id", { count: "exact", head: true })
          .eq("swiper_business_id", bizId),
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
          .select("id, partnership_type, status, revenue_generated, start_date, end_date")
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
      ]);

      // TODO: Partnership logic — add "pending" state tracking so businesses
      // can see inbound partnership requests and approve/reject them.
      // TODO: Add "archived" partnership state for historical record-keeping.
      const activePartnerships = (partnerships ?? []).filter(
        (p: Partnership) => p.status === "active",
      );
      const completedPartnerships = (partnerships ?? []).filter(
        (p: Partnership) => p.status === "completed",
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

      return {
        business: business as BusinessRecord,
        swipeCount: swipeCount ?? 0,
        matchCount: matchCount ?? 0,
        sentCount: sentCount ?? 0,
        receivedCount: receivedCount ?? 0,
        profileViewCount: profileViewCount ?? 0,
        activePartnerships: activePartnerships.length,
        completedPartnerships: completedPartnerships.length,
        totalRevenue,
        avgRating,
        recentPartnerships: (partnerships ?? []).slice(0, 5) as Partnership[],
        verifications: (verifications ?? []) as Verification[],
      };
    },
  });

  if (isLoading)
    return <div className="glass rounded-3xl p-6">Loading dashboard…</div>;
  if (error)
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {error.message}
      </p>
    );

  const badges: TrustBadge[] = data?.business
    ? getTrustBadges(data.business)
    : [];

  const statCards = [
    { label: "Total Swipes", value: data?.swipeCount, icon: Activity },
    { label: "Matches", value: data?.matchCount, icon: Handshake },
    { label: "Messages Sent", value: data?.sentCount, icon: MessageCircle },
    { label: "Messages Received", value: data?.receivedCount, icon: MessageCircle },
    { label: "Active Partnerships", value: data?.activePartnerships, icon: TrendingUp },
    { label: "Completed Partnerships", value: data?.completedPartnerships, icon: Award },
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
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    paused: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const verificationLabel: Record<string, string> = {
    business_license: "Business License",
    storefront_photo: "Storefront Photo",
    tax_id: "Tax ID",
    social_media: "Social Media",
    website: "Website",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass rounded-3xl p-6">
        <p className="mb-1 text-sm font-medium uppercase tracking-[0.18em] text-sky-700">Your partnership hub</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {data?.business.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {data?.business.business_type}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Track your active partnerships, see who&apos;s collaborating with you, and measure the impact of every connection.
        </p>
      </div>

      {/* Performance Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((item) => (
          <div className="glass rounded-2xl p-5" key={item.label}>
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-slate-400" />
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* ROI Summary */}
      {(data?.completedPartnerships ?? 0) > 0 && (
        <div className="glass rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-slate-900">ROI Summary</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Revenue per Partnership</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                $
                {data?.completedPartnerships
                  ? Math.round(
                      data.totalRevenue / data.completedPartnerships,
                    ).toLocaleString()
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Partnerships</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {(data?.activePartnerships ?? 0) +
                  (data?.completedPartnerships ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                ${(data?.totalRevenue ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Partnership Activity */}
      {(data?.recentPartnerships?.length ?? 0) > 0 && (
        <div className="glass rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Partnership Activity
          </h2>
          <div className="mt-3 space-y-3">
            {data?.recentPartnerships.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {p.partnership_type}
                  </p>
                  <p className="text-xs text-slate-500">
                    Started {new Date(p.start_date).toLocaleDateString()}
                    {p.end_date &&
                      ` · Ended ${new Date(p.end_date).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {p.revenue_generated > 0 && (
                    <span className="text-sm font-medium text-slate-700">
                      ${Number(p.revenue_generated).toLocaleString()}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[p.status] ?? "bg-slate-100 text-slate-700"}`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust & Verification */}
      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Trust & Verification
        </h2>

        {/* Trust Badges */}
        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <div
                key={badge.type}
                className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800"
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
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-white/60 px-4 py-2"
              >
                <span className="text-sm text-slate-700">
                  {verificationLabel[v.verification_type] ??
                    v.verification_type}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    v.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : v.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No verifications submitted yet.
          </p>
        )}
      </div>
    </div>
  );
}
