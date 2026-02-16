"use client";

import { useEffect, useState } from "react";

interface CityStatus {
  city: string;
  current_count: number;
  threshold: number;
  launched: boolean;
  percentage: number;
  estimated_days?: number;
}

export default function CityProgress({ city }: { city: string }) {
  const [status, setStatus] = useState<CityStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`/api/prelaunch/city-status/${encodeURIComponent(city)}`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch {
        // Silently fail for demo
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [city]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-48 rounded bg-neutral-200" />
        <div className="h-3 w-full rounded-full bg-neutral-200" />
        <div className="h-3 w-32 rounded bg-neutral-200" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="text-sm text-neutral-500">
        Unable to load progress for {city}.
      </div>
    );
  }

  const percentage = Math.min(
    Math.round((status.current_count / status.threshold) * 100),
    100
  );

  if (status.launched) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="badge-success">✓ Launched!</span>
          <span className="text-sm font-medium text-neutral-900">{city}</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-900">{city}</span>
        <span className="text-sm text-neutral-500">
          {status.current_count}/{status.threshold} businesses
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{percentage}% to launch</span>
        {status.estimated_days && status.estimated_days > 0 && (
          <span>~{status.estimated_days} days to launch</span>
        )}
      </div>
    </div>
  );
}
