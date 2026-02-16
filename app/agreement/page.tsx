"use client";

import { Suspense, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PARTNERSHIP_TEMPLATES } from "@/lib/matching";
import type { PartnershipType } from "@/lib/types";

const PARTNERSHIP_TYPES: { value: PartnershipType; label: string }[] = [
  { value: "cross-promotion", label: "Cross Promotion" },
  { value: "product-bundle", label: "Product Bundle" },
  { value: "event-collab", label: "Event Collaboration" },
  { value: "wholesale", label: "Wholesale" },
  { value: "social-media-collab", label: "Social Media Collab" },
];

function AgreementForm() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId") ?? "";
  const supabase = useMemo(() => createClient(), []);

  const [partnershipType, setPartnershipType] = useState<PartnershipType>("cross-promotion");
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());
  const [splitA, setSplitA] = useState(50);
  const [splitB, setSplitB] = useState(50);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customTerms, setCustomTerms] = useState("");
  const [signatureA, setSignatureA] = useState("");
  const [signatureB, setSignatureB] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["agreement-match", matchId],
    enabled: !!matchId,
    queryFn: async () => {
      const { data: match, error: matchErr } = await supabase
        .from("matches")
        .select("id, business_1_id, business_2_id")
        .eq("id", matchId)
        .single();
      if (matchErr) throw new Error(matchErr.message);

      const { data: businesses, error: bizErr } = await supabase
        .from("businesses")
        .select("id, name, business_type")
        .in("id", [match.business_1_id, match.business_2_id]);
      if (bizErr) throw new Error(bizErr.message);

      const bizA = businesses?.find((b: { id: string }) => b.id === match.business_1_id);
      const bizB = businesses?.find((b: { id: string }) => b.id === match.business_2_id);
      return {
        match,
        businessA: bizA ?? { id: match.business_1_id, name: "Business A", business_type: "" },
        businessB: bizB ?? { id: match.business_2_id, name: "Business B", business_type: "" },
      };
    },
  });

  const saveDraft = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();
      if (!biz) throw new Error("No business found");

      const notes = buildAgreementText();
      const { error } = await supabase.from("saved_assessments").insert({
        match_id: matchId,
        creator_business_id: biz.id,
        business_a_percent: splitA,
        business_b_percent: splitB,
        scenario: `agreement-draft:${partnershipType}`,
        proposed_split_a: splitA,
        notes,
        shared_with_match: false,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => setSaveStatus("Draft saved!"),
    onError: (err) => setSaveStatus(err.message),
  });

  const templates = PARTNERSHIP_TEMPLATES.filter((t) => t.type === partnershipType);

  const allTerms = templates.flatMap((t) => t.terms);

  function toggleTerm(term: string) {
    setSelectedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(term)) next.delete(term);
      else next.add(term);
      return next;
    });
  }

  function handleSplitA(val: number) {
    const clamped = Math.min(100, Math.max(0, val));
    setSplitA(clamped);
    setSplitB(100 - clamped);
  }

  function handleSplitB(val: number) {
    const clamped = Math.min(100, Math.max(0, val));
    setSplitB(clamped);
    setSplitA(100 - clamped);
  }

  function buildAgreementText(): string {
    const bizA = data?.businessA;
    const bizB = data?.businessB;
    const lines: string[] = [];

    lines.push("=".repeat(60));
    lines.push("SORTIR — PARTNERSHIP AGREEMENT");
    lines.push("=".repeat(60));
    lines.push("");
    lines.push(`Date Generated: ${new Date().toLocaleDateString()}`);
    lines.push("");
    lines.push("PARTIES");
    lines.push("-".repeat(40));
    lines.push(`Party A: ${bizA?.name ?? "N/A"} (${bizA?.business_type ?? ""})`);
    lines.push(`Party B: ${bizB?.name ?? "N/A"} (${bizB?.business_type ?? ""})`);
    lines.push("");
    lines.push("PARTNERSHIP TYPE");
    lines.push("-".repeat(40));
    const typeLabel = PARTNERSHIP_TYPES.find((t) => t.value === partnershipType)?.label ?? partnershipType;
    lines.push(typeLabel);
    lines.push("");
    lines.push("TERMS");
    lines.push("-".repeat(40));
    const termsArr = Array.from(selectedTerms);
    if (termsArr.length > 0) {
      termsArr.forEach((term, i) => lines.push(`${i + 1}. ${term}`));
    } else {
      lines.push("No template terms selected.");
    }
    lines.push("");
    lines.push("REVENUE SPLIT");
    lines.push("-".repeat(40));
    lines.push(`${bizA?.name ?? "Party A"}: ${splitA}%`);
    lines.push(`${bizB?.name ?? "Party B"}: ${splitB}%`);
    lines.push("");
    lines.push("DURATION");
    lines.push("-".repeat(40));
    lines.push(`Start Date: ${startDate || "TBD"}`);
    lines.push(`End Date: ${endDate || "TBD"}`);
    lines.push("");
    if (customTerms.trim()) {
      lines.push("CUSTOM TERMS");
      lines.push("-".repeat(40));
      lines.push(customTerms.trim());
      lines.push("");
    }
    lines.push("SIGNATURES");
    lines.push("-".repeat(40));
    lines.push(`${bizA?.name ?? "Party A"}: ${signatureA || "_______________"}`);
    lines.push(`${bizB?.name ?? "Party B"}: ${signatureB || "_______________"}`);
    lines.push("");
    lines.push("=".repeat(60));
    lines.push("DISCLAIMER: This is a template for discussion purposes.");
    lines.push("Consult legal counsel before executing.");
    lines.push("=".repeat(60));
    lines.push("");
    lines.push("Generated by Sortir — Local Business Partnership Platform");

    return lines.join("\n");
  }

  function downloadAgreement() {
    const text = buildAgreementText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sortir-agreement-${matchId.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (!matchId) {
    return (
      <div className="glass rounded-3xl p-6">
        <p className="text-sm text-slate-500">No match ID provided.</p>
        <Link href="/matches" className="btn-primary mt-3 inline-block">
          Back to Matches
        </Link>
      </div>
    );
  }

  if (isLoading) return <div className="glass rounded-3xl p-6">Loading agreement data…</div>;
  if (error) return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{(error as Error).message}</p>;

  const { businessA, businessB } = data!;
  const splitValid = splitA + splitB === 100;

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Partnership Agreement</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate a partnership agreement between matched businesses.
        </p>
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This is a template for discussion purposes. Consult legal counsel before executing.
        </p>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">Parties</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Party A</label>
            <input className="input w-full" value={businessA.name} readOnly />
            <p className="mt-1 text-xs text-slate-500">{businessA.business_type}</p>
          </div>
          <div>
            <label className="label">Party B</label>
            <input className="input w-full" value={businessB.name} readOnly />
            <p className="mt-1 text-xs text-slate-500">{businessB.business_type}</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">Partnership Type</h2>
        <select
          className="input mt-2 w-full"
          value={partnershipType}
          onChange={(e) => {
            setPartnershipType(e.target.value as PartnershipType);
            setSelectedTerms(new Set());
          }}
        >
          {PARTNERSHIP_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {templates.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">{templates[0].description}</p>
        )}
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">Template Terms</h2>
        <p className="mt-1 text-xs text-slate-500">Select the terms to include in your agreement.</p>
        {allTerms.length > 0 ? (
          <div className="mt-3 space-y-2">
            {allTerms.map((term) => (
              <label key={term} className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-slate-300"
                  checked={selectedTerms.has(term)}
                  onChange={() => toggleTerm(term)}
                />
                {term}
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No templates available for this type.</p>
        )}
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">Revenue Split</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{businessA.name} (%)</label>
            <input
              type="number"
              className="input w-full"
              min={0}
              max={100}
              value={splitA}
              onChange={(e) => handleSplitA(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">{businessB.name} (%)</label>
            <input
              type="number"
              className="input w-full"
              min={0}
              max={100}
              value={splitB}
              onChange={(e) => handleSplitB(Number(e.target.value))}
            />
          </div>
        </div>
        {!splitValid && (
          <p className="mt-2 text-xs text-red-600">Revenue split must sum to 100%.</p>
        )}
        {templates.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Suggested: {templates[0].suggestedSplit}
          </p>
        )}
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">Duration</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              className="input w-full"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              className="input w-full"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">Custom Terms</h2>
        <textarea
          className="input mt-2 w-full"
          rows={4}
          placeholder="Add any additional terms or notes…"
          value={customTerms}
          onChange={(e) => setCustomTerms(e.target.value)}
        />
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">Digital Signatures</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{businessA.name} — Signed by</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Type full name"
              value={signatureA}
              onChange={(e) => setSignatureA(e.target.value)}
            />
          </div>
          <div>
            <label className="label">{businessB.name} — Signed by</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Type full name"
              value={signatureB}
              onChange={(e) => setSignatureB(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-primary"
            disabled={!splitValid}
            onClick={downloadAgreement}
          >
            Generate Agreement
          </button>
          <button
            className="btn-muted"
            disabled={saveDraft.isPending}
            onClick={() => {
              setSaveStatus(null);
              saveDraft.mutate();
            }}
          >
            {saveDraft.isPending ? "Saving…" : "Save Draft"}
          </button>
          <Link href="/matches" className="btn-muted">
            Back to Matches
          </Link>
        </div>
        {saveStatus && (
          <p className={`mt-2 text-xs ${saveDraft.isError ? "text-red-600" : "text-green-600"}`}>
            {saveStatus}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AgreementPage() {
  return (
    <Suspense fallback={<div className="glass rounded-3xl p-6">Loading…</div>}>
      <AgreementForm />
    </Suspense>
  );
}
