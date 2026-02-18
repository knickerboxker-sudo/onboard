"use client";

export const dynamic = 'force-dynamic';

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { 
  Check, 
  X, 
  Clock, 
  MessageSquare, 
  Building2, 
  Send,
  Inbox,
  Users,
  ArrowRight
} from "lucide-react";
import PageAccentRule from "@/app/components/PageAccentRule";

type Business = {
  id: string;
  name: string;
  business_type: string;
};

type ConnectionRequest = {
  id: string;
  sender_business_id: string;
  receiver_business_id: string;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  sender?: Business | Business[];
  receiver?: Business | Business[];
};

function extractBusiness(relation?: Business | Business[]): Business | undefined {
  return Array.isArray(relation) ? relation[0] : relation;
}

export default function ConnectionsPage() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in.");

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();
      if (!business) throw new Error("Please complete onboarding.");

      const bizId = business.id;

      const [
        { data: incoming },
        { data: outgoing },
        { data: accepted },
      ] = await Promise.all([
        supabase
          .from("connection_requests")
          .select(`
            id,
            sender_business_id,
            receiver_business_id,
            message,
            status,
            created_at,
            sender:businesses!connection_requests_sender_business_id_fkey(id, name, business_type)
          `)
          .eq("receiver_business_id", bizId)
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase
          .from("connection_requests")
          .select(`
            id,
            sender_business_id,
            receiver_business_id,
            message,
            status,
            created_at,
            receiver:businesses!connection_requests_receiver_business_id_fkey(id, name, business_type)
          `)
          .eq("sender_business_id", bizId)
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
        supabase
          .from("connection_requests")
          .select(`
            id,
            sender_business_id,
            receiver_business_id,
            message,
            status,
            created_at,
            sender:businesses!connection_requests_sender_business_id_fkey(id, name, business_type),
            receiver:businesses!connection_requests_receiver_business_id_fkey(id, name, business_type)
          `)
          .or(`sender_business_id.eq.${bizId},receiver_business_id.eq.${bizId}`)
          .eq("status", "accepted")
          .order("created_at", { ascending: false }),
      ]);

      return {
        businessId: bizId,
        incoming: (incoming ?? []) as ConnectionRequest[],
        outgoing: (outgoing ?? []) as ConnectionRequest[],
        accepted: (accepted ?? []) as ConnectionRequest[],
      };
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "declined" }) => {
      const { error } = await supabase
        .from("connection_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  if (isLoading)
    return (
      <div className="space-y-5">
        <div className="glass rounded-2xl p-7">
          <div className="h-6 w-48 animate-skeleton-pulse rounded-lg bg-neutral-200" />
          <div className="mt-2 h-4 w-72 animate-skeleton-pulse rounded-lg bg-neutral-200" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="glass rounded-2xl p-6" key={i}>
              <div className="h-4 w-32 animate-skeleton-pulse rounded-lg bg-neutral-200" />
              <div className="mt-3 h-5 w-40 animate-skeleton-pulse rounded-lg bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error.message}
      </p>
    );

  return (
    <div className="space-y-6">
      <PageAccentRule />
      {/* Header */}
      <div className="glass rounded-2xl p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lavender-100">
            <Users className="h-6 w-6 text-lavender-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Connections</h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              Manage your connection requests and view accepted connections
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
              <Inbox className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-sm text-neutral-500">Incoming Requests</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-neutral-900">
            {data?.incoming.length ?? 0}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
              <Send className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm text-neutral-500">Outgoing Requests</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-neutral-900">
            {data?.outgoing.length ?? 0}
          </p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-spearmint-100">
              <Users className="h-4 w-4 text-spearmint-600" />
            </div>
            <p className="text-sm text-neutral-500">Accepted Connections</p>
          </div>
          <p className="mt-3 text-3xl font-bold text-neutral-900">
            {data?.accepted.length ?? 0}
          </p>
        </div>
      </div>

      {/* Incoming Requests */}
      <div className="glass rounded-2xl p-7">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold text-neutral-900">
            Incoming Requests
          </h2>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Businesses that want to connect with you
        </p>

        {(data?.incoming.length ?? 0) > 0 ? (
          <div className="mt-4 space-y-3">
            {data?.incoming.map((request) => {
              const sender = extractBusiness(request.sender);
              return (
                <div
                  key={request.id}
                  className="rounded-xl border border-neutral-100 bg-white p-5 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lavender-50">
                        <Building2 className="h-5 w-5 text-lavender-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {sender?.name ?? "Unknown Business"}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          {sender?.business_type ?? "Business"}
                        </p>
                        {request.message && (
                          <p className="mt-2 text-sm text-neutral-600">
                            &ldquo;{request.message}&rdquo;
                          </p>
                        )}
                        <p className="mt-1 text-xs text-neutral-400">
                          Sent {new Date(request.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateRequest.mutate({ id: request.id, status: "accepted" })
                        }
                        disabled={updateRequest.isPending}
                        className="flex items-center gap-1 rounded-xl bg-spearmint-50 px-3 py-2 text-sm font-medium text-spearmint-700 transition-colors hover:bg-spearmint-100 disabled:opacity-50"
                        type="button"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          updateRequest.mutate({ id: request.id, status: "declined" })
                        }
                        disabled={updateRequest.isPending}
                        className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-8 text-center">
            <Inbox className="mx-auto h-8 w-8 text-neutral-400" />
            <p className="mt-2 text-sm font-medium text-neutral-600">
              No incoming requests
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Businesses you connect with will appear here
            </p>
          </div>
        )}
      </div>

      {/* Outgoing Requests */}
      <div className="glass rounded-2xl p-7">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-neutral-900">
            Outgoing Requests
          </h2>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Connection requests you&apos;ve sent
        </p>

        {(data?.outgoing.length ?? 0) > 0 ? (
          <div className="mt-4 space-y-3">
            {data?.outgoing.map((request) => {
              const receiver = extractBusiness(request.receiver);
              return (
                <div
                  key={request.id}
                  className="rounded-xl border border-neutral-100 bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900">
                        {receiver?.name ?? "Unknown Business"}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {receiver?.business_type ?? "Business"}
                      </p>
                      {request.message && (
                        <p className="mt-2 text-sm text-neutral-600">
                          Your message: &ldquo;{request.message}&rdquo;
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
                          <Clock className="h-3.5 w-3.5" />
                          Awaiting response
                        </div>
                        <p className="text-xs text-neutral-400">
                          Sent {new Date(request.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-8 text-center">
            <Send className="mx-auto h-8 w-8 text-neutral-400" />
            <p className="mt-2 text-sm font-medium text-neutral-600">
              No outgoing requests
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Send connection requests from the Discover page
            </p>
            <Link
              href="/discover"
              className="btn-primary mx-auto mt-4 inline-flex"
            >
              Discover Businesses
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Accepted Connections */}
      <div className="glass rounded-2xl p-7">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-spearmint-600" />
          <h2 className="text-lg font-semibold text-neutral-900">
            Accepted Connections
          </h2>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Businesses you&apos;re connected with
        </p>

        {(data?.accepted.length ?? 0) > 0 ? (
          <div className="mt-4 space-y-3">
            {data?.accepted.map((request) => {
              const otherBusiness =
                request.sender_business_id === data?.businessId
                  ? extractBusiness(request.receiver)
                  : extractBusiness(request.sender);
              return (
                <div
                  key={request.id}
                  className="rounded-xl border border-neutral-100 bg-white p-5 transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-spearmint-50">
                        <Building2 className="h-5 w-5 text-spearmint-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {otherBusiness?.name ?? "Unknown Business"}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          {otherBusiness?.business_type ?? "Business"}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-400">
                          Connected since {new Date(request.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/messages"
                      className="flex items-center gap-1.5 rounded-xl bg-lavender-50 px-3 py-2 text-sm font-medium text-lavender-700 transition-colors hover:bg-lavender-100"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-8 text-center">
            <Users className="mx-auto h-8 w-8 text-neutral-400" />
            <p className="mt-2 text-sm font-medium text-neutral-600">
              No active connections yet
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Go discover partners and start connecting.
            </p>
            <Link
              href="/discover"
              className="btn-primary mx-auto mt-4 inline-flex"
            >
              Discover Partners
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
