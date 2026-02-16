"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const businessTypes = [
  "Retail",
  "Food & Beverage",
  "Fitness",
  "Services",
  "Arts & Entertainment",
  "Health & Wellness",
  "Education",
  "Pets",
  "Technology",
  "Other",
];

const partnershipOptions = [
  "Cross-promotion",
  "Bundle deals",
  "Consignment",
  "Commission splits",
  "Event collaborations",
  "Social media partnerships",
];

const cities = [
  { name: "Ann Arbor", state: "MI" },
  { name: "Detroit", state: "MI" },
  { name: "Grand Rapids", state: "MI" },
];

export default function JoinPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    business_type: "",
    city: "",
    state: "",
    partnership_interests: [] as string[],
    referred_by: "",
  });

  const handleCityChange = (cityName: string) => {
    const city = cities.find((c) => c.name === cityName);
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      state: city?.state || "",
    }));
  };

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

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Join the Sortir Waitlist
        </h1>
        <p className="mt-2 text-neutral-500">
          Sign up to be part of your city&apos;s launch. No account needed yet.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="business_name" className="label">
            Business name
          </label>
          <input
            id="business_name"
            type="text"
            className="input"
            placeholder="Your business name"
            value={formData.business_name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, business_name: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@business.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <label htmlFor="business_type" className="label">
            Business type
          </label>
          <select
            id="business_type"
            className="input"
            value={formData.business_type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, business_type: e.target.value }))
            }
            required
          >
            <option value="">Select type...</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city" className="label">
            City
          </label>
          <select
            id="city"
            className="input"
            value={formData.city}
            onChange={(e) => handleCityChange(e.target.value)}
            required
          >
            <option value="">Select city...</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}, {city.state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">
            What kind of partnerships interest you?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {partnershipOptions.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-all ${
                  formData.partnership_interests.includes(option)
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.partnership_interests.includes(option)}
                  onChange={() => handleInterestToggle(option)}
                  className="sr-only"
                />
                <div
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                    formData.partnership_interests.includes(option)
                      ? "border-brand-500 bg-brand-500 text-white"
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
          className="btn-primary w-full py-3"
        >
          {submitting ? (
            "Joining..."
          ) : (
            <>
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-neutral-400">
          No credit card required. We&apos;ll only email you about launch updates.
        </p>
      </form>
    </div>
  );
}
