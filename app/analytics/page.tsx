"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { TIER_LIMITS } from "@/lib/matching";
import type { BusinessRecord, SubscriptionTier } from "@/lib/types";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Handshake,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Partnership = {
  id: string;
  match_id: string;
  partnership_type: string;
  start_date: string;
  end_date: string | null;
  revenue_generated: number;
  customers_acquired: number;
  status: string;
  created_at: string;
};

const DATE_RANGES = [
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
] as const;

const CHART_COLORS = ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function diffMonths(start: string, end: string | null): number {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30)));
}

function exportCSV(partnerships: Partnership[]) {
  const headers = [
    "ID",
    "Partnership Type",
    "Status",
    "Start Date",
    "End Date",
    "Revenue Generated",
    "Customers Acquired",
  ];
  const rows = partnerships.map((p) => [
    p.id,
    p.partnership_type,
    p.status,
    p.start_date,
    p.end_date ?? "",
    String(p.revenue_generated ?? 0),
    String(p.customers_acquired ?? 0),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "partnerships.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rangeDays, setRangeDays] = useState<number>(90);

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
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

      const tier: SubscriptionTier = business.subscription_tier ?? "free";
      if (!TIER_LIMITS[tier].advancedAnalytics) {
        return { gated: true as const, business: business as BusinessRecord, partnerships: [] };
      }

      const bizId = business.id;
      const { data: matchRows } = await supabase
        .from("matches")
        .select("id")
        .or(`business_1_id.eq.${bizId},business_2_id.eq.${bizId}`);
      const matchIds = (matchRows ?? []).map((m: { id: string }) => m.id);

      const { data: partnerships } = await supabase
        .from("partnerships")
        .select("id, match_id, partnership_type, start_date, end_date, revenue_generated, customers_acquired, status, created_at")
        .in("match_id", matchIds)
        .order("start_date", { ascending: true });

      return {
        gated: false as const,
        business: business as BusinessRecord,
        partnerships: (partnerships ?? []) as Partnership[],
      };
    },
  });

  if (isLoading) return <div className="glass rounded-3xl p-6">Loading analytics…</div>;
  if (error)
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
    );

  if (data?.gated) {
    return (
      <div className="glass rounded-3xl p-6 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-semibold text-slate-900">Advanced Analytics</h1>
        <p className="mt-2 text-sm text-slate-500">
          Unlock charts, revenue insights, and CSV exports with a Pro or Premium plan.
        </p>
        <Link href="/settings" className="btn-primary mt-4 inline-block">
          Upgrade Now
        </Link>
      </div>
    );
  }

  const cutoff = daysAgo(rangeDays);
  const filtered = (data?.partnerships ?? []).filter(
    (p) => new Date(p.start_date) >= cutoff,
  );

  const totalRevenue = filtered.reduce((s, p) => s + (Number(p.revenue_generated) || 0), 0);
  const avgDuration =
    filtered.length > 0
      ? filtered.reduce((s, p) => s + diffMonths(p.start_date, p.end_date), 0) / filtered.length
      : 0;

  const revenueByType: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};
  for (const p of filtered) {
    revenueByType[p.partnership_type] = (revenueByType[p.partnership_type] || 0) + (Number(p.revenue_generated) || 0);
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  }

  const topType =
    Object.entries(revenueByType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const revenueByMonth: Record<string, number> = {};
  for (const p of filtered) {
    const k = monthKey(p.start_date);
    revenueByMonth[k] = (revenueByMonth[k] || 0) + (Number(p.revenue_generated) || 0);
  }
  const lineData = Object.keys(revenueByMonth)
    .sort()
    .map((k) => ({ month: monthLabel(k), revenue: revenueByMonth[k] }));

  const barData = Object.entries(revenueByType).map(([type, revenue]) => ({ type, revenue }));

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const metrics = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign },
    { label: "Avg Duration", value: `${avgDuration.toFixed(1)} mo`, icon: Clock },
    { label: "Partnerships", value: filtered.length, icon: Handshake },
    { label: "Top Type", value: topType, icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6">
        <p className="mb-1 text-sm font-medium uppercase tracking-[0.18em] text-lavender-600">
          Advanced analytics
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visualize your partnership performance over time.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          {DATE_RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setRangeDays(r.days)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                rangeDays === r.days
                  ? "bg-lavender-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={() => exportCSV(filtered)}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div className="glass rounded-2xl p-5" key={m.label}>
            <div className="flex items-center gap-2">
              <m.icon className="h-4 w-4 text-slate-400" />
              <p className="text-sm text-slate-500">{m.label}</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">Revenue Over Time</h2>
        <div className="mt-4 h-72">
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#0ea5e9" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="pt-24 text-center text-sm text-slate-400">No data in this range.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-slate-900">Revenue by Type</h2>
          <div className="mt-4 h-72">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="pt-24 text-center text-sm text-slate-400">No data in this range.</p>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-slate-900">Status Distribution</h2>
          <div className="mt-4 h-72">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="pt-24 text-center text-sm text-slate-400">No data in this range.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
