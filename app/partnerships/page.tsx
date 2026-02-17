"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Award,
  Calendar,
  ChevronRight,
  Flag,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Zap,
  PartyPopper,
} from "lucide-react";
import type { PartnershipRecord, PartnershipStatus, PartnershipHealthScore } from "@/lib/types";

const STATUS_STYLES: Record<PartnershipStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  active: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Active" },
  paused: { bg: "bg-neutral-50", text: "text-neutral-700", label: "Paused" },
  completed: { bg: "bg-sky-50", text: "text-sky-700", label: "Completed" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", label: "Cancelled" },
  archived: { bg: "bg-neutral-50", text: "text-neutral-500", label: "Archived" },
};

const TABS = ["Overview", "Milestones", "Health"] as const;
type Tab = (typeof TABS)[number];

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30;

function calculateHealth(partnership: PartnershipRecord): PartnershipHealthScore {
  const factors = [];

  // Revenue factor
  const revFactor = Math.min(100, (partnership.revenue_generated / 1000) * 20);
  factors.push({ label: "Revenue Generated", value: revFactor, max: 100 });

  // Customer acquisition factor
  const custFactor = Math.min(100, partnership.customers_acquired * 5);
  factors.push({ label: "Customers Acquired", value: custFactor, max: 100 });

  // Duration factor
  const start = new Date(partnership.start_date);
  const now = new Date();
  const months = Math.max(1, (now.getTime() - start.getTime()) / MS_PER_MONTH);
  const durFactor = Math.min(100, months * 10);
  factors.push({ label: "Partnership Duration", value: durFactor, max: 100 });

  // Rating factor
  const ratingFactor = partnership.success_rating ? partnership.success_rating * 20 : 50;
  factors.push({ label: "Success Rating", value: ratingFactor, max: 100 });

  const avg = factors.reduce((sum, f) => sum + f.value, 0) / factors.length;
  const level = avg >= 70 ? "healthy" : avg >= 40 ? "moderate" : "needs_attention";

  return { score: Math.round(avg), level, factors };
}

function HealthIndicator({ health }: { health: PartnershipHealthScore }) {
  const color = health.level === "healthy" ? "text-emerald-600" : health.level === "moderate" ? "text-amber-600" : "text-red-600";
  const bg = health.level === "healthy" ? "bg-emerald-500" : health.level === "moderate" ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-full ${bg}`} />
      <span className={`text-xs font-semibold ${color}`}>{health.score}%</span>
    </div>
  );
}

function PartnershipCard({ partnership, partnerName }: { partnership: PartnershipRecord; partnerName: string }) {
  const status = STATUS_STYLES[partnership.status] ?? STATUS_STYLES.pending;
  const health = calculateHealth(partnership);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-neutral-100 transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-neutral-900">{partnerName}</h3>
          <p className="text-xs text-neutral-500">{partnership.partnership_type}</p>
        </div>
        <div className="flex items-center gap-2">
          <HealthIndicator health={health} />
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-neutral-400">Revenue</p>
          <p className="text-sm font-semibold text-neutral-900">${partnership.revenue_generated.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400">Customers</p>
          <p className="text-sm font-semibold text-neutral-900">{partnership.customers_acquired}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400">Since</p>
          <p className="text-sm font-semibold text-neutral-900">{new Date(partnership.start_date).toLocaleDateString()}</p>
        </div>
      </div>

      {partnership.success_rating && (
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full ${i < partnership.success_rating! ? "bg-amber-400" : "bg-neutral-200"}`}
            />
          ))}
          <span className="ml-1 text-[10px] text-neutral-400">{partnership.success_rating}/5</span>
        </div>
      )}
    </div>
  );
}

function MilestoneTracker() {
  const defaultMilestones = [
    { id: "1", title: "First Collaboration", type: "first_sale", target: 1, current: 0, completed: false },
    { id: "2", title: "10 Customers Referred", type: "customer_goal", target: 10, current: 3, completed: false },
    { id: "3", title: "$1,000 Revenue", type: "revenue_threshold", target: 1000, current: 450, completed: false },
    { id: "4", title: "3 Month Anniversary", type: "duration_milestone", target: 3, current: 2, completed: false },
    { id: "5", title: "First Sale", type: "first_sale", target: 1, current: 1, completed: true },
  ];

  return (
    <div className="space-y-3">
      {defaultMilestones.map((m) => {
        const progress = Math.min(100, (m.current / m.target) * 100);
        return (
          <div key={m.id} className="rounded-xl bg-white p-4 shadow-card ring-1 ring-neutral-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {m.completed ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <Trophy className="h-4 w-4 text-emerald-600" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
                    <Target className="h-4 w-4 text-neutral-500" />
                  </div>
                )}
                <div>
                  <p className={`text-sm font-medium ${m.completed ? "text-emerald-700" : "text-neutral-900"}`}>
                    {m.title}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {m.current} / {m.target} {m.type === "revenue_threshold" ? "dollars" : ""}
                  </p>
                </div>
              </div>
              {m.completed && (
                <span className="text-xs font-medium text-emerald-600">✓ Completed</span>
              )}
            </div>
            {!m.completed && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HealthDashboard({ partnerships }: { partnerships: PartnershipRecord[] }) {
  const healthScores = partnerships.map((p) => calculateHealth(p));
  const avgHealth = healthScores.length > 0
    ? Math.round(healthScores.reduce((sum, h) => sum + h.score, 0) / healthScores.length)
    : 0;

  const avgLevel = avgHealth >= 70 ? "healthy" : avgHealth >= 40 ? "moderate" : "needs_attention";
  const avgColor = avgLevel === "healthy" ? "text-emerald-600" : avgLevel === "moderate" ? "text-amber-600" : "text-red-600";
  const avgBg = avgLevel === "healthy" ? "from-emerald-500 to-emerald-600" : avgLevel === "moderate" ? "from-amber-500 to-amber-600" : "from-red-500 to-red-600";

  const suggestions = [];
  if (avgHealth < 70) suggestions.push("Consider reaching out to partners more frequently to boost engagement.");
  if (avgHealth < 50) suggestions.push("Some partnerships may benefit from revised goals or terms.");
  if (partnerships.some((p) => p.status === "paused")) suggestions.push("You have paused partnerships — review if they should be reactivated or completed.");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-neutral-100">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${avgBg}`}>
            <span className="text-2xl font-bold text-white">{avgHealth}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600">Overall Partnership Health</p>
            <p className={`text-lg font-bold ${avgColor}`}>
              {avgLevel === "healthy" ? "Healthy" : avgLevel === "moderate" ? "Moderate" : "Needs Attention"}
            </p>
          </div>
        </div>
      </div>

      {healthScores.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900">Health Factors</h3>
          <div className="mt-4 space-y-3">
            {healthScores[0].factors.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">{f.label}</span>
                  <span className="font-medium text-neutral-900">{Math.round(f.value)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${f.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900">Suggestions</h3>
          <div className="mt-3 space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800">
                <Zap className="mt-0.5 h-3 w-3 flex-shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PartnershipsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>("Overview");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["partnerships-overview"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { partnerships: [], partnerNames: new Map<string, string>() };

      const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
      if (!biz) return { partnerships: [], partnerNames: new Map<string, string>() };

      // Get matches involving user
      const { data: matches } = await supabase
        .from("matches")
        .select("id, business_1_id, business_2_id")
        .or(`business_1_id.eq.${biz.id},business_2_id.eq.${biz.id}`);

      if (!matches || matches.length === 0) return { partnerships: [], partnerNames: new Map<string, string>() };

      const matchIds = matches.map((m: { id: string }) => m.id);
      const { data: partnerships } = await supabase
        .from("partnerships")
        .select("*")
        .in("match_id", matchIds)
        .order("created_at", { ascending: false });

      // Get partner names
      const partnerBizIds = new Set<string>();
      matches.forEach((m: { business_1_id: string; business_2_id: string }) => {
        if (m.business_1_id !== biz.id) partnerBizIds.add(m.business_1_id);
        if (m.business_2_id !== biz.id) partnerBizIds.add(m.business_2_id);
      });

      const { data: partnerBizzes } = await supabase
        .from("businesses")
        .select("id, name")
        .in("id", Array.from(partnerBizIds));

      const partnerNames = new Map<string, string>();
      (partnerBizzes ?? []).forEach((b: { id: string; name: string }) => partnerNames.set(b.id, b.name));

      // Map match_id to partner name
      const matchToPartner = new Map<string, string>();
      matches.forEach((m: { id: string; business_1_id: string; business_2_id: string }) => {
        const partnerId = m.business_1_id === biz.id ? m.business_2_id : m.business_1_id;
        matchToPartner.set(m.id, partnerNames.get(partnerId) ?? "Partner");
      });

      return {
        partnerships: (partnerships ?? []) as PartnershipRecord[],
        matchToPartner,
      };
    },
  });

  const partnerships = data?.partnerships ?? [];
  const matchToPartner = data?.matchToPartner ?? new Map<string, string>();

  const filteredPartnerships = statusFilter === "all"
    ? partnerships
    : partnerships.filter((p) => p.status === statusFilter);

  const activeCount = partnerships.filter((p) => p.status === "active").length;
  const totalRevenue = partnerships.reduce((sum, p) => sum + p.revenue_generated, 0);
  const totalCustomers = partnerships.reduce((sum, p) => sum + p.customers_acquired, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Partnerships</h1>
          <p className="mt-1 text-sm text-neutral-500">Track, manage, and grow your business partnerships.</p>
        </div>
        <Link href="/discover" className="btn-primary text-xs">
          <Plus className="mr-1 h-3.5 w-3.5" /> Find New Partners
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Active Partnerships", value: activeCount, icon: Users, color: "text-emerald-600" },
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-sky-600" },
          { label: "Customers Acquired", value: totalCustomers, icon: Target, color: "text-violet-600" },
          { label: "All Partnerships", value: partnerships.length, icon: Award, color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-neutral-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-neutral-400">{stat.label}</p>
                <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-neutral-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-skeleton-pulse h-32 rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : (
        <>
          {tab === "Overview" && (
            <div className="space-y-4">
              {/* Status filter */}
              <div className="flex flex-wrap gap-2">
                {["all", "active", "pending", "paused", "completed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === s ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              {filteredPartnerships.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-card ring-1 ring-neutral-100">
                  <Users className="mx-auto h-12 w-12 text-neutral-300" />
                  <p className="mt-4 text-sm font-medium text-neutral-600">No partnerships yet</p>
                  <p className="mt-1 text-xs text-neutral-400">Discover businesses in your area to find your first partner!</p>
                  <Link href="/discover" className="btn-primary mt-4 text-xs">
                    Discover Partners
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredPartnerships.map((p) => (
                    <PartnershipCard
                      key={p.id}
                      partnership={p}
                      partnerName={matchToPartner.get(p.match_id) ?? "Partner"}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Milestones" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Milestone Tracker</h2>
              </div>
              <MilestoneTracker />
            </div>
          )}

          {tab === "Health" && <HealthDashboard partnerships={partnerships} />}
        </>
      )}
    </div>
  );
}
