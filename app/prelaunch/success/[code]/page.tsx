"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import CityProgress from "@/app/components/CityProgress";
import NearbyCities from "@/app/components/NearbyCities";
import Link from "next/link";
import { CheckCircle, Share2, Copy, Check } from "lucide-react";

interface SignupStatus {
  referral_code: string;
  business_name: string;
  city: string;
  state: string;
  referral_count: number;
  position: number;
}

export default function WaitlistSuccessPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const [status, setStatus] = useState<SignupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`/api/prelaunch/signup-status/${encodeURIComponent(code)}`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [code]);

  function copyReferralLink() {
    if (!status) return;
    const link = `${window.location.origin}/r/${status.referral_code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full" style={{ backgroundColor: "var(--color-paper-dark)" }} />
          <div className="mx-auto h-4 w-48 rounded" style={{ backgroundColor: "var(--color-paper-dark)" }} />
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="py-16 text-center">
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--color-muted)" }}>
          Signup not found.{" "}
          <Link href="/auth" style={{ color: "var(--color-accent)" }}>
            Return home
          </Link>
        </p>
      </div>
    );
  }

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/r/${status.referral_code}`
    : `/r/${status.referral_code}`;

  return (
    <div className="mx-auto max-w-2xl space-y-10 py-16 px-4">
      {/* Success header */}
      <div className="text-center space-y-4">
        <CheckCircle
          className="mx-auto h-16 w-16"
          style={{ color: "var(--color-accent)" }}
        />
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            color: "var(--color-ink)",
          }}
        >
          You&apos;re on the waitlist!
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            color: "var(--color-muted)",
            lineHeight: "1.6",
          }}
        >
          Welcome, <strong style={{ color: "var(--color-ink)" }}>{status.business_name}</strong>.
          You&apos;re #{status.position} in {status.city}.
        </p>
      </div>

      {/* Referral share */}
      <div
        className="rounded-xl p-6 space-y-4"
        style={{ backgroundColor: "var(--color-paper-dark)" }}
      >
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              color: "var(--color-ink)",
            }}
          >
            Speed up your city&apos;s launch
          </h2>
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--color-muted)",
          }}
        >
          Share your referral link — every business you bring in counts toward
          unlocking {status.city}.
        </p>
        <div className="flex gap-2">
          <div
            className="flex min-w-0 flex-1 items-center overflow-hidden rounded-lg border px-3 py-2"
            style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-paper)" }}
          >
            <span
              className="truncate"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--color-muted)",
              }}
            >
              {referralLink}
            </span>
          </div>
          <button
            onClick={copyReferralLink}
            className="flex-shrink-0 rounded-lg px-3 py-2 transition-colors"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-paper)",
            }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--color-muted)",
          }}
        >
          {status.referral_count} referral{status.referral_count !== 1 ? "s" : ""} so far
        </p>
      </div>

      {/* City launch progress */}
      <div className="space-y-3">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            color: "var(--color-ink)",
          }}
        >
          {status.city} launch progress
        </h2>
        <CityProgress city={status.city} />
      </div>

      {/* Nearby cities */}
      <div className="space-y-3">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            color: "var(--color-ink)",
          }}
        >
          Nearby cities
        </h2>
        <NearbyCities city={status.city} />
      </div>
    </div>
  );
}
