import Link from "next/link";

const priorities = [
  "Business-owner authentication with email",
  "Structured onboarding and profile enrichment",
  "Local partner discovery with swipe interactions",
  "Mutual match creation and conversation readiness",
];

export default function Home() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="glass rounded-3xl p-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-sky-700">PartnerSwipe</p>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-slate-900">Local business matchmaking, built for practical partnerships.</h1>
        <p className="max-w-2xl text-slate-600">
          PartnerSwipe helps local businesses discover complementary operators nearby and build structured partnership pipelines for cross-promotion, bundles, and strategic collaboration.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn-primary" href="/auth">
            Create account
          </Link>
          <Link className="btn-muted" href="/swipe">
            Preview swipe stack
          </Link>
        </div>
      </div>
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Immediate implementation priorities</h2>
        <ul className="space-y-3 text-sm text-slate-600">
          {priorities.map((priority) => (
            <li className="rounded-xl border border-slate-100 bg-white px-4 py-3" key={priority}>
              {priority}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
