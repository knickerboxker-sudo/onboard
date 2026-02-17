"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Award,
  Check,
  Copy,
  Gift,
  Link2,
  Mail,
  Share2,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { ReferralRecord } from "@/lib/types";

const REFERRAL_MILESTONES = [
  { count: 1, reward: "Extended profile visibility boost", icon: Star },
  { count: 3, reward: "Priority placement in discover results", icon: Zap },
  { count: 5, reward: "Featured in city spotlight", icon: Gift },
  { count: 10, reward: "Founding Partner badge on profile", icon: Trophy },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  invited: { label: "Invited", color: "bg-neutral-100 text-neutral-600" },
  signed_up: { label: "Signed Up", color: "bg-sky-50 text-sky-700" },
  first_match: { label: "First Match", color: "bg-amber-50 text-amber-700" },
  active_partnership: { label: "Active Partnership", color: "bg-emerald-50 text-emerald-700" },
};

function generateReferralCode(businessId: string): string {
  return `SORT-${businessId.substring(0, 6).toUpperCase()}`;
}

export default function ReferPage() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const [emailInput, setEmailInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  const { data: userBusiness } = useQuery({
    queryKey: ["refer-user-business"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      return data;
    },
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals", userBusiness?.id],
    enabled: !!userBusiness?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_business_id", userBusiness!.id)
        .order("created_at", { ascending: false });
      return (data ?? []) as ReferralRecord[];
    },
  });

  const sendInvite = useMutation({
    mutationFn: async (email: string) => {
      if (!userBusiness) throw new Error("No business found");
      const { error } = await supabase.from("referrals").insert({
        referrer_business_id: userBusiness.id,
        referred_email: email.trim(),
        status: "invited",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setSendStatus("Invitation recorded!");
      setEmailInput("");
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
    },
    onError: (err) => setSendStatus(err.message),
  });

  const referralCode = userBusiness ? (userBusiness.referral_code ?? generateReferralCode(userBusiness.id)) : "";
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    if (referralCode) {
      setReferralLink(`${window.location.origin}/auth?ref=${referralCode}`);
    }
  }, [referralCode]);

  const successfulReferrals = referrals.filter((r) => r.status === "active_partnership").length;
  const signedUpCount = referrals.filter((r) => r.status !== "invited").length;

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSendInvites() {
    const emails = emailInput.split(",").map((e) => e.trim()).filter((e) => e.includes("@"));
    if (emails.length === 0) { setSendStatus("Please enter valid email addresses"); return; }
    setSendStatus(null);
    emails.forEach((email) => sendInvite.mutate(email));
  }

  const nextMilestone = REFERRAL_MILESTONES.find((m) => m.count > successfulReferrals);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Refer & Earn</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Invite businesses to Sortir and earn rewards for every successful partnership they form.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
              <Mail className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400">Invites Sent</p>
              <p className="text-xl font-bold text-neutral-900">{referrals.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400">Signed Up</p>
              <p className="text-xl font-bold text-neutral-900">{signedUpCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
              <Award className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-neutral-400">Active Partnerships</p>
              <p className="text-xl font-bold text-neutral-900">{successfulReferrals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-900">Your Referral Link</h2>
        <p className="mt-1 text-xs text-neutral-500">Share this link with businesses you&apos;d like to invite.</p>
        <div className="mt-4 flex gap-2">
          <div className="flex min-w-0 flex-1 items-center rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <Link2 className="mr-2 h-4 w-4 flex-shrink-0 text-neutral-400" />
            <span className="truncate text-sm text-neutral-600">{referralLink || "Sign in to get your link"}</span>
          </div>
          <button onClick={copyLink} className="btn-muted flex-shrink-0" disabled={!referralLink}>
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        {userBusiness && (
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
              Code: {referralCode}
            </span>
          </div>
        )}
      </div>

      {/* Email Invite */}
      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-900">Invite by Email</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Enter email addresses separated by commas to send batch invitations.
        </p>
        <div className="mt-4 space-y-3">
          <textarea
            className="input"
            rows={3}
            placeholder="email1@example.com, email2@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSendInvites}
              disabled={!emailInput.trim() || sendInvite.isPending}
              className="btn-primary text-xs disabled:opacity-50"
            >
              <Mail className="mr-1 h-3.5 w-3.5" />
              {sendInvite.isPending ? "Sending..." : "Send Invites"}
            </button>
            {sendStatus && (
              <p className={`text-xs ${sendStatus.includes("recorded") ? "text-emerald-600" : "text-red-600"}`}>
                {sendStatus}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rewards Milestones */}
      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-900">Referral Rewards</h2>
        <p className="mt-1 text-xs text-neutral-500">Unlock rewards as you refer more businesses.</p>
        <div className="mt-4 space-y-3">
          {REFERRAL_MILESTONES.map((milestone) => {
            const reached = successfulReferrals >= milestone.count;
            return (
              <div key={milestone.count} className={`flex items-center gap-4 rounded-xl border p-4 ${reached ? "border-emerald-200 bg-emerald-50" : "border-neutral-200"}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${reached ? "bg-emerald-500" : "bg-neutral-100"}`}>
                  <milestone.icon className={`h-5 w-5 ${reached ? "text-white" : "text-neutral-400"}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${reached ? "text-emerald-800" : "text-neutral-900"}`}>
                    {milestone.count} referral{milestone.count !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-neutral-500">{milestone.reward}</p>
                </div>
                {reached && <Check className="h-5 w-5 text-emerald-600" />}
              </div>
            );
          })}
        </div>
        {nextMilestone && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Progress to next reward</span>
              <span>{successfulReferrals} / {nextMilestone.count}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(successfulReferrals / nextMilestone.count) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Referral Network Visualization */}
      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-900">Your Referral Network</h2>
        <div className="mt-4">
          {referrals.length === 0 ? (
            <div className="py-8 text-center">
              <Share2 className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-3 text-sm text-neutral-500">No referrals yet. Share your link to get started!</p>
            </div>
          ) : (
            <div className="relative">
              {/* Simple network visualization using SVG */}
              <svg width="100%" height="200" viewBox="0 0 400 200" className="mx-auto max-w-lg" aria-hidden="true">
                {/* Center node (you) */}
                <circle cx="200" cy="100" r="24" fill="#0ea5e9" opacity="0.15" />
                <circle cx="200" cy="100" r="16" fill="#0ea5e9" />
                <text x="200" y="104" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">You</text>

                {/* Referral nodes */}
                {referrals.slice(0, 8).map((r, i) => {
                  const angle = (i / Math.min(referrals.length, 8)) * 2 * Math.PI - Math.PI / 2;
                  const radius = 70;
                  const x = 200 + Math.cos(angle) * radius;
                  const y = 100 + Math.sin(angle) * radius;
                  const isActive = r.status === "active_partnership";
                  const hasSignedUp = r.status !== "invited";

                  return (
                    <g key={r.id}>
                      <line
                        x1="200" y1="100" x2={x} y2={y}
                        stroke={isActive ? "#10b981" : hasSignedUp ? "#0ea5e9" : "#e2e8f0"}
                        strokeWidth="2"
                        strokeDasharray={isActive ? "" : "4 4"}
                      />
                      <circle cx={x} cy={y} r="10" fill={isActive ? "#10b981" : hasSignedUp ? "#0ea5e9" : "#e2e8f0"} />
                      <text x={x} y={y + 22} textAnchor="middle" fill="#64748b" fontSize="8">
                        {r.referred_email.split("@")[0].substring(0, 8)}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Referral list */}
              <div className="mt-4 space-y-2">
                {referrals.map((r) => {
                  const statusInfo = STATUS_LABELS[r.status] ?? STATUS_LABELS.invited;
                  return (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{r.referred_email}</p>
                        <p className="text-[10px] text-neutral-400">
                          Invited {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
