"use client";

import { use } from "react";
import CityProgress from "@/app/components/CityProgress";
import NearbyCities from "@/app/components/NearbyCities";
import RecentSignups from "@/app/components/RecentSignups";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function CityStatusPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = use(params);
  const cityName = decodeURIComponent(city);

  return (
    <div className="mx-auto max-w-2xl space-y-10 py-16 px-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" style={{ color: "var(--color-accent)" }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
            }}
          >
            City status
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            color: "var(--color-ink)",
          }}
        >
          {cityName}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "14px",
            color: "var(--color-muted)",
            lineHeight: "1.6",
          }}
        >
          This city unlocks when 50 local businesses join the waitlist.
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
          Launch progress
        </h2>
        <CityProgress city={cityName} />
      </div>

      {/* Recent signups */}
      <div className="space-y-3">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            color: "var(--color-ink)",
          }}
        >
          Recent businesses
        </h2>
        <RecentSignups city={cityName} />
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
        <NearbyCities city={cityName} />
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/auth"
          className="btn-primary"
        >
          Join the waitlist
        </Link>
      </div>
    </div>
  );
}
