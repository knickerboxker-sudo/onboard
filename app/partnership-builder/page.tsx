"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import { assessPartnershipEquity, fairnessCheck, negotiationStarter, type ContributionInput } from "@/lib/partnership";

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
  const [businessA, setBusinessA] = useState<ContributionInput>(initialContribution);
  const [businessB, setBusinessB] = useState<ContributionInput>({ ...initialContribution, followers: 3500, emailList: 1000, dailyFootTraffic: 100 });
  const [proposedSplitA, setProposedSplitA] = useState(50);
  const [messageDraft, setMessageDraft] = useState("");

  const assessment = useMemo(() => assessPartnershipEquity(businessA, businessB), [businessA, businessB]);
  const fairnessSummary = useMemo(() => fairnessCheck(proposedSplitA, assessment.businessAPercent), [assessment.businessAPercent, proposedSplitA]);

  const starterMessage = useMemo(
    () => negotiationStarter(assessment.businessAPercent, assessment.businessBPercent, assessment.scenario),
    [assessment.businessAPercent, assessment.businessBPercent, assessment.scenario],
  );

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
          <h3 className="text-lg font-semibold text-slate-900">Transparency & benchmarks</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">Consent-based metric sharing: follower count, monthly customers, campaign inventory.</li>
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">{assessment.benchmark}</li>
            <li className="rounded-xl border border-slate-200 bg-white px-3 py-2">{assessment.successPredictor}</li>
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
    </section>
  );
}
