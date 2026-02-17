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
        <div className="h-4 w-48 rounded" style={{ backgroundColor: 'var(--color-paper-dark)' }} />
        <div className="h-2 w-full" style={{ backgroundColor: 'var(--color-paper-dark)' }} />
        <div className="h-3 w-32 rounded" style={{ backgroundColor: 'var(--color-paper-dark)' }} />
      </div>
    );
  }

  if (!status) {
    return (
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-muted)',
        }}
      >
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
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-ink)',
            }}
          >
            {city}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-paper-dark)' }}
        >
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: '100%', backgroundColor: 'var(--color-accent)' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-ink)',
          }}
        >
          {city}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--color-muted)',
          }}
        >
          {status.current_count}/{status.threshold} businesses
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-paper-dark)' }}
      >
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: 'var(--color-accent)' }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: 'var(--color-muted)',
          }}
        >
          {percentage}% to launch
        </span>
        {status.estimated_days && status.estimated_days > 0 && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              color: 'var(--color-muted)',
            }}
          >
            ~{status.estimated_days} days to launch
          </span>
        )}
      </div>
    </div>
  );
}
