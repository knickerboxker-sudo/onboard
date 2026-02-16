"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FileText, GripVertical, Plus, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PARTNERSHIP_TEMPLATES } from "@/lib/matching";
import type { PartnershipType, AgreementClause } from "@/lib/types";

const PARTNERSHIP_TYPES: { value: PartnershipType; label: string }[] = [
  { value: "cross-promotion", label: "Cross Promotion" },
  { value: "product-bundle", label: "Product Bundle" },
  { value: "event-collab", label: "Event Collaboration" },
  { value: "wholesale", label: "Wholesale" },
  { value: "social-media-collab", label: "Social Media Collab" },
];

const STEPS = [
  { label: "Type & Template", icon: FileText },
  { label: "Clauses", icon: FileText },
  { label: "Terms", icon: FileText },
  { label: "Review & Sign", icon: Check },
];

function generateId() {
  return crypto.randomUUID();
}

function AgreementBuilder() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId") ?? "";
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState(0);
  const [partnershipType, setPartnershipType] = useState<PartnershipType>("cross-promotion");
  const [clauses, setClauses] = useState<AgreementClause[]>([]);
  const [splitA, setSplitA] = useState(50);
  const [splitB, setSplitB] = useState(50);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customTerms, setCustomTerms] = useState("");
  const [signatureA, setSignatureA] = useState("");
  const [signatureB, setSignatureB] = useState("");
  const [newClauseTitle, setNewClauseTitle] = useState("");
  const [newClauseContent, setNewClauseContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [title, setTitle] = useState("Partnership Agreement");
  const [partnerNameA, setPartnerNameA] = useState("Business A");
  const [partnerNameB, setPartnerNameB] = useState("Business B");

  const templates = PARTNERSHIP_TEMPLATES.filter((t) => t.type === partnershipType);

  function loadTemplate(templateId: string) {
    const template = PARTNERSHIP_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const templateClauses: AgreementClause[] = template.terms.map((term, i) => ({
      id: generateId(),
      title: `Term ${i + 1}`,
      content: term,
      isCustom: false,
    }));
    setClauses(templateClauses);
  }

  function addClause() {
    if (!newClauseTitle.trim() || !newClauseContent.trim()) return;
    setClauses((prev) => [
      ...prev,
      { id: generateId(), title: newClauseTitle.trim(), content: newClauseContent.trim(), isCustom: true },
    ]);
    setNewClauseTitle("");
    setNewClauseContent("");
  }

  function removeClause(id: string) {
    setClauses((prev) => prev.filter((c) => c.id !== id));
  }

  function moveClause(index: number, direction: "up" | "down") {
    const newClauses = [...clauses];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newClauses.length) return;
    [newClauses[index], newClauses[target]] = [newClauses[target], newClauses[index]];
    setClauses(newClauses);
  }

  function handleSplitA(val: number) {
    const clamped = Math.min(100, Math.max(0, val));
    setSplitA(clamped);
    setSplitB(100 - clamped);
  }

  async function saveDraft() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSaveStatus("Not authenticated"); return; }

      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();
      if (!biz) { setSaveStatus("No business found"); return; }

      const content = {
        clauses,
        revenueSplitA: splitA,
        revenueSplitB: splitB,
        startDate,
        endDate,
        customTerms,
        signatureA,
        signatureB,
      };

      const { error } = await supabase.from("partnership_agreements").insert({
        match_id: matchId || null,
        creator_business_id: biz.id,
        title,
        partnership_type: partnershipType,
        status: "draft",
        content,
      });

      if (error) throw new Error(error.message);
      setSaveStatus("Draft saved successfully!");
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : "Failed to save");
    }
  }

  function downloadAgreement() {
    const lines: string[] = [];
    lines.push("=".repeat(60));
    lines.push(title.toUpperCase());
    lines.push("=".repeat(60));
    lines.push("");
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push(`Type: ${PARTNERSHIP_TYPES.find((t) => t.value === partnershipType)?.label ?? partnershipType}`);
    lines.push("");
    lines.push("PARTIES");
    lines.push("-".repeat(40));
    lines.push(`Party A: ${partnerNameA}`);
    lines.push(`Party B: ${partnerNameB}`);
    lines.push("");
    lines.push("CLAUSES");
    lines.push("-".repeat(40));
    clauses.forEach((c, i) => {
      lines.push(`${i + 1}. ${c.title}`);
      lines.push(`   ${c.content}`);
      lines.push("");
    });
    lines.push("REVENUE SPLIT");
    lines.push("-".repeat(40));
    lines.push(`${partnerNameA}: ${splitA}%`);
    lines.push(`${partnerNameB}: ${splitB}%`);
    lines.push("");
    lines.push("DURATION");
    lines.push("-".repeat(40));
    lines.push(`Start: ${startDate || "TBD"}`);
    lines.push(`End: ${endDate || "TBD"}`);
    lines.push("");
    if (customTerms.trim()) {
      lines.push("ADDITIONAL TERMS");
      lines.push("-".repeat(40));
      lines.push(customTerms.trim());
      lines.push("");
    }
    lines.push("SIGNATURES");
    lines.push("-".repeat(40));
    lines.push(`${partnerNameA}: ${signatureA || "_______________"}`);
    lines.push(`${partnerNameB}: ${signatureB || "_______________"}`);
    lines.push("");
    lines.push("=".repeat(60));
    lines.push("DISCLAIMER: Template for discussion purposes only.");
    lines.push("Consult legal counsel before executing.");
    lines.push("=".repeat(60));

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sortir-agreement-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const splitValid = splitA + splitB === 100;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                i === step
                  ? "bg-sky-50 text-sky-700"
                  : i < step
                    ? "text-emerald-600"
                    : "text-slate-400"
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                i === step
                  ? "bg-sky-500 text-white"
                  : i < step
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Agreement Details</h2>
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="label">Agreement Title</label>
                        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Party A Name</label>
                        <input className="input" value={partnerNameA} onChange={(e) => setPartnerNameA(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Party B Name</label>
                        <input className="input" value={partnerNameB} onChange={(e) => setPartnerNameB(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Partnership Type</h2>
                    <select
                      className="input mt-3"
                      value={partnershipType}
                      onChange={(e) => {
                        setPartnershipType(e.target.value as PartnershipType);
                        setClauses([]);
                      }}
                    >
                      {PARTNERSHIP_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Load Template</h2>
                    <p className="mt-1 text-xs text-slate-500">Select a template to pre-fill clauses.</p>
                    <div className="mt-3 space-y-2">
                      {templates.length > 0 ? templates.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => loadTemplate(t.id)}
                          className="w-full rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-sky-300 hover:bg-sky-50"
                        >
                          <p className="text-sm font-medium text-slate-900">{t.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{t.description}</p>
                          <p className="mt-1 text-xs text-sky-600">Suggested split: {t.suggestedSplit}</p>
                        </button>
                      )) : (
                        <p className="text-sm text-slate-400">No templates for this type.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Agreement Clauses</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {clauses.length} clause{clauses.length !== 1 ? "s" : ""}. Reorder or remove as needed.
                    </p>
                    <div className="mt-4 space-y-2">
                      {clauses.map((clause, i) => (
                        <div key={clause.id} className="flex items-start gap-2 rounded-xl border border-slate-200 p-3">
                          <div className="flex flex-col gap-1 pt-1">
                            <button onClick={() => moveClause(i, "up")} disabled={i === 0} className="text-slate-400 hover:text-slate-600 disabled:opacity-30">
                              <GripVertical className="h-4 w-4" />
                            </button>
                            <button onClick={() => moveClause(i, "down")} disabled={i === clauses.length - 1} className="text-slate-400 hover:text-slate-600 disabled:opacity-30">
                              <GripVertical className="h-4 w-4 rotate-180" />
                            </button>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">{clause.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{clause.content}</p>
                            {clause.isCustom && <span className="mt-1 inline-block text-[10px] text-sky-600">Custom</span>}
                          </div>
                          <button onClick={() => removeClause(clause.id)} className="flex-shrink-0 rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {clauses.length === 0 && (
                        <p className="py-4 text-center text-sm text-slate-400">No clauses yet. Add your own or go back and load a template.</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Add Custom Clause</h2>
                    <div className="mt-3 space-y-3">
                      <input className="input" placeholder="Clause title" value={newClauseTitle} onChange={(e) => setNewClauseTitle(e.target.value)} />
                      <textarea className="input" rows={3} placeholder="Clause content..." value={newClauseContent} onChange={(e) => setNewClauseContent(e.target.value)} />
                      <button onClick={addClause} disabled={!newClauseTitle.trim() || !newClauseContent.trim()} className="btn-muted text-xs">
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add Clause
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Revenue Split</h2>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label">{partnerNameA} (%)</label>
                        <input type="number" className="input" min={0} max={100} value={splitA} onChange={(e) => handleSplitA(Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="label">{partnerNameB} (%)</label>
                        <input type="number" className="input" min={0} max={100} value={splitB} readOnly />
                      </div>
                    </div>
                    {!splitValid && <p className="mt-2 text-xs text-red-600">Must sum to 100%.</p>}
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${splitA}%` }} />
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Duration</h2>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label">Start Date</label>
                        <input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">End Date</label>
                        <input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Additional Terms</h2>
                    <textarea className="input mt-3" rows={4} placeholder="Any extra terms or notes..." value={customTerms} onChange={(e) => setCustomTerms(e.target.value)} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Digital Signatures</h2>
                    <p className="mt-1 text-xs text-slate-500">Type full names to acknowledge agreement terms.</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label">{partnerNameA}</label>
                        <input className="input" placeholder="Type full name" value={signatureA} onChange={(e) => setSignatureA(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">{partnerNameB}</label>
                        <input className="input" placeholder="Type full name" value={signatureB} onChange={(e) => setSignatureB(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      This is a template for discussion purposes. Consult legal counsel before executing.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button className="btn-primary" disabled={!splitValid} onClick={downloadAgreement}>
                        <FileText className="mr-2 h-4 w-4" /> Export Agreement
                      </button>
                      <button className="btn-muted" onClick={saveDraft}>Save Draft</button>
                    </div>
                    {saveStatus && (
                      <p className={`mt-2 text-xs ${saveStatus.includes("success") ? "text-emerald-600" : "text-red-600"}`}>
                        {saveStatus}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-muted text-xs disabled:opacity-50">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Previous
            </button>
            <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1} className="btn-primary text-xs disabled:opacity-50">
              Next <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Live Preview</h3>
            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="border-b border-slate-100 pb-2">
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="text-slate-400">{PARTNERSHIP_TYPES.find((t) => t.value === partnershipType)?.label}</p>
              </div>
              <div>
                <p className="font-medium text-slate-700">Parties</p>
                <p>{partnerNameA} & {partnerNameB}</p>
              </div>
              {clauses.length > 0 && (
                <div>
                  <p className="font-medium text-slate-700">Clauses ({clauses.length})</p>
                  <ul className="mt-1 list-disc pl-4 space-y-1">
                    {clauses.map((c) => (
                      <li key={c.id}>{c.title}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="font-medium text-slate-700">Revenue Split</p>
                <p>{partnerNameA}: {splitA}% / {partnerNameB}: {splitB}%</p>
              </div>
              {(startDate || endDate) && (
                <div>
                  <p className="font-medium text-slate-700">Duration</p>
                  <p>{startDate || "TBD"} — {endDate || "TBD"}</p>
                </div>
              )}
              {signatureA && (
                <div>
                  <p className="font-medium text-slate-700">Signatures</p>
                  <p className="italic">{signatureA}{signatureB ? `, ${signatureB}` : ""}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartnershipAgreementPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">Loading agreement builder…</div>}>
      <AgreementBuilder />
    </Suspense>
  );
}
