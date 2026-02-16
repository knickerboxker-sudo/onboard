"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PartnershipType, CollaborationIntent } from "@/lib/types";
import AddressAutocomplete from "@/app/components/AddressAutocomplete";
import ImageUpload from "@/app/components/ImageUpload";

const partnershipOptions: PartnershipType[] = ["cross-promotion", "product-bundle", "event-collab", "wholesale", "social-media-collab"];
const collaborationIntentOptions: { value: CollaborationIntent; label: string }[] = [
  { value: "sell", label: "Sell my products through a partner" },
  { value: "promote", label: "Cross-promote with another business" },
  { value: "supply", label: "Supply products or services" },
  { value: "co-brand", label: "Co-brand a product or experience" },
  { value: "refer", label: "Refer customers to each other" },
];

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState("");
  const [partnerships, setPartnerships] = useState<string[]>([]);
  const [collaborationIntents, setCollaborationIntents] = useState<string[]>([]);
  const [hours, setHours] = useState("");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [followerCount, setFollowerCount] = useState("");
  const [emailListSize, setEmailListSize] = useState("");
  const [monthlyFootTraffic, setMonthlyFootTraffic] = useState("");
  const [targetAgeMin, setTargetAgeMin] = useState("");
  const [targetAgeMax, setTargetAgeMax] = useState("");
  const [targetIncomeBracket, setTargetIncomeBracket] = useState("");
  const [customerInterests, setCustomerInterests] = useState("");
  const [yearsInOperation, setYearsInOperation] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const populateForm = useCallback((data: Record<string, unknown> | null) => {
    if (!data) return;
    setBusinessName((data.name as string) ?? "");
    setBusinessType((data.business_type as string) ?? "");
    setAddress((data.address as string) ?? "");
    setLat(data.lat != null ? String(data.lat) : "");
    setLng(data.lng != null ? String(data.lng) : "");
    setDescription((data.description as string) ?? "");
    setProducts(((data.products as string[]) ?? []).join(", "));
    setPartnerships((data.partnership_types as string[]) ?? []);
    setCollaborationIntents((data.collaboration_intents as string[]) ?? []);
    setHours((data.operating_hours as string) ?? "");
    setWebsite((data.website as string) ?? "");
    setSocialLinks(((data.social_links as string[]) ?? []).join(", "));
    setPhotos((data.photos as string[]) ?? []);
    setFollowerCount(data.follower_count != null ? String(data.follower_count) : "");
    setEmailListSize(data.email_list_size != null ? String(data.email_list_size) : "");
    setMonthlyFootTraffic(data.monthly_foot_traffic != null ? String(data.monthly_foot_traffic) : "");
    setTargetAgeMin(data.target_age_min != null ? String(data.target_age_min) : "");
    setTargetAgeMax(data.target_age_max != null ? String(data.target_age_max) : "");
    setTargetIncomeBracket((data.target_income_bracket as string) ?? "");
    setCustomerInterests(((data.customer_interests as string[]) ?? []).join(", "));
    setYearsInOperation(data.years_in_operation != null ? String(data.years_in_operation) : "");
  }, []);

  const { isLoading, error } = useQuery({
    queryKey: ["settings-profile"],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Please sign in to view settings.");

      const { data, error: fetchError } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();
      if (fetchError) throw new Error(fetchError.message);
      if (!initialized.current && data) {
        populateForm(data);
        initialized.current = true;
      }
      return data;
    },
    refetchOnWindowFocus: false,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Please sign in before saving.");

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
        collaboration_intents: collaborationIntents,
        photos,
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

      const { error: upsertError } = await supabase.from("businesses").upsert(payload, { onConflict: "owner_id" });
      if (upsertError) throw new Error(upsertError.message);
    },
    onSuccess: () => {
      setSuccessMessage("Changes saved successfully.");
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ["settings-profile"] });
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
      setSuccessMessage(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="glass rounded-3xl p-8 text-center text-slate-500">Loading profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="glass rounded-3xl p-8">
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <form className="glass rounded-3xl p-8" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Edit your business profile below.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Business name</label>
            <input className="input" onChange={(e) => setBusinessName(e.target.value)} required value={businessName} />
          </div>
          <div>
            <label className="label">Industry / category</label>
            <input className="input" onChange={(e) => setBusinessType(e.target.value)} required value={businessType} />
          </div>
          <div>
            <label className="label">Address</label>
            <AddressAutocomplete
              onSelect={({ address: addr, lat: latitude, lng: longitude }) => {
                setAddress(addr);
                setLat(String(latitude));
                setLng(String(longitude));
              }}
              onChange={(val) => setAddress(val)}
              required
              value={address}
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Short business bio</label>
            <textarea className="input min-h-[120px]" onChange={(e) => setDescription(e.target.value)} value={description} />
          </div>
          <div>
            <label className="label">Products/services offered (comma separated)</label>
            <textarea className="input min-h-[120px]" onChange={(e) => setProducts(e.target.value)} value={products} />
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
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPartnerships((prev) => [...prev, option]);
                        } else {
                          setPartnerships((prev) => prev.filter((item) => item !== option));
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
          <fieldset>
            <legend className="label">How do you want to collaborate?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {collaborationIntentOptions.map((option) => {
                const checked = collaborationIntents.includes(option.value);
                return (
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700" key={option.value}>
                    <input
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCollaborationIntents((prev) => [...prev, option.value]);
                        } else {
                          setCollaborationIntents((prev) => prev.filter((item) => item !== option.value));
                        }
                      }}
                      type="checkbox"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-6 space-y-6">
          <fieldset>
            <legend className="label">Social proof</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Follower count</label>
                <input className="input" inputMode="numeric" onChange={(e) => setFollowerCount(e.target.value)} placeholder="e.g. 5000" value={followerCount} />
              </div>
              <div>
                <label className="label">Email list size</label>
                <input className="input" inputMode="numeric" onChange={(e) => setEmailListSize(e.target.value)} placeholder="e.g. 2000" value={emailListSize} />
              </div>
              <div>
                <label className="label">Monthly foot traffic</label>
                <input className="input" inputMode="numeric" onChange={(e) => setMonthlyFootTraffic(e.target.value)} placeholder="e.g. 10000" value={monthlyFootTraffic} />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">Customer demographics</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Target age (min)</label>
                <input className="input" inputMode="numeric" onChange={(e) => setTargetAgeMin(e.target.value)} placeholder="e.g. 18" value={targetAgeMin} />
              </div>
              <div>
                <label className="label">Target age (max)</label>
                <input className="input" inputMode="numeric" onChange={(e) => setTargetAgeMax(e.target.value)} placeholder="e.g. 45" value={targetAgeMax} />
              </div>
              <div>
                <label className="label">Income bracket</label>
                <select className="input" onChange={(e) => setTargetIncomeBracket(e.target.value)} value={targetIncomeBracket}>
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
                <input className="input" onChange={(e) => setCustomerInterests(e.target.value)} value={customerInterests} />
              </div>
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Years in operation</label>
              <input className="input" inputMode="numeric" onChange={(e) => setYearsInOperation(e.target.value)} value={yearsInOperation} />
            </div>
            <div>
              <label className="label">Operating hours</label>
              <input className="input" onChange={(e) => setHours(e.target.value)} value={hours} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input" onChange={(e) => setWebsite(e.target.value)} placeholder="https://" value={website} />
            </div>
            <div>
              <label className="label">Social links (comma separated)</label>
              <input className="input" onChange={(e) => setSocialLinks(e.target.value)} value={socialLinks} />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload photos={photos} onChange={setPhotos} />
            </div>
          </div>
        </div>

        {successMessage && <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>}
        {errorMessage && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}

        <div className="mt-6 flex justify-end">
          <button className="btn-primary" disabled={saveMutation.isPending} type="submit">
            {saveMutation.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
