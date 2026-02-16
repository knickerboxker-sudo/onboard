"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in.");

      const { data: business } = await supabase.from("businesses").select("id,name,business_type").eq("owner_id", user.id).single();
      if (!business) throw new Error("Please complete onboarding.");

      const [{ count: swipeCount }, { count: matchCount }, { count: conversationCount }] = await Promise.all([
        supabase.from("swipes").select("id", { count: "exact", head: true }).eq("swiper_business_id", business.id),
        supabase.from("matches").select("id", { count: "exact", head: true }).or(`business_1_id.eq.${business.id},business_2_id.eq.${business.id}`),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("sender_business_id", business.id),
      ]);

      return {
        business,
        swipeCount: swipeCount ?? 0,
        matchCount: matchCount ?? 0,
        conversationCount: conversationCount ?? 0,
      };
    },
  });

  if (isLoading) return <div className="glass rounded-3xl p-6">Loading dashboard…</div>;
  if (error) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>;

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6">
        <h1 className="text-2xl font-semibold text-slate-900">{data?.business.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{data?.business.business_type}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[{ label: "Total swipes", value: data?.swipeCount }, { label: "Matches", value: data?.matchCount }, { label: "Messages sent", value: data?.conversationCount }].map((item) => (
          <div className="glass rounded-2xl p-5" key={item.label}>
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
