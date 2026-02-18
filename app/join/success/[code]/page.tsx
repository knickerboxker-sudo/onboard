"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CityProgress from "../../../components/CityProgress";
import ReferralStats from "../../../components/ReferralStats";

interface SignupData {
  referral_code: string;
  business_name: string;
  city: string;
  state: string;
  referral_count: number;
  position: number;
}

export default function JoinSuccessPage() {
  const params = useParams();
  const code = params.code as string;
  const [data, setData] = useState<SignupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/prelaunch/signup-status/${code}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setFetchError(true);
        }
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }
    if (code) fetchData();
  }, [code]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg animate-pulse space-y-6">
        <div className="mx-auto h-8 w-64 rounded bg-neutral-200" />
        <div className="mx-auto h-4 w-48 rounded bg-neutral-200" />
        <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-3/4 rounded bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (fetchError && !data) {
    return (
      <div style={{ paddingTop: "80px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px", maxWidth: "600px" }}>
        <span className="section-label">You&apos;re In</span>
        <h1
          className="mt-5"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            lineHeight: "1.05",
            letterSpacing: "-0.02em",
            color: "var(--color-ink)",
          }}
        >
          You&apos;re on the list!
        </h1>
        <p
          className="mt-4"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            lineHeight: "1.6",
            color: "var(--color-muted)",
          }}
        >
          We couldn&apos;t load your signup details. Your spot is still saved!
        </p>
        <div className="mt-6">
          <Link href="/coming-soon" className="btn-primary">
            See launch progress
          </Link>
        </div>
      </div>
    );
  }

  // Fallback if data couldn't be loaded
  const city = data?.city || "Ann Arbor Area";
  const referralCount = data?.referral_count || 0;
  const position = data?.position || 0;

  return (
    <div>
      {/* Accent top rule */}
      <div style={{ height: "2px", backgroundColor: "var(--color-accent)" }} />

      {/* Hero */}
      <section style={{ paddingTop: "80px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px" }}>
        <span className="section-label">You&apos;re In</span>
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
          You&apos;re on the list!
        </h1>
        {position > 0 && (
          <p
            className="mt-4"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              color: "var(--color-muted)",
            }}
          >
            You&apos;re #{position} in {city}
          </p>
        )}
      </section>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      {/* Progress + referral grid */}
      <section
        className="grid gap-0 lg:grid-cols-2"
        style={{ paddingLeft: "24px", paddingRight: "24px" }}
      >
        {/* Left: City progress */}
        <div
          style={{
            paddingTop: "48px",
            paddingBottom: "48px",
            paddingRight: "48px",
            borderRight: "1px solid var(--color-rule)",
          }}
        >
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
          </div>

          {/* What happens next */}
          <div className="sortir-card mt-8">
            <span className="section-label">What happens next</span>
            <ol className="mt-4 space-y-4">
              {[
                "We'll email you with launch progress updates",
                "Share your referral link to unlock rewards",
                `When ${city} hits its target, you'll get early access`,
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--color-muted)",
                      flexShrink: 0,
                      paddingTop: "2px",
                    }}
                  >
                    0{i + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      color: "var(--color-ink)",
                    }}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: Referral stats */}
        <div style={{ paddingTop: "48px", paddingBottom: "48px", paddingLeft: "48px" }}>
          <div className="sortir-card">
            <span className="section-label">Earn rewards</span>
            <h2
              className="mt-4 mb-6"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                color: "var(--color-ink)",
              }}
            >
              Refer businesses to move up the list
            </h2>
            <ReferralStats
              referralCode={code}
              referralCount={referralCount}
              city={city}
            />
          </div>
        </div>
      </section>

      <hr style={{ border: "none", height: "1px", backgroundColor: "var(--color-rule)" }} />

      <section style={{ padding: "48px 24px" }}>
        <Link href="/coming-soon" className="btn-primary">
          See launch progress →
        </Link>
      </section>
    </div>
  );
}
