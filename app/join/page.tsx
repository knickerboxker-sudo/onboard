"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, MapPin, Users, CheckCircle } from "lucide-react";
import { Suspense } from "react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const businessTypes = [
  "Retail","Food & Beverage","Fitness","Services","Arts & Entertainment",
  "Health & Wellness","Education","Pets","Technology","Other",
];

const partnershipOptions = [
  "Cross-promotion","Bundle deals","Consignment","Commission splits",
  "Event collaborations","Social media partnerships",
];

type CityStatus = {
  current_count: number;
  threshold: number;
  launched: boolean;
  percentage: number;
};

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cityStatus, setCityStatus] = useState<CityStatus | null>(null);
  const [cityStatusLoading, setCityStatusLoading] = useState(false);

  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    business_type: "",
    city: "",
    state: "",
    partnership_interests: [] as string[],
    referred_by: searchParams.get("ref") ?? "",
  });

  // Fetch city status when city changes (debounced)
  useEffect(() => {
    const cityTrimmed = formData.city.trim();
    if (cityTrimmed.length < 2) {
      setCityStatus(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCityStatusLoading(true);
      try {
        const res = await fetch(`/api/prelaunch/city-status/${encodeURIComponent(cityTrimmed)}`);
        if (res.ok) {
          const data: CityStatus = await res.json();
          setCityStatus(data);
        }
      } catch {
        // ignore
      } finally {
        setCityStatusLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData.city]);

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      partnership_interests: prev.partnership_interests.includes(interest)
        ? prev.partnership_interests.filter((i) => i !== interest)
        : [...prev.partnership_interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/prelaunch/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        if (data.referral_code) {
          router.push(`/join/success/${data.referral_code}`);
        }
        return;
      }

      router.push(`/join/success/${data.referral_code}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = cityStatus ? Math.max(0, cityStatus.threshold - cityStatus.current_count) : null;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Join Sortir in Your City
        </h1>
        <p className="mt-3 text-neutral-500">
          Sign up to reserve your spot. Your city unlocks for collaboration once 50 businesses join.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-neutral-100 bg-white p-7 shadow-soft sm:p-8"
      >
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="business_name" className="label">Business name</label>
          <input
            id="business_name"
            type="text"
            className="input"
            placeholder="Your business name"
            value={formData.business_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, business_name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@business.com"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="business_type" className="label">Business type</label>
          <select
            id="business_type"
            className="input"
            value={formData.business_type}
            onChange={(e) => setFormData((prev) => ({ ...prev, business_type: e.target.value }))}
            required
          >
            <option value="">Select type...</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div>
            <label htmlFor="city" className="label">City</label>
            <input
              id="city"
              type="text"
              className="input"
              placeholder="e.g. Ann Arbor"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="state" className="label">State</label>
            <select
              id="state"
              className="input"
              value={formData.state}
              onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
              required
            >
              <option value="">—</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* City launch status indicator */}
        {formData.city.trim().length >= 2 && (
          <div className={`rounded-xl border p-4 text-sm transition-all ${
            cityStatus?.launched
              ? "border-emerald-200 bg-emerald-50"
              : "border-sky-200 bg-sky-50"
          }`}>
            {cityStatusLoading ? (
              <p className="text-neutral-500 text-xs">Checking city status…</p>
            ) : cityStatus?.launched ? (
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-800">
                    {formData.city} is live! 🎉
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-700">
                    Your city has launched — you&apos;ll be able to discover and connect with local partners immediately.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sky-800">
                      {cityStatus
                        ? `${remaining} more business${remaining === 1 ? "" : "es"} needed to unlock ${formData.city}`
                        : `Be the first in ${formData.city}!`}
                    </p>
                    <p className="mt-0.5 text-xs text-sky-700">
                      While you wait, you can browse and connect with businesses in nearby launched cities within 50 miles.
                    </p>
                  </div>
                </div>
                {cityStatus && (
                  <div>
                    <div className="flex justify-between text-xs text-sky-700 mb-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {cityStatus.current_count} / {cityStatus.threshold} businesses
                      </span>
                      <span>{cityStatus.percentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-sky-200">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-500"
                        style={{ width: `${cityStatus.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="label">What kind of partnerships interest you?</label>
          <div className="grid grid-cols-2 gap-2">
            {partnershipOptions.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-all duration-200 ${
                  formData.partnership_interests.includes(option)
                    ? "border-lavender-400 bg-lavender-50 text-lavender-700 shadow-glow-sm"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.partnership_interests.includes(option)}
                  onChange={() => handleInterestToggle(option)}
                  className="sr-only"
                />
                <div
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                    formData.partnership_interests.includes(option)
                      ? "border-lavender-500 bg-lavender-500 text-white"
                      : "border-neutral-300"
                  }`}
                >
                  {formData.partnership_interests.includes(option) && (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                {option}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3.5 text-base shadow-lg hover:shadow-xl"
        >
          {submitting ? (
            "Joining..."
          ) : (
            <>
              Reserve My Spot
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-neutral-400">
          No credit card required. We&apos;ll email you when your city launches.
        </p>
      </form>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg" />}>
      <JoinPageContent />
    </Suspense>
  );
}
