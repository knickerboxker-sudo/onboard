import type { Metadata } from "next";
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
    title: "It doesn't cost you anything",
    description:
      "Sortir is free — as in, genuinely free. No paywall, no pay-to-play tiers. When people in your network send clients your way, that's organic growth that doesn't come with an invoice.",
  },
  {
    title: "Freelancers make it tick",
    description:
      "Freelancers naturally float between clients and industries. On Sortir, that becomes a real advantage — for them and for the businesses they connect with.",
  },
  {
    title: "The point is real customers",
    description:
      "Partnerships are nice. New customers showing up because someone vouched for you? That's the goal. That's what Sortir is built for.",
  },
];

export const metadata: Metadata = {
  title: "About Sortir — Free customer referrals for small businesses",
  description:
    "Sortir connects freelancers and local businesses who refer clients to each other. Learn how it works and why it's always free.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://sortir.app"}/about`,
  },
};

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
            Most small businesses are invisible online — and they shouldn&rsquo;t have to pay to fix that.
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
            Sortir is built for a different approach. Freelancers and complementary local businesses connect and refer their clients to each other — creating a steady stream of new customers through relationships, not ad spend.
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
            Freelancers already know who needs what.
          </h2>
          <p
            className="mt-4"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Freelancers — photographers, designers, consultants, coaches — work with many different clients across many industries. They already know who needs what. When a freelance web designer finishes a site for a restaurant owner, they can refer that owner to a local marketing agency. That&apos;s a real customer for the agency — no campaign required.
          </p>
          <p
            className="mt-4"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Sortir organizes this natural behavior. Freelancers and complementary businesses connect, build trust, and refer clients to each other — creating a referral network that works without any ad spend.
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
            Ready to meet businesses that send you customers?
          </h2>
          <p
            className="mt-4 mb-8"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Join Sortir free and connect with freelancers and local businesses who will refer their clients straight to you. No credit card. No subscription. Always free.
          </p>
          <Link href="/auth" className="btn-primary">
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
