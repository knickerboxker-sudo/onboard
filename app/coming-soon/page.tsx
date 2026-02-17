"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import CityProgress from "../components/CityProgress";
import RecentSignups from "../components/RecentSignups";
import CityRequestForm from "../components/CityRequestForm";

const cities = ["Ann Arbor Area", "Detroit Area", "Grand Rapids Area"] as const;

export default function ComingSoonPage() {
  const [selectedCity, setSelectedCity] = useState<string>("Ann Arbor Area");

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="text-center">
        <div className="badge-primary mx-auto mb-5">
          <MapPin className="h-3 w-3" />
          Pre-Launch
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
          Sortir is coming to{" "}
          <span className="bg-gradient-to-r from-lavender-600 to-spearmint-500 bg-clip-text text-transparent">
            Michigan
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-500">
          We&apos;re launching city-by-city. When enough local businesses join,
          we go live. Be part of your city&apos;s launch.
        </p>
      </section>

      {/* City selector */}
      <section className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                selectedCity === city
                  ? "bg-neutral-900 text-white shadow-lg"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </section>

      {/* Progress + signups grid */}
      <section className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
        {/* Left: Progress + CTA */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-100 bg-white p-7 shadow-soft">
            <h2 className="mb-5 text-lg font-semibold text-neutral-900">
              {selectedCity} launch progress
            </h2>
            <CityProgress city={selectedCity} />
            <p className="mt-4 text-sm text-neutral-500">
              Launch happens when we hit the target number of businesses.
            </p>
          </div>

          <Link
            href="/join"
            className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-base shadow-lg hover:shadow-xl"
          >
            Join the Waitlist
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Michigan cities map placeholder */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-sm font-semibold text-neutral-900">
              Michigan Launch Cities
            </h3>
            <div className="space-y-1.5">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
                    selectedCity === city
                      ? "bg-lavender-50 text-lavender-700 font-medium shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {city}, MI
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent signups */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-100 bg-white p-7 shadow-soft">
            <h2 className="mb-5 text-lg font-semibold text-neutral-900">
              Recently joined in {selectedCity}
            </h2>
            <RecentSignups city={selectedCity} />
          </div>

          {/* Request your city */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-7 shadow-soft">
            <CityRequestForm />
          </div>
        </div>
      </section>
    </div>
  );
}
