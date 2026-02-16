"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PartyPopper, ArrowRight } from "lucide-react";
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

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/prelaunch/signup-status/${code}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    if (code) fetchData();
  }, [code]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg animate-pulse space-y-6">
        <div className="h-8 w-64 rounded bg-neutral-200 mx-auto" />
        <div className="h-4 w-48 rounded bg-neutral-200 mx-auto" />
        <div className="rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-3/4 rounded bg-neutral-200" />
        </div>
      </div>
    );
  }

  // Fallback if data couldn't be loaded
  const city = data?.city || "Ann Arbor";
  const referralCount = data?.referral_count || 0;
  const position = data?.position || 0;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <PartyPopper className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          You&apos;re on the list!
        </h1>
        {position > 0 && (
          <p className="mt-2 text-lg text-neutral-500">
            You&apos;re #{position} in {city}
          </p>
        )}
      </div>

      {/* City progress */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">
          {city} Launch Progress
        </h2>
        <CityProgress city={city} />
      </div>

      {/* Referral stats */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">
          Earn rewards by referring businesses
        </h2>
        <ReferralStats
          referralCode={code}
          referralCount={referralCount}
          city={city}
        />
      </div>

      {/* What happens next */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">
          What happens next?
        </h2>
        <ol className="space-y-3 text-sm text-neutral-600">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-700">
              1
            </span>
            We&apos;ll email you with launch progress updates
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-700">
              2
            </span>
            Share your referral link to unlock rewards
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-700">
              3
            </span>
            When {city} hits its target, you&apos;ll get early access
          </li>
        </ol>
      </div>

      <Link
        href="/coming-soon"
        className="btn-secondary flex w-full items-center justify-center"
      >
        See launch progress
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
