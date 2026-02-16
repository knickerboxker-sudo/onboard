"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type MatchWithPartner = {
  id: string;
  matched_at: string;
  partnerName: string;
  partnerType: string;
};

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
        .select("id, matched_at, business_1_id, business_2_id")
        .or(`business_1_id.eq.${business.id},business_2_id.eq.${business.id}`)
        .order("matched_at", { ascending: false });

      if (matchesError) throw new Error(matchesError.message);
      if (!matches || matches.length === 0) return [];

      const partnerIds = matches.map((m: { business_1_id: string; business_2_id: string }) =>
        m.business_1_id === business.id ? m.business_2_id : m.business_1_id,
      );

      const { data: partners } = await supabase
        .from("businesses")
        .select("id, name, business_type")
        .in("id", partnerIds);

      const partnerMap = new Map(
        (partners ?? []).map((p: { id: string; name: string; business_type: string }) => [p.id, p]),
      );

      return matches.map((match: { id: string; matched_at: string; business_1_id: string; business_2_id: string }) => {
        const partnerId = match.business_1_id === business.id ? match.business_2_id : match.business_1_id;
        const partner = partnerMap.get(partnerId);
        return {
          id: match.id,
          matched_at: match.matched_at,
          partnerName: partner?.name ?? "Unknown Business",
          partnerType: partner?.business_type ?? "",
        } as MatchWithPartner;
      });
    },
  });

  if (isLoading) return <div className="glass rounded-3xl p-6">Loading matches…</div>;
  if (error) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>;

  return (
    <div className="glass rounded-3xl p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Matches</h1>
      <p className="mt-1 text-sm text-slate-500">Your mutual connections with local businesses.</p>
      <ul className="mt-5 space-y-3">
        {data?.length ? (
          data.map((match: MatchWithPartner) => (
            <li className="rounded-xl border border-slate-200 bg-white px-4 py-3" key={match.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{match.partnerName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{match.partnerType} · matched {new Date(match.matched_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link className="btn-muted" href={`/messages?matchId=${match.id}`}>
                  Send message
                </Link>
                <Link className="btn-muted" href={`/partnership-builder?matchId=${match.id}`}>
                  Build partnership
                </Link>
              </div>
            </li>
          ))
        ) : (
          <li className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">No matches yet. Start swiping to build your local network.</li>
        )}
      </ul>
    </div>
  );
}
