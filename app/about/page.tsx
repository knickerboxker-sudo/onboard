import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div>
      {/* Accent top rule */}
      <div style={{ height: "2px", backgroundColor: "var(--color-accent)" }} />

      {/* Hero */}
      <section style={{ paddingTop: "80px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px" }}>
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 transition-colors"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
            color: "var(--color-muted)",
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
        <span className="section-label">About</span>
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
          About Sortir
        </h1>
        <p
          className="mt-4"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            color: "var(--color-muted)",
          }}
        >
          Connecting local businesses for stronger partnerships
        </p>
      </section>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      {/* Content */}
      <section style={{ padding: "48px 24px" }}>
        <div className="max-w-2xl space-y-6">
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              lineHeight: "1.7",
              color: "var(--color-ink)",
            }}
          >
            Sortir is a business partnership discovery platform where businesses
            can browse and connect with partnership opportunities in their local
            area. We help small businesses and solo entrepreneurs form real
            partnerships to grow together.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              lineHeight: "1.7",
              color: "var(--color-muted)",
            }}
          >
            Our mission is to make it easy for local businesses to find
            complementary partners, structure fair deals, and build cooperative
            networks that help every small business on the block thrive.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              lineHeight: "1.7",
              color: "var(--color-muted)",
            }}
          >
            Currently launching in the Ann Arbor Area with city-by-city expansion
            planned across Michigan and beyond.
          </p>
          <div className="pt-4">
            <Link href="/join" className="btn-primary">
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
