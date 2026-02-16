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

  // Social proof
  const [followerCount, setFollowerCount] = useState("");
  const [emailListSize, setEmailListSize] = useState("");
  const [monthlyFootTraffic, setMonthlyFootTraffic] = useState("");

  // Customer demographics
  const [targetAgeMin, setTargetAgeMin] = useState("");
  const [targetAgeMax, setTargetAgeMax] = useState("");
  const [targetIncomeBracket, setTargetIncomeBracket] = useState("");
  const [customerInterests, setCustomerInterests] = useState("");

  // Years in operation
  const [yearsInOperation, setYearsInOperation] = useState("");

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
      follower_count: followerCount ? Number(followerCount) : null,
      email_list_size: emailListSize ? Number(emailListSize) : null,
      monthly_foot_traffic: monthlyFootTraffic ? Number(monthlyFootTraffic) : null,
      target_age_min: targetAgeMin ? Number(targetAgeMin) : null,
      target_age_max: targetAgeMax ? Number(targetAgeMax) : null,
      target_income_bracket: targetIncomeBracket || null,
      customer_interests: customerInterests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      years_in_operation: yearsInOperation ? Number(yearsInOperation) : null,
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
          <div className="mt-6 space-y-6">
            {/* Social proof */}
            <fieldset>
              <legend className="label">Social proof</legend>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Follower count</label>
                  <input className="input" inputMode="numeric" onChange={(event) => setFollowerCount(event.target.value)} placeholder="e.g. 5000" value={followerCount} />
                </div>
                <div>
                  <label className="label">Email list size</label>
                  <input className="input" inputMode="numeric" onChange={(event) => setEmailListSize(event.target.value)} placeholder="e.g. 2000" value={emailListSize} />
                </div>
                <div>
                  <label className="label">Monthly foot traffic</label>
                  <input className="input" inputMode="numeric" onChange={(event) => setMonthlyFootTraffic(event.target.value)} placeholder="e.g. 10000" value={monthlyFootTraffic} />
                </div>
              </div>
            </fieldset>

            {/* Customer demographics */}
            <fieldset>
              <legend className="label">Customer demographics</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Target age (min)</label>
                  <input className="input" inputMode="numeric" onChange={(event) => setTargetAgeMin(event.target.value)} placeholder="e.g. 18" value={targetAgeMin} />
                </div>
                <div>
                  <label className="label">Target age (max)</label>
                  <input className="input" inputMode="numeric" onChange={(event) => setTargetAgeMax(event.target.value)} placeholder="e.g. 45" value={targetAgeMax} />
                </div>
                <div>
                  <label className="label">Income bracket</label>
                  <select className="input" onChange={(event) => setTargetIncomeBracket(event.target.value)} value={targetIncomeBracket}>
                    <option value="">Select...</option>
                    <option value="under-25k">Under $25k</option>
                    <option value="25k-50k">$25k – $50k</option>
                    <option value="50k-75k">$50k – $75k</option>
                    <option value="75k-100k">$75k – $100k</option>
                    <option value="100k-150k">$100k – $150k</option>
                    <option value="150k+">$150k+</option>
                  </select>
                </div>
                <div>
                  <label className="label">Customer interests (comma separated)</label>
                  <input className="input" onChange={(event) => setCustomerInterests(event.target.value)} value={customerInterests} />
                </div>
              </div>
            </fieldset>

            {/* Operations */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Years in operation</label>
                <input className="input" inputMode="numeric" onChange={(event) => setYearsInOperation(event.target.value)} value={yearsInOperation} />
              </div>
              <div>
                <label className="label">Operating hours</label>
                <input className="input" onChange={(event) => setHours(event.target.value)} value={hours} />
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input" onChange={(event) => setWebsite(event.target.value)} placeholder="https://" value={website} />
              </div>
              <div>
                <label className="label">Social links (comma separated)</label>
                <input className="input" onChange={(event) => setSocialLinks(event.target.value)} value={socialLinks} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Photo URLs (comma separated)</label>
                <input className="input" onChange={(event) => setPhotos(event.target.value)} value={photos} />
              </div>
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
            {(followerCount || emailListSize || monthlyFootTraffic) && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="font-medium text-slate-900">Social proof</p>
                {followerCount && <p className="mt-1">Followers: {Number(followerCount).toLocaleString()}</p>}
                {emailListSize && <p className="mt-1">Email list: {Number(emailListSize).toLocaleString()}</p>}
                {monthlyFootTraffic && <p className="mt-1">Monthly foot traffic: {Number(monthlyFootTraffic).toLocaleString()}</p>}
              </div>
            )}
            {(targetAgeMin || targetAgeMax || targetIncomeBracket || customerInterests) && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="font-medium text-slate-900">Customer demographics</p>
                {(targetAgeMin || targetAgeMax) && (
                  <p className="mt-1">
                    Target age: {targetAgeMin || "—"} – {targetAgeMax || "—"}
                  </p>
                )}
                {targetIncomeBracket && <p className="mt-1">Income bracket: {targetIncomeBracket}</p>}
                {customerInterests && <p className="mt-1">Interests: {customerInterests}</p>}
              </div>
            )}
            {yearsInOperation && (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="mt-1">Years in operation: {yearsInOperation}</p>
              </div>
            )}
          </div>
        ) : null}

        {errorMessage ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}

        <div className="mt-6 flex items-center justify-between">
          <button className="btn-muted" disabled={step === 1} onClick={previousStep} type="button">
            Back
          </button>
          <div className="flex items-center gap-3">
            {step === 4 ? (
              <button className="btn-muted" onClick={() => router.push("/swipe")} type="button">
                Skip for now
              </button>
            ) : null}
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
        </div>
      </form>
    </div>
  );
}
