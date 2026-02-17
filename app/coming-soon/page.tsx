"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import CityProgress from "../components/CityProgress";
import RecentSignups from "../components/RecentSignups";
import CityRequestForm from "../components/CityRequestForm";

export default function ComingSoonPage() {
  const city = "Ann Arbor Area";

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="text-center">
        <div className="badge-primary mx-auto mb-5">
          <MapPin className="h-3 w-3" />
          Pre-Launch
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
          Sortir is launching in the{" "}
          <span className="bg-gradient-to-r from-lavender-600 to-spearmint-500 bg-clip-text text-transparent">
            Ann Arbor Area
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-500">
          We&apos;re starting in Ann Arbor, Ypsilanti, Saline, Milan, Dexter, Chelsea, Whitmore Lake, and surrounding Washtenaw County communities. When enough local businesses join, we go live.
        </p>
      </section>

      {/* Progress + signups grid */}
      <section className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
        {/* Left: Progress + CTA */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-100 bg-white p-7 shadow-soft">
            <h2 className="mb-5 text-lg font-semibold text-neutral-900">
              {city} launch progress
            </h2>
            <CityProgress city={city} />
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

          {/* Ann Arbor Area communities */}
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-sm font-semibold text-neutral-900">
              Ann Arbor Area Communities
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-lavender-500" />
                Ann Arbor
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-lavender-500" />
                Ypsilanti
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-lavender-500" />
                Saline
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-lavender-500" />
                Milan
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-lavender-500" />
                Dexter
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-lavender-500" />
                Chelsea
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-lavender-500" />
                Whitmore Lake
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-lavender-500" />
                Pittsfield Twp.
              </div>
              <div className="col-span-2 text-center italic text-neutral-400">
                + surrounding areas
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent signups */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-100 bg-white p-7 shadow-soft">
            <h2 className="mb-5 text-lg font-semibold text-neutral-900">
              Recently joined in {city}
            </h2>
            <RecentSignups city={city} />
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
