"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export default function MatchesPage() {
  const supabase = useMemo(() => createClient(), []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: business } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
      if (!business) return [];

      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("*, messages(count)")
        .or(`business_1_id.eq.${business.id},business_2_id.eq.${business.id}`)
        .order("matched_at", { ascending: false });

      if (matchesError) throw new Error(matchesError.message);
      return matches ?? [];
    },
  });

  if (isLoading) return <div className="glass rounded-3xl p-6">Loading matches…</div>;
  if (error) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>;

  return (
    <div className="glass rounded-3xl p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Matches</h1>
      <ul className="mt-5 space-y-3">
        {data?.length ? (
          data.map((match: { id: string; matched_at: string }) => (
            <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700" key={match.id}>
              Match ID {match.id.slice(0, 8)} · connected {new Date(match.matched_at).toLocaleDateString()}
            </li>
          ))
        ) : (
          <li className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">No matches yet. Start swiping to build your local network.</li>
        )}
      </ul>
    </div>
  );
}
