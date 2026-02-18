"use client";

import Link from "next/link";
import CityProgress from "../components/CityProgress";
import RecentSignups from "../components/RecentSignups";
import CityRequestForm from "../components/CityRequestForm";

export default function ComingSoonPage() {
  const city = process.env.NEXT_PUBLIC_LAUNCH_CITY ?? "Ann Arbor Area";

  const communities = [
    "Ann Arbor",
    "Ypsilanti",
    "Saline",
    "Milan",
    "Dexter",
    "Chelsea",
    "Whitmore Lake",
    "Pittsfield Twp.",
  ];

  return (
    <div>
      {/* Accent top rule */}
      <div style={{ height: "2px", backgroundColor: "var(--color-accent)" }} />

      {/* Hero */}
      <section
        style={{ paddingTop: "80px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px" }}
      >
        <span className="section-label">Pre-Launch</span>
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
          Sortir is launching in the{" "}
          <em>{city}</em>
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
          We&apos;re starting in Ann Arbor, Ypsilanti, Saline, Milan, Dexter, Chelsea,
          Whitmore Lake, and surrounding Washtenaw County communities. When enough local
          businesses join, we go live.
        </p>
      </section>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      {/* Progress + signups grid */}
      <section
        className="grid gap-0 lg:grid-cols-2"
        style={{ paddingLeft: "24px", paddingRight: "24px" }}
      >
        {/* Left: Progress + CTA + communities */}
        <div
          style={{ paddingTop: "48px", paddingBottom: "48px", paddingRight: "48px", borderRight: "1px solid var(--color-rule)" }}
        >
          {/* Progress card */}
          <div className="sortir-card">
            <span className="section-label">Launch progress</span>
            <h2
              className="mt-4 mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                color: "var(--color-ink)",
              }}
            >
              {city}
            </h2>
            <CityProgress city={city} />
            <p
              className="mt-5"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--color-muted)",
              }}
            >
              Launch happens when we hit the target number of businesses.
            </p>
          </div>

          <div className="mt-8">
            <Link href="/join" className="btn-primary">
              Join the Waitlist →
            </Link>
          </div>

          {/* Communities */}
          <div className="sortir-card mt-10">
            <span className="section-label">Communities</span>
            <div
              className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2"
            >
              {communities.map((name) => (
                <span
                  key={name}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    color: "var(--color-ink)",
                  }}
                >
                  {name}
                </span>
              ))}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  color: "var(--color-muted)",
                  fontStyle: "italic",
                }}
              >
                + surrounding areas
              </span>
            </div>
          </div>
        </div>

        {/* Right: Recent signups + city request */}
        <div style={{ paddingTop: "48px", paddingBottom: "48px", paddingLeft: "48px" }}>
          <div className="sortir-card">
            <span className="section-label">Recently joined</span>
            <h2
              className="mt-4 mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                color: "var(--color-ink)",
              }}
            >
              {city}
            </h2>
            <RecentSignups city={city} />
          </div>

          {/* Request your city */}
          <div
            className="mt-10"
            style={{
              borderTop: "1px solid var(--color-rule)",
              backgroundColor: "var(--color-paper-dark)",
              padding: "24px",
            }}
          >
            <span className="section-label">Request your city</span>
            <p
              className="mt-2 mb-4"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                lineHeight: "1.6",
                color: "var(--color-muted)",
              }}
            >
              Don&apos;t see your city? Request it below and we&apos;ll notify you when we&apos;re ready to launch there.
            </p>
            <CityRequestForm />
          </div>
        </div>
      </section>
    </div>
  );
}
