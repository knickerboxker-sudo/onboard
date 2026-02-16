"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PartnershipType } from "@/lib/types";

const partnershipOptions: PartnershipType[] = ["cross-promotion", "product-bundle", "event-collab", "wholesale", "social-media-collab"];

export default function OnboardingPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState("");
  const [partnerships, setPartnerships] = useState<string[]>([]);
  const [hours, setHours] = useState("");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [photos, setPhotos] = useState("");

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      setErrorMessage("Please sign in before saving your onboarding profile.");
      return;
    }

    const payload = {
      owner_id: user.id,
      name: businessName,
      business_type: businessType,
      address,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      description,
      products: products
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      partnership_types: partnerships,
      photos: photos
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      operating_hours: hours,
      website,
      social_links: socialLinks
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const { error } = await supabase.from("businesses").upsert(payload, { onConflict: "owner_id" });
    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/swipe");
  };

  const nextStep = () => setStep((value) => Math.min(value + 1, 4));
  const previousStep = () => setStep((value) => Math.max(value - 1, 1));

  return (
    <div className="mx-auto max-w-3xl">
      <form className="glass rounded-3xl p-8" onSubmit={submitProfile}>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-700">Onboarding step {step} of 4</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Build your business partnership profile</h1>

        {step === 1 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Business name</label>
              <input className="input" onChange={(event) => setBusinessName(event.target.value)} required value={businessName} />
            </div>
            <div>
              <label className="label">Industry / category</label>
              <input className="input" onChange={(event) => setBusinessType(event.target.value)} required value={businessType} />
            </div>
            <div>
              <label className="label">Address (Google Maps autocomplete ready)</label>
              <input className="input" onChange={(event) => setAddress(event.target.value)} required value={address} />
            </div>
            <div>
              <label className="label" htmlFor="business-latitude">Latitude</label>
              <input className="input" id="business-latitude" inputMode="decimal" onChange={(event) => setLat(event.target.value)} value={lat} />
            </div>
            <div>
              <label className="label" htmlFor="business-longitude">Longitude</label>
              <input className="input" id="business-longitude" inputMode="decimal" onChange={(event) => setLng(event.target.value)} value={lng} />
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Short business bio</label>
              <textarea className="input min-h-[120px]" onChange={(event) => setDescription(event.target.value)} value={description} />
            </div>
            <div>
              <label className="label">Products/services offered (comma separated)</label>
              <textarea className="input min-h-[120px]" onChange={(event) => setProducts(event.target.value)} value={products} />
            </div>
            <fieldset>
              <legend className="label">Partnership types you are seeking</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {partnershipOptions.map((option) => {
                  const checked = partnerships.includes(option);
                  return (
                    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" key={option}>
                      <input
                        checked={checked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setPartnerships((previous) => [...previous, option]);
                          } else {
                            setPartnerships((previous) => previous.filter((item) => item !== option));
                          }
                        }}
                        type="checkbox"
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Operating hours</label>
              <input className="input" onChange={(event) => setHours(event.target.value)} value={hours} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" onChange={(event) => setWebsite(event.target.value)} placeholder="https://" value={website} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Social links (comma separated)</label>
              <input className="input" onChange={(event) => setSocialLinks(event.target.value)} value={socialLinks} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Photo URLs (comma separated)</label>
              <input className="input" onChange={(event) => setPhotos(event.target.value)} value={photos} />
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Review</p>
            <p className="mt-2">
              {businessName} · {businessType}
            </p>
            <p className="mt-1">{address}</p>
            <p className="mt-2 text-slate-600">{description || "No description provided."}</p>
          </div>
        ) : null}

        {errorMessage ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}

        <div className="mt-6 flex items-center justify-between">
          <button className="btn-muted" disabled={step === 1} onClick={previousStep} type="button">
            Back
          </button>
          {step < 4 ? (
            <button className="btn-primary" onClick={nextStep} type="button">
              Continue
            </button>
          ) : (
            <button className="btn-primary" disabled={saving} type="submit">
              {saving ? "Saving profile..." : "Finish onboarding"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
