"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";

interface Signup {
  id: string;
  business_name: string;
  business_type: string;
  city: string;
  created_at: string;
}

export default function RecentSignups({ city }: { city: string }) {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignups() {
      try {
        const res = await fetch(
          `/api/prelaunch/recent-signups/${encodeURIComponent(city)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSignups(data.signups || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchSignups();
  }, [city]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-neutral-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-neutral-200" />
              <div className="h-3 w-20 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (signups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center">
        <Store className="mx-auto h-8 w-8 text-neutral-400" />
        <p className="mt-2 text-sm text-neutral-500">
          Be the first business to join in {city}!
        </p>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    "Retail": "bg-blue-50 text-blue-700",
    "Food & Beverage": "bg-amber-50 text-amber-700",
    "Fitness": "bg-green-50 text-green-700",
    "Services": "bg-purple-50 text-purple-700",
    "Arts & Entertainment": "bg-pink-50 text-pink-700",
    "Pets": "bg-orange-50 text-orange-700",
  };

  return (
    <div className="space-y-2">
      {signups.map((signup) => {
        const colorClass =
          typeColors[signup.business_type] || "bg-neutral-100 text-neutral-700";
        const timeAgo = getTimeAgo(signup.created_at);

        return (
          <div
            key={signup.id}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 transition-all duration-200"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
              <Store className="h-5 w-5 text-neutral-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">
                {signup.business_name}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
                >
                  {signup.business_type}
                </span>
                <span className="text-xs text-neutral-400">{timeAgo}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
