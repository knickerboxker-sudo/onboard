import Link from "next/link";

const businessTypes = [
  { label: "Brick-and-Mortar", desc: "Storefronts, restaurants, retail shops, salons" },
  { label: "Online Sellers", desc: "E-commerce brands, digital products, subscriptions" },
  { label: "Freelancers & Creatives", desc: "Photographers, designers, writers, consultants" },
  { label: "Service Providers", desc: "Trades, attorneys, accountants, coaches" },
  { label: "Entrepreneurs", desc: "Early-stage founders building something new" },
];

const values = [
  {
    title: "Free Advertising",
    description:
      "Sortir is free advertising for every small business — no ad spend, no paywall, no pay-to-play. When your network refers clients to you, that's real advertising at zero cost.",
  },
  {
    title: "Freelancers Are the Engine",
    description:
      "Freelancers work with dozens of clients across industries. When they join Sortir, they naturally refer those clients to the businesses they're connected with — creating a constant stream of organic advertising.",
  },
  {
    title: "Revenue Is the Outcome",
    description:
      "The goal isn't partnerships for their own sake — it's new customers and more revenue. Every referral through Sortir puts money in your pocket without touching your marketing budget.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Accent top rule */}
      <div style={{ height: "2px", backgroundColor: "var(--color-accent)" }} />

      {/* Hero */}
      <section style={{ paddingTop: "80px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px" }}>
        <span className="section-label">About</span>
        <h1
          className="mt-5"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            lineHeight: "1.05",
            letterSpacing: "-0.02em",
            fontStyle: "italic",
            color: "var(--color-ink)",
          }}
        >
          Sortir — to get out.
        </h1>
        <p
          className="mt-6 max-w-2xl"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "18px",
            lineHeight: "1.7",
            color: "var(--color-muted)",
          }}
        >
          Sortir comes from the French word meaning &ldquo;to get out&rdquo; — out of obscurity, out of the ad spend trap, out of competing alone. It&rsquo;s the ethos behind everything we build.
        </p>
      </section>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      {/* The Problem */}
      <section className="px-6 sm:px-12" style={{ padding: "64px 24px" }}>
        <div className="max-w-2xl">
          <span className="section-label">The Problem</span>
          <h2
            className="mt-5"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              lineHeight: "1.1",
              color: "var(--color-ink)",
            }}
          >
            Free advertising is out of reach for most small businesses — and it doesn&rsquo;t have to be.
          </h2>
          <p
            className="mt-4"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Traditional advertising is expensive and imprecise. Google ads, TV spots, and social media are all pay-to-play — meaning small businesses without big marketing budgets are invisible while larger competitors dominate. Word of mouth only goes so far on its own.
          </p>
          <p
            className="mt-4"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Sortir is the infrastructure that makes free advertising real. Freelancers and complementary local businesses connect on Sortir and refer their clients to each other — creating a steady stream of organic advertising with zero ad spend. Real customers, real revenue, no budget required.
          </p>
        </div>
      </section>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      {/* Who We Serve */}
      <section style={{ padding: "64px 24px" }}>
        <div className="px-0 sm:px-6">
          <span className="section-label">Who Sortir Is For</span>
          <h2
            className="mt-5 mb-10"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              lineHeight: "1.1",
              color: "var(--color-ink)",
            }}
          >
            Every type of business. One platform.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {businessTypes.map((type, i) => (
              <div
                key={type.label}
                className="py-6 pr-6"
                style={{ borderTop: "1px solid var(--color-rule)", transitionDelay: `${i * 60}ms` }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "18px",
                    color: "var(--color-ink)",
                  }}
                >
                  {type.label}
                </h3>
                <p
                  className="mt-1"
                  style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--color-muted)", lineHeight: "1.6" }}
                >
                  {type.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      {/* Freelancers as the Engine */}
      <section className="px-6 sm:px-12" style={{ padding: "64px 24px" }}>
        <div className="max-w-2xl">
          <span className="section-label">How it works</span>
          <h2
            className="mt-5"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              lineHeight: "1.1",
              color: "var(--color-ink)",
            }}
          >
            Freelancers are the engine of free advertising.
          </h2>
          <p
            className="mt-4"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Freelancers — photographers, designers, consultants, coaches — work with many different clients across many industries. They already know who needs what. When a freelance web designer finishes a site for a restaurant owner, they can refer that owner to a local marketing agency. That referral is free advertising for the agency.
          </p>
          <p
            className="mt-4"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Sortir organizes this natural behavior. Freelancers and complementary businesses connect, build trust, and refer clients to each other — creating an organic advertising network that works without any ad spend.
          </p>
        </div>
      </section>

      {/* Values — dark accent section */}
      <section
        className="relative -mx-4 sm:-mx-6"
        style={{ backgroundColor: "var(--color-accent-2)", padding: "80px 48px" }}
      >
        <span className="section-label" style={{ color: "rgba(245,242,235,0.5)" }}>Our Values</span>
        <h2
          className="mt-5 mb-12"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            color: "var(--color-paper)",
          }}
        >
          What we stand for
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
          {values.map((v, i) => (
            <div
              key={v.title}
              className="py-8 sm:pr-10"
              style={{ borderTop: "1px solid rgba(245,242,235,0.2)", transitionDelay: `${i * 80}ms` }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "20px",
                  fontStyle: "italic",
                  color: "var(--color-paper)",
                }}
              >
                {v.title}
              </h3>
              <p
                className="mt-3"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  lineHeight: "1.7",
                  color: "rgba(245,242,235,0.7)",
                }}
              >
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px" }}>
        <div className="max-w-xl">
          <span className="section-label">Ready?</span>
          <h2
            className="mt-5"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontStyle: "italic",
              lineHeight: "1.1",
              color: "var(--color-ink)",
            }}
          >
            Start getting free advertising for your business today.
          </h2>
          <p
            className="mt-4 mb-8"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Join Sortir free and connect with freelancers and local businesses who will refer their clients straight to you. No credit card. No subscription. Always free.
          </p>
          <Link href="/auth" className="btn-primary">
            Get free advertising now
          </Link>
        </div>
      </section>
    </div>
  );
}
