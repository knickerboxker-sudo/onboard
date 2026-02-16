"use client";

import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { assessPartnershipEquity, fairnessCheck, negotiationStarter, type ContributionInput } from "@/lib/partnership";
import { calculatePartnershipROI, PARTNERSHIP_TEMPLATES, getTemplatesForType, type ROIInput } from "@/lib/matching";
import { createClient } from "@/lib/supabase/client";
import type { PartnershipType } from "@/lib/types";

const initialContribution: ContributionInput = {
  followers: 5000,
  emailList: 1500,
  dailyFootTraffic: 150,
  distributionChannelStrength: 5,
  productWholesaleValue: 400,
  marketingEffort: 4,
  exclusiveCategoryPartner: false,
  durationMonths: 3,
};

const PARTNERSHIP_TYPE_OPTIONS: { value: PartnershipType; label: string }[] = [
  { value: "cross-promotion", label: "Cross-Promotion" },
  { value: "product-bundle", label: "Product Bundle" },
  { value: "event-collab", label: "Event Collaboration" },
  { value: "wholesale", label: "Wholesale" },
  { value: "social-media-collab", label: "Social Media Collaboration" },
];

const initialROI: ROIInput = {
  revenueGenerated: 0,
  customersAcquired: 0,
  timeInvestedHours: 0,
  marketingSpend: 0,
  partnershipDurationMonths: 1,
};

function ContributionForm({
  title,
  value,
  onChange,
}: {
  title: string;
  value: ContributionInput;
  onChange: (next: ContributionInput) => void;
}) {
  const updateNumber = (key: keyof ContributionInput) => (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, [key]: Number(event.target.value) });
  };

  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="label">
          Followers
          <input className="input mt-1" min={0} onChange={updateNumber("followers")} type="number" value={value.followers} />
        </label>
        <label className="label">
          Email list size
          <input className="input mt-1" min={0} onChange={updateNumber("emailList")} type="number" value={value.emailList} />
        </label>
        <label className="label">
          Daily foot traffic
          <input className="input mt-1" min={0} onChange={updateNumber("dailyFootTraffic")} type="number" value={value.dailyFootTraffic} />
        </label>
        <label className="label">
          Distribution channel strength (1-10)
          <input className="input mt-1" max={10} min={1} onChange={updateNumber("distributionChannelStrength")} type="number" value={value.distributionChannelStrength} />
        </label>
        <label className="label">
          Product/service wholesale value
          <input className="input mt-1" min={0} onChange={updateNumber("productWholesaleValue")} type="number" value={value.productWholesaleValue} />
        </label>
        <label className="label">
          Marketing effort score (1-10)
          <input className="input mt-1" max={10} min={1} onChange={updateNumber("marketingEffort")} type="number" value={value.marketingEffort} />
        </label>
        <label className="label">
          Duration (months)
          <input className="input mt-1" min={1} onChange={updateNumber("durationMonths")} type="number" value={value.durationMonths} />
        </label>
        <label className="label flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          <input checked={value.exclusiveCategoryPartner} onChange={(event) => onChange({ ...value, exclusiveCategoryPartner: event.target.checked })} type="checkbox" />
          Exclusive category partner
        </label>
      </div>
    </div>
  );
}

export default function PartnershipBuilderPage() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("matchId");

  const [businessA, setBusinessA] = useState<ContributionInput>(initialContribution);
  const [businessB, setBusinessB] = useState<ContributionInput>({ ...initialContribution, followers: 3500, emailList: 1000, dailyFootTraffic: 100 });
  const [proposedSplitA, setProposedSplitA] = useState(50);
  const [messageDraft, setMessageDraft] = useState("");

  // Save / share feedback
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [shareStatus, setShareStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // ROI calculator state
  const [roiInput, setRoiInput] = useState<ROIInput>(initialROI);
  const [roiResult, setRoiResult] = useState<ReturnType<typeof calculatePartnershipROI> | null>(null);

  // Partnership templates state
  const [selectedType, setSelectedType] = useState<PartnershipType>("cross-promotion");

  const assessment = useMemo(() => assessPartnershipEquity(businessA, businessB), [businessA, businessB]);
  const fairnessSummary = useMemo(() => fairnessCheck(proposedSplitA, assessment.businessAPercent), [assessment.businessAPercent, proposedSplitA]);

  const starterMessage = useMemo(
    () => negotiationStarter(assessment.businessAPercent, assessment.businessBPercent, assessment.scenario),
    [assessment.businessAPercent, assessment.businessBPercent, assessment.scenario],
  );

  const filteredTemplates = useMemo(() => getTemplatesForType(selectedType), [selectedType]);

  const handleSaveAssessment = useCallback(async () => {
    setSaveStatus("saving");
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { setSaveStatus("error"); return; }

      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .single();
      if (bizError || !business) { setSaveStatus("error"); return; }

      const { error } = await supabase.from("saved_assessments").insert({
        match_id: matchId ?? null,
        creator_business_id: business.id,
        business_a_percent: assessment.businessAPercent,
        business_b_percent: assessment.businessBPercent,
        scenario: assessment.scenario,
        proposed_split_a: proposedSplitA,
        notes: messageDraft || null,
      });
      setSaveStatus(error ? "error" : "saved");
    } catch {
      setSaveStatus("error");
    }
  }, [matchId, assessment, proposedSplitA, messageDraft]);

  const handleShareWithMatch = useCallback(async () => {
    if (!matchId) return;
    setShareStatus("sending");
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { setShareStatus("error"); return; }

      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .single();
      if (bizError || !business) { setShareStatus("error"); return; }

      const content = messageDraft || starterMessage;
      const { error } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_business_id: business.id,
        content,
      });
      setShareStatus(error ? "error" : "sent");
    } catch {
      setShareStatus("error");
    }
  }, [matchId, messageDraft, starterMessage]);

  const updateROIField = (key: keyof ROIInput) => (event: ChangeEvent<HTMLInputElement>) => {
    setRoiInput((prev) => ({ ...prev, [key]: Number(event.target.value) }));
  };

  return (
    <section className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Partnership Builder</h1>
        <p className="mt-2 text-sm text-slate-600">Assess each side&apos;s contribution, generate a fairness score, and negotiate terms using balanced templates.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ContributionForm onChange={setBusinessA} title="Business A contribution assessment" value={businessA} />
        <ContributionForm onChange={setBusinessB} title="Business B contribution assessment" value={businessB} />
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-slate-900">Equity score calculation</h2>
        <p className="mt-3 text-sm text-slate-700">
          Business A contributes <span className="font-semibold">{assessment.businessAPercent}%</span> of total value, Business B contributes <span className="font-semibold">{assessment.businessBPercent}%</span>.
        </p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-slate-900" style={{ width: `${assessment.businessAPercent}%` }} />
        </div>
        {assessment.redFlag ? <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">Red flag: one side may be heavily undervalued. Add compensation terms or rebalance split.</p> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-primary" disabled={saveStatus === "saving"} onClick={handleSaveAssessment} type="button">
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved ✓" : "Save Assessment"}
          </button>
          {matchId ? (
            <button className="btn-muted" disabled={shareStatus === "sending"} onClick={handleShareWithMatch} type="button">
              {shareStatus === "sending" ? "Sending…" : shareStatus === "sent" ? "Sent ✓" : "Share with Match"}
            </button>
          ) : null}
        </div>
        {saveStatus === "error" ? <p className="mt-2 text-sm text-red-600">Failed to save assessment. Please sign in and try again.</p> : null}
        {shareStatus === "error" ? <p className="mt-2 text-sm text-red-600">Failed to share with match. Please try again.</p> : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-slate-900">Suggested structure templates</h3>
          <p className="mt-1 text-sm text-slate-500">Scenario: {assessment.scenario}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {assessment.suggestedStructures.map((item) => (
              <li className="rounded-xl border border-slate-200 bg-white px-3 py-2" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-slate-900">Negotiation helper</h3>
          <label className="label mt-3">
            Proposed split for Business A (%)
            <input className="input mt-1" max={95} min={5} onChange={(event) => setProposedSplitA(Number(event.target.value))} type="number" value={proposedSplitA} />
          </label>
          <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">{fairnessSummary}</p>
          <label className="label mt-3" htmlFor="message-template">
            Messaging template
            <textarea className="input mt-1 min-h-[110px]" id="message-template" onChange={(event) => setMessageDraft(event.target.value)} placeholder={starterMessage} value={messageDraft} />
          </label>
          <p className="mt-2 text-xs text-slate-500">Template starter: {starterMessage}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-slate-900">Transparency &amp; benchmarks</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">Consent-based metric sharing: follower count, monthly customers, campaign inventory.</li>
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">{assessment.benchmark}</li>
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">{assessment.successPredictor}</li>
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">Example benchmark: similar coffee shop partnerships commonly average 60/40 splits when one side provides location and foot traffic while the other provides product.</li>
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">General trend: cross-promotion partnerships with balanced effort tend to outperform uneven arrangements, based on platform partnership data.</li>
          </ul>
        </div>
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-slate-900">How to value your business</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">If you provide reach but not product, expect payment terms or stronger revenue share.</li>
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">If you provide product and inventory risk, secure placement guarantees and minimum promotion output.</li>
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">Use a short trial period to validate conversion before long-term exclusivity commitments.</li>
          </ul>
        </div>
      </div>

      {/* ROI Calculator */}
      <div className="glass rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-slate-900">ROI Calculator</h2>
        <p className="mt-1 text-sm text-slate-500">Estimate the return on investment for your partnership.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="label">
            Revenue generated ($)
            <input className="input mt-1" min={0} onChange={updateROIField("revenueGenerated")} type="number" value={roiInput.revenueGenerated} />
          </label>
          <label className="label">
            Customers acquired
            <input className="input mt-1" min={0} onChange={updateROIField("customersAcquired")} type="number" value={roiInput.customersAcquired} />
          </label>
          <label className="label">
            Time invested (hours)
            <input className="input mt-1" min={0} onChange={updateROIField("timeInvestedHours")} type="number" value={roiInput.timeInvestedHours} />
          </label>
          <label className="label">
            Marketing spend ($)
            <input className="input mt-1" min={0} onChange={updateROIField("marketingSpend")} type="number" value={roiInput.marketingSpend} />
          </label>
          <label className="label">
            Partnership duration (months)
            <input className="input mt-1" min={1} onChange={updateROIField("partnershipDurationMonths")} type="number" value={roiInput.partnershipDurationMonths} />
          </label>
        </div>
        <button className="btn-primary mt-4" onClick={() => setRoiResult(calculatePartnershipROI(roiInput))} type="button">
          Calculate ROI
        </button>
        {roiResult ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Total Revenue</span>
              <p className="font-semibold text-slate-900">${roiResult.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Total Cost</span>
              <p className="font-semibold text-slate-900">${roiResult.totalCost.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Net Profit</span>
              <p className="font-semibold text-slate-900">${roiResult.netProfit.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">ROI</span>
              <p className="font-semibold text-slate-900">{roiResult.roi}%</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Revenue / Month</span>
              <p className="font-semibold text-slate-900">${roiResult.revenuePerMonth.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <span className="text-slate-500">Cost / Customer</span>
              <p className="font-semibold text-slate-900">${roiResult.costPerCustomer.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm sm:col-span-2">
              <span className="text-slate-500">Verdict</span>
              <p className="font-semibold text-slate-900">{roiResult.verdict}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Partnership Templates */}
      <div className="glass rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-slate-900">Partnership Templates</h2>
        <p className="mt-1 text-sm text-slate-500">Browse structured templates for common partnership types.</p>
        <label className="label mt-4">
          Partnership type
          <select className="input mt-1" onChange={(event) => setSelectedType(event.target.value as PartnershipType)} value={selectedType}>
            {PARTNERSHIP_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <div className="mt-4 space-y-4">
          {filteredTemplates.map((template) => (
            <div className="rounded-xl border border-slate-200 bg-white p-4" key={template.id}>
              <h4 className="font-semibold text-slate-900">{template.name}</h4>
              <p className="mt-1 text-sm text-slate-600">{template.description}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {template.terms.map((term) => (
                  <li className="flex items-start gap-2" key={term}>
                    <span className="mt-0.5 text-slate-400">•</span>
                    {term}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-medium text-slate-800">Suggested split: {template.suggestedSplit}</p>
            </div>
          ))}
          {filteredTemplates.length === 0 ? <p className="text-sm text-slate-500">No templates available for this partnership type.</p> : null}
        </div>
      </div>
    </section>
  );
}
