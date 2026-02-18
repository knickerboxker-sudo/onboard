"use client";

import { useEffect, useState } from "react";
import { Store, MapPin } from "lucide-react";

interface NearbySignup {
  business_name: string;
  business_type: string;
  city: string;
}

interface NearbyCity {
  city: string;
  state: string;
  current_count: number;
  threshold: number;
  launched: boolean;
  distance_miles: number;
  recent_signups: NearbySignup[];
}

export default function NearbyCities({ city }: { city: string }) {
  const [cities, setCities] = useState<NearbyCity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNearbyCities() {
      try {
        const res = await fetch(
          `/api/prelaunch/nearby-cities/${encodeURIComponent(city)}`
        );
        if (res.ok) {
          const data = await res.json();
          setCities(data.nearby_cities ?? []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchNearbyCities();
  }, [city]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="h-4 w-40 rounded" style={{ backgroundColor: "var(--color-paper-dark)" }} />
            <div className="h-2 w-full" style={{ backgroundColor: "var(--color-paper-dark)" }} />
            <div className="h-3 w-24 rounded" style={{ backgroundColor: "var(--color-paper-dark)" }} />
          </div>
        ))}
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed py-8 text-center"
        style={{ borderColor: "var(--color-rule)" }}
      >
        <MapPin
          className="mx-auto h-8 w-8"
          style={{ color: "var(--color-muted)" }}
        />
        <p
          className="mt-2"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--color-muted)",
          }}
        >
          No nearby cities on the waitlist yet — spread the word!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cities.map((nc) => {
        const percentage = Math.min(
          Math.round((nc.current_count / nc.threshold) * 100),
          100
        );

        return (
          <div key={nc.city} className="space-y-3">
            {/* City progress bar — matches CityProgress style */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--color-ink)",
                  }}
                >
                  {nc.city}, {nc.state}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    color: "var(--color-muted)",
                  }}
                >
                  {nc.distance_miles.toFixed(1)} mi away
                </span>
              </div>
              {nc.launched ? (
                <div className="flex items-center gap-2">
                  <span className="badge-success">✓ Launched!</span>
                </div>
              ) : (
                <>
                  <div
                    className="h-2 w-full overflow-hidden"
                    style={{ backgroundColor: "var(--color-paper-dark)" }}
                  >
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: "var(--color-accent)",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      color: "var(--color-muted)",
                    }}
                  >
                    {nc.current_count}/{nc.threshold} businesses · {percentage}% to launch
                  </span>
                </>
              )}
            </div>

            {/* Business cards */}
            {nc.recent_signups.length > 0 && (
              <div className="space-y-1.5">
                {nc.recent_signups.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg px-3 py-2"
                    style={{ backgroundColor: "var(--color-paper-dark)" }}
                  >
                    <Store
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "var(--color-muted)" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "var(--color-ink)",
                        }}
                      >
                        {s.business_name}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          color: "var(--color-muted)",
                        }}
                      >
                        {s.business_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
