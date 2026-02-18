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
    title: "Local First",
    description:
      "Every partnership keeps money circulating in your community. When a local gym partners with a local nutritionist, their customers win — and so does the neighborhood.",
  },
  {
    title: "Radically Free",
    description:
      "No ads. No paywalls. No pay-to-play. Sortir is free for every business, forever. Growth shouldn't require a marketing budget.",
  },
  {
    title: "Stronger Together",
    description:
      "Success on Sortir isn't zero-sum. When one business thrives through a partnership, so does their partner. Cooperation beats competition.",
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
            Small businesses are invisible — and it doesn&rsquo;t have to be that way.
          </h2>
          <p
            className="mt-4"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Most small businesses — especially those not running Google ads or TV campaigns — struggle to get discovered. Word of mouth only goes so far. Traditional advertising is expensive and imprecise. Social media is pay-to-play.
          </p>
          <p
            className="mt-4"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Sortir is the infrastructure for the next wave of small business growth: neighbor-to-neighbor alliances. A yoga studio partners with a juice bar. A freelance photographer teams up with a wedding venue. A hair brand gets shelf space in a local salon. Free advertising, real customers, zero ad spend.
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
            Your next partner is already out there.
          </h2>
          <p
            className="mt-4 mb-8"
            style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: "1.7", color: "var(--color-muted)" }}
          >
            Create your free business profile and start connecting with complementary businesses in your city. No credit card. No subscription. Always free.
          </p>
          <Link href="/auth" className="btn-primary">
            Create your free account
          </Link>
        </div>
      </section>
    </div>
  );
}
