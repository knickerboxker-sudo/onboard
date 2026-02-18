"use client";

export const dynamic = 'force-dynamic';

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Send, MessageCircle } from "lucide-react";

type MatchWithPartner = {
  id: string;
  matched_at: string;
  partnerName: string;
  partnerType: string;
  partnerBusinessId: string;
  partnershipTypes: string[];
  lastActiveAt: string | null;
  avgResponseTimeMinutes: number | null;
};

type Message = {
  id: string;
  match_id: string;
  sender_business_id: string;
  content: string;
  sent_at: string;
};

function MessagesPageContent() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const matchId = searchParams.get("matchId");
    if (matchId) setActiveMatchId(matchId);
  }, [searchParams]);

  const { data: matchesData, isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ["message-matches"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to view messages.");

      const { data: business } = await supabase
        .from("businesses")
        .select("id, partnership_types")
        .eq("owner_id", user.id)
        .single();
      if (!business) throw new Error("Please complete onboarding first.");

      const { data: connections, error: connectionsError } = await supabase
        .from("connection_requests")
        .select("id, created_at, sender_business_id, receiver_business_id")
        .eq("status", "accepted")
        .or(`sender_business_id.eq.${business.id},receiver_business_id.eq.${business.id}`)
        .order("created_at", { ascending: false });

      if (connectionsError) throw new Error(connectionsError.message);
      if (!connections || connections.length === 0) return { businessId: business.id, businessPartnershipTypes: business.partnership_types ?? [], matches: [] as MatchWithPartner[] };

      const partnerIds = connections.map((c: { sender_business_id: string; receiver_business_id: string }) =>
        c.sender_business_id === business.id ? c.receiver_business_id : c.sender_business_id,
      );

      const { data: partners } = await supabase
        .from("businesses")
        .select("id, name, business_type, partnership_types, last_active_at, avg_response_time_minutes")
        .in("id", partnerIds);

      const partnerMap = new Map(
        (partners ?? []).map((p: { id: string; name: string; business_type: string; partnership_types: string[] | null; last_active_at: string | null; avg_response_time_minutes: number | null }) => [p.id, p]),
      );

      const enriched: MatchWithPartner[] = connections.map((c: { id: string; created_at: string; sender_business_id: string; receiver_business_id: string }) => {
        const partnerId = c.sender_business_id === business.id ? c.receiver_business_id : c.sender_business_id;
        const partner = partnerMap.get(partnerId);
        return {
          id: c.id,
          matched_at: c.created_at,
          partnerName: partner?.name ?? "Unknown",
          partnerType: partner?.business_type ?? "",
          partnerBusinessId: partnerId,
          partnershipTypes: partner?.partnership_types ?? [],
          lastActiveAt: partner?.last_active_at ?? null,
          avgResponseTimeMinutes: partner?.avg_response_time_minutes ?? null,
        };
      });

      return { businessId: business.id, businessPartnershipTypes: business.partnership_types ?? [], matches: enriched };
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
  });

  useEffect(() => {
    if (!activeMatchId) return;
    const channel = supabase
      .channel(`messages:${activeMatchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `match_id=eq.${activeMatchId}` },
        (payload) => {
          const incoming = payload.new as Message;
          queryClient.setQueryData<Message[]>(["messages", activeMatchId], (old) => {
            if (!old) return [incoming];
            if (old.some((m) => m.id === incoming.id)) return old;
            return [...old, incoming];
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeMatchId, supabase, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeMatchId]);

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
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: ["messages", activeMatchId] });
      const previous = queryClient.getQueryData<Message[]>(["messages", activeMatchId]);
      const previousMessage = newMessage;
      const optimistic: Message = {
        id: `optimistic-${crypto.randomUUID()}`,
        match_id: activeMatchId!,
        sender_business_id: matchesData?.businessId ?? "",
        content,
        sent_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Message[]>(["messages", activeMatchId], (old) =>
        old ? [...old, optimistic] : [optimistic],
      );
      setNewMessage("");
      return { previous, previousMessage };
    },
    onError: (_err, _content, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["messages", activeMatchId], context.previous);
      }
      if (context?.previousMessage !== undefined) {
        setNewMessage(context.previousMessage);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["messages", activeMatchId] });
    },
  });

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    if (!newMessage.trim()) return;
    sendMutation.mutate(newMessage.trim());
  };

  if (matchesLoading)
    return (
      <section className="grid gap-5 lg:grid-cols-[320px_1fr]" style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className="glass min-w-0 rounded-3xl p-5">
          <div className="h-6 w-32 animate-skeleton-pulse rounded bg-neutral-200" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="rounded-xl border border-neutral-200 px-4 py-3" key={i}>
                <div className="h-4 w-28 animate-skeleton-pulse rounded bg-neutral-200" />
                <div className="mt-1 h-3 w-20 animate-skeleton-pulse rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="glass flex min-w-0 flex-col rounded-3xl p-5">
          <div className="space-y-3">
            <div className="flex justify-start">
              <div className="h-10 w-48 animate-skeleton-pulse rounded-2xl bg-neutral-200" />
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-40 animate-skeleton-pulse rounded-2xl bg-neutral-200" />
            </div>
            <div className="flex justify-start">
              <div className="h-10 w-56 animate-skeleton-pulse rounded-2xl bg-neutral-200" />
            </div>
          </div>
        </div>
      </section>
    );
  if (matchesError) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{matchesError.message}</p>;

  const activeMatch = matchesData?.matches.find((m) => m.id === activeMatchId);

  return (
    <section className="grid gap-5 lg:grid-cols-[320px_1fr]" style={{ minHeight: "calc(100vh - 160px)" }}>
      <div className="glass min-w-0 rounded-3xl p-5">
        <h2 className="text-lg font-semibold text-neutral-900">Conversations</h2>
        {matchesData?.matches.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 text-center">
            <MessageCircle className="h-8 w-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-900">No conversations yet</p>
            <p className="text-xs text-neutral-500">Connect with businesses to start messaging.</p>
            <Link href="/discover" className="btn-primary mt-2 text-xs">Find Partners →</Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {matchesData?.matches.map((match) => (
              <li key={match.id}>
                <button
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    activeMatchId === match.id
                      ? "border-sky-200 bg-sky-50 text-sky-800"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                  onClick={() => setActiveMatchId(match.id)}
                  type="button"
                >
                  <p className="font-medium">{match.partnerName}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{match.partnerType}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="glass flex min-w-0 flex-col rounded-3xl">
        {!activeMatchId ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-neutral-500">Select a conversation to start messaging your partner.</p>
          </div>
        ) : (
          <>
            <div className="border-b border-neutral-200 px-5 py-4">
              <h3 className="font-semibold text-neutral-900">{activeMatch?.partnerName ?? "Conversation"}</h3>
              <p className="text-xs text-neutral-500">
                Connected {activeMatch ? new Date(activeMatch.matched_at).toLocaleDateString() : ""}
              </p>
              {activeMatch && (() => {
                const lastActive = activeMatch.lastActiveAt ? new Date(activeMatch.lastActiveAt) : null;
                const isActiveNow = lastActive && (Date.now() - lastActive.getTime()) < 60 * 60 * 1000;
                if (isActiveNow) {
                  return <p className="mt-1 text-xs font-medium text-green-600">● Active now</p>;
                }
                if (activeMatch.avgResponseTimeMinutes != null) {
                  const hours = Math.max(1, Math.round(activeMatch.avgResponseTimeMinutes / 60));
                  return <p className="mt-1 text-xs text-neutral-400">Usually responds within {hours}h</p>;
                }
                return null;
              })()}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5" style={{ maxHeight: "calc(100vh - 340px)" }}>
              {messagesLoading ? (
                <div className="h-20 w-full animate-skeleton-pulse rounded-2xl bg-neutral-200" />
              ) : messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isMine = msg.sender_business_id === matchesData?.businessId;
                  return (
                    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`} key={msg.id}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMine
                            ? "bg-neutral-900 text-white"
                            : "border border-neutral-200 bg-white text-neutral-700"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center gap-3 py-6">
                  <p className="text-center text-sm text-neutral-500">No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="border-t border-neutral-200 p-4" onSubmit={handleSend}>
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

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <section className="grid gap-5 lg:grid-cols-[320px_1fr]" style={{ minHeight: "calc(100vh - 160px)" }}>
        <div className="glass min-w-0 rounded-3xl p-5">
          <div className="h-6 w-32 animate-skeleton-pulse rounded bg-neutral-200" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="rounded-xl border border-neutral-200 px-4 py-3" key={i}>
                <div className="h-4 w-28 animate-skeleton-pulse rounded bg-neutral-200" />
                <div className="mt-1 h-3 w-20 animate-skeleton-pulse rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="glass flex min-w-0 flex-col rounded-3xl p-5">
          <div className="space-y-3">
            <div className="flex justify-start">
              <div className="h-10 w-48 animate-skeleton-pulse rounded-2xl bg-neutral-200" />
            </div>
            <div className="flex justify-end">
              <div className="h-10 w-40 animate-skeleton-pulse rounded-2xl bg-neutral-200" />
            </div>
            <div className="flex justify-start">
              <div className="h-10 w-56 animate-skeleton-pulse rounded-2xl bg-neutral-200" />
            </div>
          </div>
        </div>
      </section>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}
