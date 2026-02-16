"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";

type MatchWithPartner = {
  id: string;
  matched_at: string;
  partnerName: string;
  partnerType: string;
  partnerBusinessId: string;
};

type Message = {
  id: string;
  match_id: string;
  sender_business_id: string;
  content: string;
  sent_at: string;
};

export default function MessagesPage() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ["message-matches"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to view messages.");

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();
      if (!business) throw new Error("Please complete onboarding first.");

      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("id, matched_at, business_1_id, business_2_id")
        .or(`business_1_id.eq.${business.id},business_2_id.eq.${business.id}`)
        .order("matched_at", { ascending: false });

      if (matchesError) throw new Error(matchesError.message);
      if (!matches || matches.length === 0) return { businessId: business.id, matches: [] as MatchWithPartner[] };

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

      const enriched: MatchWithPartner[] = matches.map((m: { id: string; matched_at: string; business_1_id: string; business_2_id: string }) => {
        const partnerId = m.business_1_id === business.id ? m.business_2_id : m.business_1_id;
        const partner = partnerMap.get(partnerId);
        return {
          id: m.id,
          matched_at: m.matched_at,
          partnerName: partner?.name ?? "Unknown",
          partnerType: partner?.business_type ?? "",
          partnerBusinessId: partnerId,
        };
      });

      return { businessId: business.id, matches: enriched };
    },
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", activeMatchId],
    enabled: !!activeMatchId,
    queryFn: async () => {
      if (!activeMatchId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", activeMatchId)
        .order("sent_at", { ascending: true });

      if (error) throw new Error(error.message);
      return (data ?? []) as Message[];
    },
    refetchInterval: activeMatchId ? 5000 : false,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeMatchId || !matchesData?.businessId) return;
      const { error } = await supabase.from("messages").insert({
        match_id: activeMatchId,
        sender_business_id: matchesData.businessId,
        content,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setNewMessage("");
      void queryClient.invalidateQueries({ queryKey: ["messages", activeMatchId] });
    },
  });

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
    sendMutation.mutate(newMessage.trim());
  };

  if (matchesLoading) return <div className="glass rounded-3xl p-6">Loading conversations…</div>;
  if (matchesError) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{matchesError.message}</p>;

  const activeMatch = matchesData?.matches.find((m) => m.id === activeMatchId);

  return (
    <section className="grid gap-5 lg:grid-cols-[320px_1fr]" style={{ minHeight: "calc(100vh - 160px)" }}>
      <div className="glass rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-slate-900">Conversations</h2>
        {matchesData?.matches.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No matches yet. Start swiping to find local partners.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {matchesData?.matches.map((match) => (
              <li key={match.id}>
                <button
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    activeMatchId === match.id
                      ? "border-sky-200 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => setActiveMatchId(match.id)}
                  type="button"
                >
                  <p className="font-medium">{match.partnerName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{match.partnerType}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="glass flex flex-col rounded-3xl">
        {!activeMatchId ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-slate-500">Select a conversation to start messaging your partner.</p>
          </div>
        ) : (
          <>
            <div className="border-b border-slate-200 px-5 py-4">
              <h3 className="font-semibold text-slate-900">{activeMatch?.partnerName ?? "Conversation"}</h3>
              <p className="text-xs text-slate-500">
                Matched {activeMatch ? new Date(activeMatch.matched_at).toLocaleDateString() : ""}
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5" style={{ maxHeight: "calc(100vh - 340px)" }}>
              {messagesLoading ? (
                <div className="h-20 w-full animate-skeleton-pulse rounded-2xl bg-slate-200" />
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isMine = msg.sender_business_id === matchesData?.businessId;
                  return (
                    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`} key={msg.id}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMine
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`mt-1 text-xs ${isMine ? "text-slate-400" : "text-slate-400"}`}>
                          {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-sm text-slate-500">No messages yet. Start the conversation!</p>
              )}
            </div>

            <form className="border-t border-slate-200 p-4" onSubmit={handleSend}>
              <div className="flex gap-3">
                <input
                  className="input flex-1"
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Type a message..."
                  value={newMessage}
                />
                <button
                  className="btn-primary"
                  disabled={!newMessage.trim() || sendMutation.isPending}
                  type="submit"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {sendMutation.isError ? (
                <p className="mt-2 text-xs text-red-600">{sendMutation.error.message}</p>
              ) : null}
            </form>
          </>
        )}
      </div>
    </section>
  );
}
