import Link from "next/link";
import { successStories } from "@/lib/success-stories";

export const metadata = {
  title: "Success Stories | Sortir",
  description:
    "Partnership success stories from small businesses using Sortir to grow together.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://sortir.app"}/success-stories`,
  },
};

export default function SuccessStoriesPage() {
  return (
    <div>
      {/* Accent top rule */}
      <div style={{ height: "2px", backgroundColor: "var(--color-accent)" }} />

      {/* Hero */}
      <section style={{ paddingTop: "80px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px" }}>
        <span className="section-label">Partnership Results</span>
        <h1
          className="mt-5"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            lineHeight: "1.05",
            letterSpacing: "-0.02em",
            color: "var(--color-ink)",
          }}
        >
          Success Stories
        </h1>
        <p
          className="mt-6 max-w-2xl"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            lineHeight: "1.6",
            color: "var(--color-muted)",
          }}
        >
          We&apos;re just getting started! Once Sortir launches and businesses
          begin partnering, their stories will be featured here.
        </p>
      </section>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      {/* Stories Grid — shown only when real stories exist */}
      {successStories.length > 0 && (
        <section style={{ padding: "48px 24px" }}>
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {successStories.map((story, i) => (
              <article
                key={story.id}
                className="py-8 pr-8"
                style={{ borderTop: "1px solid var(--color-rule)", transitionDelay: `${i * 60}ms` }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    color: "var(--color-muted)",
                  }}
                >
                  {story.partnershipType}
                </span>
                <h2
                  className="mt-3"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "18px",
                    color: "var(--color-ink)",
                  }}
                >
                  {story.businessA} &amp; {story.businessB}
                </h2>
                <p
                  className="mt-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "22px",
                    color: "var(--color-accent)",
                    fontStyle: "italic",
                  }}
                >
                  {story.keyMetric}
                </p>
                <blockquote
                  className="mt-3"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: "var(--color-muted)",
                  }}
                >
                  &ldquo;{story.testimonialQuote}&rdquo;
                </blockquote>
                <p
                  className="mt-3"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--color-muted)",
                  }}
                >
                  Results in {story.timeframe}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      {/* CTA */}
      <section
        className="relative -mx-4 sm:-mx-6"
        style={{ backgroundColor: "var(--color-accent)", padding: "80px 64px" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontStyle: "italic",
                color: "var(--color-paper)",
                lineHeight: "1.1",
              }}
            >
              Be One of Our First Success Stories
            </h2>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6">
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "rgba(245,242,235,0.8)",
              }}
            >
              Join the waitlist and be among the first businesses to partner through
              Sortir when we launch.
            </p>
            <div>
              <Link href="/auth" className="btn-cta-outline">
                Create your free account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
