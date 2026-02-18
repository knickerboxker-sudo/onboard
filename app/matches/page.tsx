"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getTrustBadges } from "@/lib/matching";
import type { BusinessRecord, TrustBadge, PartnershipType, PartnershipStatus } from "@/lib/types";
import { BadgeCheck, Star, Flag, ChevronDown, Users } from "lucide-react";

type PartnerBusiness = {
  id: string;
  name: string;
  business_type: string;
  verified?: boolean;
  years_in_operation?: number | null;
  successful_partnerships_count?: number;
  avg_response_time_minutes?: number | null;
};

type PartnershipInfo = {
  id: string;
  status: PartnershipStatus;
  partnership_type: string;
};

type ReviewInfo = {
  id: string;
  rating: number;
  comment: string | null;
};

type MatchWithPartner = {
  id: string;
  matched_at: string;
  partner: PartnerBusiness;
  partnership: PartnershipInfo | null;
  review: ReviewInfo | null;
  myBusinessId: string;
};

const PARTNERSHIP_TYPES: { value: PartnershipType; label: string }[] = [
  { value: "cross-promotion", label: "Cross Promotion" },
  { value: "product-bundle", label: "Product Bundle" },
  { value: "event-collab", label: "Event Collaboration" },
  { value: "wholesale", label: "Wholesale" },
  { value: "social-media-collab", label: "Social Media Collab" },
];

const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate behavior" },
  { value: "spam", label: "Spam" },
  { value: "fake_business", label: "Fake business" },
  { value: "other", label: "Other" },
];

const STATUS_COLORS: Record<PartnershipStatus, string> = {
  pending: "bg-indigo-50 text-indigo-700",
  active: "bg-green-50 text-green-700",
  paused: "bg-amber-50 text-amber-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-neutral-100 text-neutral-500",
  archived: "bg-neutral-50 text-neutral-500",
};

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={readonly ? "cursor-default" : "cursor-pointer"}
          onClick={() => onChange?.(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-4 w-4 ${star <= value ? "fill-amber-400 text-amber-400" : "text-neutral-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

function TrustBadges({ partner }: { partner: PartnerBusiness }) {
  const badges = getTrustBadges(partner as BusinessRecord);
  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge: TrustBadge) => (
        <span
          key={badge.type}
          className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800"
          title={badge.description}
        >
          <BadgeCheck className="h-3 w-3" />
          {badge.label}
        </span>
      ))}
    </div>
  );
}

function MatchCard({ match }: { match: MatchWithPartner }) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("inappropriate");
  const [reportDetails, setReportDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(false);

  const [showPartnershipForm, setShowPartnershipForm] = useState(false);
  const [partnershipType, setPartnershipType] = useState<PartnershipType>("cross-promotion");

  const startPartnership = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("partnerships").insert({
        match_id: match.id,
        partnership_type: partnershipType,
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
        revenue_generated: 0,
        customers_acquired: 0,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      setShowPartnershipForm(false);
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!match.partnership) return;
      const { error } = await supabase.from("reviews").insert({
        partnership_id: match.partnership.id,
        reviewer_business_id: match.myBusinessId,
        reviewed_business_id: match.partner.id,
        rating: reviewRating,
        comment: reviewComment || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      setShowReviewForm(false);
      setReviewComment("");
    },
  });

  const submitReport = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reports").insert({
        reporter_business_id: match.myBusinessId,
        reported_business_id: match.partner.id,
        reason: reportReason,
        details: reportDetails || null,
        status: "pending",
        is_block: alsoBlock,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setShowReportForm(false);
      setReportDetails("");
      setAlsoBlock(false);
    },
  });

  return (
    <li className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{match.partner.name}</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {match.partner.business_type} · matched{" "}
            {new Date(match.matched_at).toLocaleDateString()}
          </p>
        </div>
        {match.partnership && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[match.partnership.status]}`}
          >
            {match.partnership.status}
          </span>
        )}
      </div>

      {/* Trust badges */}
      <div className="mt-2">
        <TrustBadges partner={match.partner} />
      </div>

      {/* Existing review */}
      {match.review && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
          <StarRating value={match.review.rating} readonly />
          {match.review.comment && (
            <p className="text-xs text-neutral-600">{match.review.comment}</p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Link className="btn-muted" href={`/messages?matchId=${match.id}`}>
          Send message
        </Link>
        <Link className="btn-muted" href={`/partnership-builder?matchId=${match.id}`}>
          Build partnership
        </Link>
        <Link className="btn-muted" href={`/partnership-agreement?matchId=${match.id}`}>
          Agreement
        </Link>
        {!match.partnership && (
          <button
            className="btn-muted"
            onClick={() => setShowPartnershipForm((v) => !v)}
          >
            Start Partnership
            <ChevronDown className="ml-1 inline h-3 w-3" />
          </button>
        )}
        {match.partnership?.status === "completed" && !match.review && (
          <button
            className="btn-muted"
            onClick={() => setShowReviewForm((v) => !v)}
          >
            Leave Review
          </button>
        )}
      </div>

      {/* Start partnership form */}
      {showPartnershipForm && (
        <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <label className="block text-xs font-medium text-neutral-700">
            Partnership Type
          </label>
          <select
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            value={partnershipType}
            onChange={(e) => setPartnershipType(e.target.value as PartnershipType)}
          >
            {PARTNERSHIP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="mt-2 flex gap-2">
            <button
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              disabled={startPartnership.isPending}
              onClick={() => startPartnership.mutate()}
            >
              {startPartnership.isPending ? "Starting…" : "Confirm"}
            </button>
            <button
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
              onClick={() => setShowPartnershipForm(false)}
            >
              Cancel
            </button>
          </div>
          {startPartnership.isError && (
            <p className="mt-1 text-xs text-red-600">{startPartnership.error.message}</p>
          )}
        </div>
      )}

      {/* Review form */}
      {showReviewForm && (
        <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <label className="block text-xs font-medium text-neutral-700">Rating</label>
          <div className="mt-1">
            <StarRating value={reviewRating} onChange={setReviewRating} />
          </div>
          <label className="mt-2 block text-xs font-medium text-neutral-700">
            Comment (optional)
          </label>
          <textarea
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            rows={2}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="How was your partnership experience?"
          />
          <div className="mt-2 flex gap-2">
            <button
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              disabled={submitReview.isPending}
              onClick={() => submitReview.mutate()}
            >
              {submitReview.isPending ? "Submitting…" : "Submit Review"}
            </button>
            <button
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
              onClick={() => setShowReviewForm(false)}
            >
              Cancel
            </button>
          </div>
          {submitReview.isError && (
            <p className="mt-1 text-xs text-red-600">{submitReview.error.message}</p>
          )}
        </div>
      )}

      {/* Report button */}
      <div className="mt-3 border-t border-neutral-100 pt-2">
        <button
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-500"
          onClick={() => setShowReportForm((v) => !v)}
        >
          <Flag className="h-3 w-3" />
          Report
        </button>
      </div>

      {/* Report form */}
      {showReportForm && (
        <div className="mt-2 rounded-lg border border-red-100 bg-red-50 p-3">
          <label className="block text-xs font-medium text-neutral-700">Reason</label>
          <select
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          >
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <label className="mt-2 block text-xs font-medium text-neutral-700">
            Details (optional)
          </label>
          <textarea
            className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            rows={2}
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            placeholder="Provide additional context…"
          />
          <label className="mt-2 flex items-center gap-2 text-xs text-neutral-700">
            <input
              type="checkbox"
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Also block this business
          </label>
          <div className="mt-2 flex gap-2">
            <button
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              disabled={submitReport.isPending}
              onClick={() => submitReport.mutate()}
            >
              {submitReport.isPending ? "Submitting…" : "Submit Report"}
            </button>
            <button
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
              onClick={() => setShowReportForm(false)}
            >
              Cancel
            </button>
          </div>
          {submitReport.isError && (
            <p className="mt-1 text-xs text-red-600">{submitReport.error.message}</p>
          )}
        </div>
      )}
    </li>
  );
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MatchesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (sortOrder !== "newest" ? 1 : 0);

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("all");
    setSortOrder("newest");
  };

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
        .select("id, name, business_type, verified, years_in_operation, successful_partnerships_count, avg_response_time_minutes")
        .in("id", partnerIds);

      const partnerMap = new Map(
        (partners ?? []).map((p: PartnerBusiness) => [p.id, p]),
      );

      const matchIds = matches.map((m: { id: string }) => m.id);

      const { data: partnerships } = await supabase
        .from("partnerships")
        .select("id, match_id, status, partnership_type")
        .in("match_id", matchIds);

      const partnershipMap = new Map(
        (partnerships ?? []).map((p: { id: string; match_id: string; status: PartnershipStatus; partnership_type: string }) => [
          p.match_id,
          { id: p.id, status: p.status, partnership_type: p.partnership_type } as PartnershipInfo,
        ]),
      );

      const completedPartnershipIds = (partnerships ?? [])
        .filter((p: { status: string }) => p.status === "completed")
        .map((p: { id: string }) => p.id);

      let reviewMap = new Map<string, ReviewInfo>();
      if (completedPartnershipIds.length > 0) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("id, partnership_id, rating, comment")
          .eq("reviewer_business_id", business.id)
          .in("partnership_id", completedPartnershipIds);

        reviewMap = new Map(
          (reviews ?? []).map((r: { id: string; partnership_id: string; rating: number; comment: string | null }) => [
            r.partnership_id,
            { id: r.id, rating: r.rating, comment: r.comment } as ReviewInfo,
          ]),
        );
      }

      return matches.map((match: { id: string; matched_at: string; business_1_id: string; business_2_id: string }) => {
        const partnerId = match.business_1_id === business.id ? match.business_2_id : match.business_1_id;
        const partner = partnerMap.get(partnerId);
        const partnership = partnershipMap.get(match.id) ?? null;
        const review = partnership ? reviewMap.get(partnership.id) ?? null : null;
        return {
          id: match.id,
          matched_at: match.matched_at,
          partner: partner ?? { id: partnerId, name: "Unknown Business", business_type: "" },
          partnership,
          review,
          myBusinessId: business.id,
        } as MatchWithPartner;
      });
    },
  });

  if (isLoading)
    return (
      <div className="glass rounded-3xl p-6">
        <div className="h-7 w-40 animate-skeleton-pulse rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-72 animate-skeleton-pulse rounded bg-neutral-200" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="rounded-xl border border-neutral-200 px-4 py-3" key={i}>
              <div className="h-4 w-36 animate-skeleton-pulse rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-48 animate-skeleton-pulse rounded bg-neutral-200" />
              <div className="mt-3 flex gap-2">
                <div className="h-8 w-24 animate-skeleton-pulse rounded-lg bg-neutral-200" />
                <div className="h-8 w-28 animate-skeleton-pulse rounded-lg bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  if (error) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>;

  const filteredData = (data ?? [])
    .filter((match: MatchWithPartner) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = match.partner.name.toLowerCase().includes(q);
        const typeMatch = match.partner.business_type.toLowerCase().includes(q);
        if (!nameMatch && !typeMatch) return false;
      }
      if (statusFilter !== "all") {
        const status = match.partnership?.status;
        if (status !== statusFilter) return false;
      }
      return true;
    })
    .sort((a: MatchWithPartner, b: MatchWithPartner) => {
      const aTime = new Date(a.matched_at).getTime();
      const bTime = new Date(b.matched_at).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });

  return (
    <div className="glass rounded-3xl p-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Your matches</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Each match is a business that wants to collaborate with you — promote each other&apos;s products, cross-market locally, or co-brand together. Start a conversation to explore what&apos;s possible.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          className="input w-full sm:w-64"
          placeholder="Search by name or type…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        {activeFilterCount > 0 && (
          <button className="btn-muted flex items-center gap-1.5" onClick={clearFilters}>
            Clear filters
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Showing {filteredData.length} of {data?.length ?? 0} matches
      </p>

      <ul className="mt-3 space-y-3">
        {filteredData.length ? (
          filteredData.map((match: MatchWithPartner) => (
            <MatchCard key={match.id} match={match} />
          ))
        ) : (
          <li className="rounded-xl border border-dashed border-neutral-300 px-4 py-10 text-center">
            {data?.length ? (
              <p className="text-sm text-neutral-500">No matches found for the current filters.</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Users className="h-8 w-8 text-neutral-300" />
                <h3 className="text-base font-semibold text-neutral-900">Discover Partners</h3>
                <p className="text-sm text-neutral-500">Browse businesses in your area to find your next collaboration partner.</p>
                <Link href="/discover" className="btn-primary mt-2">Discover Partners</Link>
              </div>
            )}
          </li>
        )}
      </ul>
    </div>
  );
}
