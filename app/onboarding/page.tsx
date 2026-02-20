"use client";

export const dynamic = 'force-dynamic';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { PartnershipType, CollaborationIntent, BusinessCategory } from "@/lib/types";
import { PARTNERSHIP_INTEREST_TAGS } from "@/lib/types";
import AddressAutocomplete from "@/app/components/AddressAutocomplete";
import ImageUpload from "@/app/components/ImageUpload";

const STORAGE_KEY = "sortir-onboarding-draft";

const partnershipOptions: PartnershipType[] = ["cross-promotion", "product-bundle", "event-collab", "wholesale", "social-media-collab", "in-store-display", "referral-program", "consignment", "digital-placement"];
const collaborationIntentOptions: { value: CollaborationIntent; label: string }[] = [
  { value: "sell", label: "Sell my products through a partner" },
  { value: "promote", label: "Cross-promote with another business" },
  { value: "supply", label: "Supply products or services" },
  { value: "co-brand", label: "Co-brand a product or experience" },
  { value: "refer", label: "Refer customers to each other" },
  { value: "display", label: "Have my products displayed in a partner's location" },
  { value: "feature", label: "Be featured in a partner's newsletter or social channels" },
];

const stepLabels = ["Basics", "Offerings", "Details", "Review"];

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function StepProgressBar({ step }: { step: number }) {
  return (
    <div className="mt-4 flex items-center justify-between">
      {stepLabels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === step;
        const isComplete = stepNum < step;
        const circleStyle = isComplete
          ? { backgroundColor: 'var(--color-accent-2)', color: 'var(--color-paper)' }
          : isActive
            ? { backgroundColor: 'var(--color-ink)', color: 'var(--color-paper)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
            : { border: '1px solid var(--color-rule)', backgroundColor: 'var(--color-paper)', color: 'var(--color-muted)' };
        const labelStyle = isActive
          ? { color: 'var(--color-ink)' }
          : isComplete
            ? { color: 'var(--color-accent-2)' }
            : { color: 'var(--color-muted)' };
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all"
                style={circleStyle}
              >
                {isComplete ? "✓" : stepNum}
              </div>
              <span className="mt-1 text-[10px] font-medium" style={labelStyle}>
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className="mx-1 h-0.5 flex-1 rounded-full transition-all"
                style={{ backgroundColor: isComplete ? 'var(--color-accent-2)' : 'var(--color-rule)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl border border-neutral-200/60 bg-white/60 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <button type="button" onClick={onEdit} className="text-xs font-medium text-sky-600 hover:text-sky-800 transition-colors">
          Edit
        </button>
      </div>
      <div className="mt-2 text-sm text-neutral-700">{children}</div>
    </div>
  );
}

interface DraftState {
  businessName: string;
  businessType: string;
  businessCategory: string;
  address: string;
  lat: string;
  lng: string;
  city: string;
  state: string;
  description: string;
  products: string;
  partnerships: string[];
  collaborationIntents: string[];
  hours: string;
  website: string;
  socialLinks: string;
  photos: string[];
  followerCount: string;
  emailListSize: string;
  monthlyFootTraffic: string;
  targetAgeMin: string;
  targetAgeMax: string;
  targetIncomeBracket: string;
  customerInterests: string;
  yearsInOperation: string;
  lookingFor: string;
  canOffer: string;
  partnershipIdeas: string;
  partnershipInterestTags: string[];
  businessStory: string;
  step: number;
}

export default function OnboardingPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory | "">("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [remoteMode, setRemoteMode] = useState(false);
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState("");
  const [partnerships, setPartnerships] = useState<string[]>([]);
  const [collaborationIntents, setCollaborationIntents] = useState<string[]>([]);
  const [hours, setHours] = useState("");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

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

  // Enhanced profile fields
  const [lookingFor, setLookingFor] = useState("");
  const [canOffer, setCanOffer] = useState("");
  const [partnershipIdeas, setPartnershipIdeas] = useState("");
  const [partnershipInterestTags, setPartnershipInterestTags] = useState<string[]>([]);
  const [businessStory, setBusinessStory] = useState("");

  // --- localStorage auto-save: restore on mount ---
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const draft: DraftState = JSON.parse(raw);
        setBusinessName(draft.businessName ?? "");
        setBusinessType(draft.businessType ?? "");
        setBusinessCategory((draft.businessCategory as BusinessCategory) ?? "");
        setAddress(draft.address ?? "");
        setLat(draft.lat ?? "");
        setLng(draft.lng ?? "");
        setCity(draft.city ?? "");
        setState(draft.state ?? "");
        setDescription(draft.description ?? "");
        setProducts(draft.products ?? "");
        setPartnerships(draft.partnerships ?? []);
        setCollaborationIntents(draft.collaborationIntents ?? []);
        setHours(draft.hours ?? "");
        setWebsite(draft.website ?? "");
        setSocialLinks(draft.socialLinks ?? "");
        setPhotos(draft.photos ?? []);
        setFollowerCount(draft.followerCount ?? "");
        setEmailListSize(draft.emailListSize ?? "");
        setMonthlyFootTraffic(draft.monthlyFootTraffic ?? "");
        setTargetAgeMin(draft.targetAgeMin ?? "");
        setTargetAgeMax(draft.targetAgeMax ?? "");
        setTargetIncomeBracket(draft.targetIncomeBracket ?? "");
        setCustomerInterests(draft.customerInterests ?? "");
        setYearsInOperation(draft.yearsInOperation ?? "");
        setLookingFor(draft.lookingFor ?? "");
        setCanOffer(draft.canOffer ?? "");
        setPartnershipIdeas(draft.partnershipIdeas ?? "");
        setPartnershipInterestTags(draft.partnershipInterestTags ?? []);
        setBusinessStory(draft.businessStory ?? "");
        if (draft.step >= 1 && draft.step <= 4) setStep(draft.step);
      }
    } catch {
      // ignore corrupt localStorage
    }
    setHydrated(true);
  }, []);

  // --- localStorage auto-save: debounced save ---
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveDraft = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const draft: DraftState = {
        businessName, businessType, businessCategory, address, lat, lng, city, state, description, products,
        partnerships, collaborationIntents, hours, website, socialLinks, photos,
        followerCount, emailListSize, monthlyFootTraffic,
        targetAgeMin, targetAgeMax, targetIncomeBracket, customerInterests,
        yearsInOperation, lookingFor, canOffer, partnershipIdeas, partnershipInterestTags,
        businessStory, step,
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(draft)); } catch { /* quota exceeded */ }
    }, 400);
  }, [
    businessName, businessType, businessCategory, address, lat, lng, city, state, description, products,
    partnerships, collaborationIntents, hours, website, socialLinks, photos,
    followerCount, emailListSize, monthlyFootTraffic,
    targetAgeMin, targetAgeMax, targetIncomeBracket, customerInterests,
    yearsInOperation, lookingFor, canOffer, partnershipIdeas, partnershipInterestTags,
    businessStory, step,
  ]);

  useEffect(() => {
    if (hydrated) saveDraft();
  }, [hydrated, saveDraft]);

  // --- Inline validation ---
  const validationErrors: Record<string, string> = {};
  if (touched.businessName && !businessName.trim()) validationErrors.businessName = "Business name is required";
  if (touched.businessType && !businessType.trim()) validationErrors.businessType = "Industry / category is required";
  if (touched.address && !remoteMode && !address.trim()) validationErrors.address = "Address is required";
  if (touched.address && remoteMode && (!city.trim() || !state.trim())) validationErrors.address = "City and state are required";

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const isStep1Valid = businessName.trim() !== "" && businessType.trim() !== "" && (remoteMode ? (city.trim() !== "" && state.trim() !== "") : address.trim() !== "");

  const completenessStringFields = [
    businessName, businessType, address, description, products,
    followerCount, emailListSize, monthlyFootTraffic,
    targetAgeMin, targetAgeMax, targetIncomeBracket, customerInterests,
    yearsInOperation, hours, website, socialLinks,
  ];
  const completenessArrayFields = [partnerships, collaborationIntents, photos];
  const totalFields = completenessStringFields.length + completenessArrayFields.length;
  const filledFields =
    completenessStringFields.filter((f) => f.trim() !== "").length +
    completenessArrayFields.filter((f) => f.length > 0).length;
  const completeness = Math.round((filledFields / totalFields) * 100);

  const goToStep = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setErrorMessage(null);
    setStep(target);
  };

  const nextStep = () => {
    if (step === 1) {
      setTouched({ businessName: true, businessType: true, address: true });
      if (!isStep1Valid) {
        setErrorMessage(remoteMode
          ? "Please fill in business name, category, city, and state before continuing."
          : "Please fill in business name, category, and address before continuing.");
        return;
      }
    }
    setErrorMessage(null);
    setDirection(1);
    setStep((value) => Math.min(value + 1, 4));
  };

  const previousStep = () => {
    setDirection(-1);
    setStep((value) => Math.max(value - 1, 1));
  };

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
      city: city || null,
      state: state || null,
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
      looking_for: lookingFor
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      can_offer: canOffer
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      partnership_ideas: partnershipIdeas
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      partnership_interest_tags: partnershipInterestTags,
      business_story: businessStory || null,
      business_category: businessCategory || null,
    };

    const { error } = await supabase.from("businesses").upsert(payload, { onConflict: "owner_id" });
    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    // Trigger verification based on business category
    if (businessCategory === "brick-and-mortar" && businessName && address) {
      // Fire-and-forget Google Places verification
      fetch("/api/verify/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, address }),
      }).catch(() => { /* non-blocking */ });
    } else if (["online", "freelancer", "entrepreneur"].includes(businessCategory)) {
      // Submit for manual verification
      fetch("/api/verify/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: website || "" }),
      }).catch(() => { /* non-blocking */ });
    }

    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    // Mark onboarding complete in a client-side cookie so the middleware
    // skips the DB check on subsequent requests.
    document.cookie = "onboarding_complete=1; path=/; max-age=3600; samesite=lax";
    router.push("/discover");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <form style={{ background: 'var(--color-paper)', border: '1px solid var(--color-rule)', padding: '32px' }} onSubmit={submitProfile}>
        <p className="text-sm font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--color-accent)' }}>Step {step} of 4</p>
        <h1 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--color-ink)' }}>Your free advertising starts here.</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)', lineHeight: '1.6' }}>Sortir connects you with complementary businesses for cross-promotion, product placement, referrals, and more — all completely free, forever. Set up your profile to start finding your perfect partners.</p>

        <StepProgressBar step={step} />

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Profile completeness</span>
            <span className="font-medium text-neutral-700">{completeness}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
            <div className={`h-full rounded-full transition-all ${completeness >= 75 ? "bg-emerald-500" : completeness >= 50 ? "bg-amber-500" : "bg-neutral-400"}`} style={{ width: `${completeness}%` }} />
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label">Business name</label>
                    <input
                      className={`input ${validationErrors.businessName ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
                      onChange={(event) => setBusinessName(event.target.value)}
                      onBlur={() => markTouched("businessName")}
                      required
                      value={businessName}
                    />
                    <FieldError message={validationErrors.businessName} />
                  </div>
                  <div>
                    <label className="label">Industry / category</label>
                    <input
                      className={`input ${validationErrors.businessType ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`}
                      onChange={(event) => setBusinessType(event.target.value)}
                      onBlur={() => markTouched("businessType")}
                      required
                      value={businessType}
                    />
                    <FieldError message={validationErrors.businessType} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Business category</label>
                    <div className="grid gap-2 sm:grid-cols-3 mt-1">
                      {([
                        { value: "brick-and-mortar", label: "Brick & Mortar", description: "I have a physical storefront" },
                        { value: "online", label: "Online Business", description: "I sell products or services online" },
                        { value: "freelancer", label: "Freelancer", description: "I'm an independent contractor or creative" },
                        { value: "entrepreneur", label: "Entrepreneur", description: "I'm building something new" },
                        { value: "service-provider", label: "Service Provider", description: "I offer professional or trade services" },
                      ] as { value: BusinessCategory; label: string; description: string }[]).map((opt) => (
                        <label
                          key={opt.value}
                          className="flex flex-col gap-1 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-all"
                          style={{
                            borderColor: businessCategory === opt.value ? 'var(--color-ink)' : 'var(--color-rule)',
                            backgroundColor: businessCategory === opt.value ? 'var(--color-ink)' : 'var(--color-paper)',
                            color: businessCategory === opt.value ? 'var(--color-paper)' : 'var(--color-ink)',
                          }}
                        >
                          <input
                            type="radio"
                            name="businessCategory"
                            value={opt.value}
                            checked={businessCategory === opt.value}
                            onChange={() => setBusinessCategory(opt.value)}
                            className="sr-only"
                          />
                          <span className="font-medium">{opt.label}</span>
                          <span className="text-xs" style={{ color: businessCategory === opt.value ? 'rgba(245,242,235,0.7)' : 'var(--color-muted)' }}>{opt.description}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-700">
                        <input
                          type="radio"
                          name="addressMode"
                          checked={!remoteMode}
                          onChange={() => setRemoteMode(false)}
                          className="text-neutral-900"
                        />
                        I have a business address
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-700">
                        <input
                          type="radio"
                          name="addressMode"
                          checked={remoteMode}
                          onChange={() => setRemoteMode(true)}
                          className="text-neutral-900"
                        />
                        I work remotely — use my city for local matching
                      </label>
                    </div>
                    {!remoteMode ? (
                      <>
                        <label className="label">Address</label>
                        <AddressAutocomplete
                          onSelect={({ address: addr, lat: latitude, lng: longitude, city: selectedCity, state: selectedState }) => {
                            setAddress(addr);
                            setLat(String(latitude));
                            setLng(String(longitude));
                            if (selectedCity) setCity(selectedCity);
                            if (selectedState) setState(selectedState);
                            markTouched("address");
                          }}
                          onChange={(val) => { setAddress(val); markTouched("address"); }}
                          required
                          value={address}
                        />
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label">City</label>
                          <input
                            className="input"
                            placeholder="e.g. Austin"
                            value={city}
                            onChange={(e) => { setCity(e.target.value); setAddress(""); setLat(""); setLng(""); markTouched("address"); }}
                            required
                          />
                        </div>
                        <div>
                          <label className="label">State</label>
                          <input
                            className="input"
                            placeholder="e.g. TX"
                            maxLength={2}
                            value={state}
                            onChange={(e) => { setState(e.target.value.toUpperCase()); markTouched("address"); }}
                            required
                          />
                        </div>
                      </div>
                    )}
                    <FieldError message={validationErrors.address} />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="space-y-4">
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
                          <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700" key={option}>
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
                  <fieldset>
                    <legend className="label">How do you want to collaborate?</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {collaborationIntentOptions.map((option) => {
                        const checked = collaborationIntents.includes(option.value);
                        return (
                          <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700" key={option.value}>
                            <input
                              checked={checked}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  setCollaborationIntents((previous) => [...previous, option.value]);
                                } else {
                                  setCollaborationIntents((previous) => previous.filter((item) => item !== option.value));
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

                  <div>
                    <label className="label">What are you looking for? (comma separated)</label>
                    <textarea
                      className="input min-h-[80px]"
                      onChange={(event) => setLookingFor(event.target.value)}
                      value={lookingFor}
                      placeholder="e.g. Cross-promotion partners, Event collaborators, Product suppliers"
                    />
                    <p className="mt-1 text-xs text-neutral-400">Tell potential partners what you need</p>
                  </div>
                  <div>
                    <label className="label">What can you offer? (comma separated)</label>
                    <textarea
                      className="input min-h-[80px]"
                      onChange={(event) => setCanOffer(event.target.value)}
                      value={canOffer}
                      placeholder="e.g. Store shelf space, Social media promotion, Event venue"
                    />
                    <p className="mt-1 text-xs text-neutral-400">Tell potential partners what you bring to the table</p>
                  </div>
                  <div>
                    <label className="label">Partnership ideas (comma separated)</label>
                    <textarea
                      className="input min-h-[80px]"
                      onChange={(event) => setPartnershipIdeas(event.target.value)}
                      value={partnershipIdeas}
                      placeholder="e.g. Joint pop-up event, Co-branded gift basket, Referral discount program"
                    />
                    <p className="mt-1 text-xs text-neutral-400">Share specific partnership concepts you have in mind</p>
                  </div>
                  <fieldset>
                    <legend className="label">Partnership interest tags</legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {PARTNERSHIP_INTEREST_TAGS.map((tag) => {
                        const checked = partnershipInterestTags.includes(tag);
                        return (
                          <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700" key={tag}>
                            <input
                              checked={checked}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  setPartnershipInterestTags((previous) => [...previous, tag]);
                                } else {
                                  setPartnershipInterestTags((previous) => previous.filter((item) => item !== tag));
                                }
                              }}
                              type="checkbox"
                            />
                            {tag}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="space-y-6">
                  {/* About / Story */}
                  <div>
                    <label className="label">Your business story</label>
                    <textarea
                      className="input min-h-[100px]"
                      onChange={(event) => setBusinessStory(event.target.value)}
                      value={businessStory}
                      placeholder="Share your journey — how you started, what drives you, and your vision for the future."
                    />
                    <p className="mt-1 text-xs text-neutral-400">Help potential partners understand who you are</p>
                  </div>

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
                      <label className="label">
                        Website
                        {["online", "freelancer", "entrepreneur"].includes(businessCategory) && (
                          <span className="ml-1 text-xs font-normal" style={{ color: 'var(--color-accent)' }}>* required for verification</span>
                        )}
                      </label>
                      <input
                        className="input"
                        onChange={(event) => setWebsite(event.target.value)}
                        placeholder="https://yourbusiness.com"
                        value={website}
                        required={["online", "freelancer", "entrepreneur"].includes(businessCategory)}
                      />
                      {businessCategory === "brick-and-mortar" && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                          Your business will be verified via Google Places automatically.
                        </p>
                      )}
                      {["online", "freelancer", "entrepreneur"].includes(businessCategory) && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                          Your website or portfolio helps us verify your business manually (1–2 business days).
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label">Social links (comma separated)</label>
                      <input className="input" onChange={(event) => setSocialLinks(event.target.value)} value={socialLinks} />
                    </div>
                    <div className="sm:col-span-2">
                      <ImageUpload photos={photos} onChange={setPhotos} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="glass rounded-2xl p-5">
                  <p className="text-lg font-semibold text-neutral-900">Review your profile</p>
                  <p className="mt-1 text-xs text-neutral-500">Make sure everything looks good before finishing.</p>

                  <ReviewSection title="Basic Info" onEdit={() => goToStep(1)}>
                    <p className="font-medium text-neutral-900">{businessName || "—"}</p>
                    <p className="text-neutral-500">{businessType || "—"}</p>
                    <p className="mt-1">{address || "—"}</p>
                  </ReviewSection>

                  <ReviewSection title="Offerings & Partnerships" onEdit={() => goToStep(2)}>
                    <p>{description || <span className="italic text-neutral-400">No description provided.</span>}</p>
                    {products && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {products.split(",").map((p) => p.trim()).filter(Boolean).map((p) => (
                          <span key={p} className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">{p}</span>
                        ))}
                      </div>
                    )}
                    {partnerships.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {partnerships.map((p) => (
                          <span key={p} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{p}</span>
                        ))}
                      </div>
                    )}
                    {collaborationIntents.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {collaborationIntents.map((c) => (
                          <span key={c} className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                            {collaborationIntentOptions.find((o) => o.value === c)?.label ?? c}
                          </span>
                        ))}
                      </div>
                    )}
                    {lookingFor && (
                      <div className="mt-3 border-t border-neutral-100 pt-3">
                        <p className="text-xs font-semibold text-neutral-600">Looking For:</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {lookingFor.split(",").map((item) => item.trim()).filter(Boolean).map((item) => (
                            <span key={item} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {canOffer && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-neutral-600">Can Offer:</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {canOffer.split(",").map((item) => item.trim()).filter(Boolean).map((item) => (
                            <span key={item} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {partnershipInterestTags.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-neutral-600">Interest Tags:</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {partnershipInterestTags.map((tag) => (
                            <span key={tag} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </ReviewSection>

                  <ReviewSection title="Social Proof & Demographics" onEdit={() => goToStep(3)}>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {followerCount && (
                        <div className="rounded-xl bg-neutral-50 p-3 text-center">
                          <p className="text-lg font-bold text-neutral-900">{Number(followerCount).toLocaleString()}</p>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Followers</p>
                        </div>
                      )}
                      {emailListSize && (
                        <div className="rounded-xl bg-neutral-50 p-3 text-center">
                          <p className="text-lg font-bold text-neutral-900">{Number(emailListSize).toLocaleString()}</p>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Email list</p>
                        </div>
                      )}
                      {monthlyFootTraffic && (
                        <div className="rounded-xl bg-neutral-50 p-3 text-center">
                          <p className="text-lg font-bold text-neutral-900">{Number(monthlyFootTraffic).toLocaleString()}</p>
                          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">Monthly traffic</p>
                        </div>
                      )}
                    </div>
                    {(targetAgeMin || targetAgeMax || targetIncomeBracket || customerInterests) && (
                      <div className="mt-3 border-t border-neutral-100 pt-3">
                        {(targetAgeMin || targetAgeMax) && (
                          <p>Target age: {targetAgeMin || "—"} – {targetAgeMax || "—"}</p>
                        )}
                        {targetIncomeBracket && <p className="mt-1">Income bracket: {targetIncomeBracket}</p>}
                        {customerInterests && <p className="mt-1">Interests: {customerInterests}</p>}
                      </div>
                    )}
                  </ReviewSection>

                  {(yearsInOperation || hours || website || socialLinks || businessStory) && (
                    <ReviewSection title="Operations & Story" onEdit={() => goToStep(3)}>
                      {businessStory && <p className="italic text-neutral-600">&ldquo;{businessStory}&rdquo;</p>}
                      {yearsInOperation && <p className="mt-1">Years in operation: {yearsInOperation}</p>}
                      {hours && <p className="mt-1">Hours: {hours}</p>}
                      {website && <p className="mt-1">Website: {website}</p>}
                      {socialLinks && <p className="mt-1">Social: {socialLinks}</p>}
                    </ReviewSection>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {errorMessage ? <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}

        <div className="mt-6 flex items-center justify-between">
          <button className="btn-muted" disabled={step === 1} onClick={previousStep} type="button">
            Back
          </button>
          <div className="flex items-center gap-3">
            {step === 4 ? (
              <button className="btn-muted" onClick={() => router.push("/discover")} type="button">
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
