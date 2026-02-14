import Image from "next/image";

const businessTypes = [
  "Restaurant",
  "HVAC",
  "Landscaping",
  "Bakery",
  "Retail",
  "Automotive",
  "Construction",
  "Cleaning",
  "Salon",
  "Other",
];

const highlights = [
  "Businesses list for free",
  "$199/month investor access",
  "State-based discovery",
  "Introductions only, no transaction handling",
];

const implementationPhases = [
  {
    name: "Phase 1 - Core MVP",
    items: [
      "Project setup, PostgreSQL schema, Prisma ORM, and environment variable foundations",
      "JWT authentication, email verification, and password reset workflows",
      "Stripe subscriptions (monthly/annual), webhooks, and investor access controls",
      "Business profile creation, secure photo upload flow, and dashboard status visibility",
      "Investor profile onboarding, state selection, browsing filters, and business detail views",
      "Connection request lifecycle (investor and business), notifications, and request limits",
      "Transactional email templates, legal pages, admin dashboard basics, and analytics tracking",
      "Responsive UX polish, security hardening, testing strategy, deployment, and pre-launch checks",
    ],
  },
  {
    name: "Phase 2 - Enhancements",
    items: [
      "Advanced multi-filter discovery with URL persistence and sorting",
      "Business analytics dashboards with trends, insights, and exports",
      "Investor preference matching, recommendation scoring, and digests",
      "Admin moderation, verification workflows, and fraud/flag handling",
      "Saved businesses, notes/tags, success stories, and onboarding drip campaigns",
      "Platform-wide search, investor networking, and web push notifications",
    ],
  },
  {
    name: "Phase 3 - Advanced Features",
    items: [
      "In-app messaging with real-time updates, read states, and abuse controls",
      "Multi-state investor access and tiered Stripe subscription upgrades",
      "Business premium tiers, featured placement, and ROI comparisons",
      "Educational deal-structure resources and downloadable templates",
      "Advanced reporting (cohorts, funnels, A/B testing, predictive analytics)",
      "Partner API integrations, video profiles, secure document exchange, and deal pipelines",
      "International expansion, multi-currency support, localization, and regional compliance",
    ],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Local investment marketplace</p>
              <h1 className="text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Connect local investors with small businesses seeking growth capital
              </h1>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Businesses create profiles at no cost. Investors subscribe to discover opportunities by state and request direct introductions.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button className="min-h-11 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  List Your Business - Free
                </button>
                <button className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Find Opportunities - $199/mo
                </button>
              </div>
            </div>
            <Image
              src="/sortir-logo-512.png"
              alt="Onboard platform logo"
              width={176}
              height={176}
              priority
              className="mx-auto h-36 w-36 rounded-2xl border border-slate-200 bg-white p-3 sm:h-44 sm:w-44 lg:mx-0"
            />
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => (
            <article key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-800 shadow-sm">
              {item}
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold text-slate-950">How it works for businesses</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
              <li>1. Sign up and verify your account.</li>
              <li>2. Publish your business profile with funding goals and photos.</li>
              <li>3. Review investor requests and accept introductions when ready.</li>
            </ol>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold text-slate-950">How it works for investors</h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
              <li>1. Subscribe and set your preferred state.</li>
              <li>2. Browse business listings and apply filters.</li>
              <li>3. Request introductions and connect directly off-platform.</li>
            </ol>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-slate-950">Business categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {businessTypes.map((type) => (
              <span key={type} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                {type}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-semibold text-slate-950">BizConnect Implementation Guide</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Delivery is structured in three phases, starting with the core marketplace MVP and scaling into deeper analytics,
            automation, and platform expansion.
          </p>
          <div className="mt-5 space-y-4">
            {implementationPhases.map((phase) => (
              <article key={phase.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-800">{phase.name}</h3>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
                  {phase.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <footer className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900 sm:p-5">
          All information is self-reported and unverified. Investing in small businesses is high-risk. Conduct your own due diligence. We facilitate introductions only.
        </footer>
      </div>
    </main>
  );
}
