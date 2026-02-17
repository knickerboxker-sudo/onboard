"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { VerificationType, VerificationStatus } from "@/lib/types";

type VerificationRow = {
  id: string;
  verification_type: VerificationType;
  document_url: string | null;
  status: VerificationStatus;
  reviewer_notes: string | null;
  submitted_at: string;
  verified_at: string | null;
};

const VERIFICATION_TYPES: {
  type: VerificationType;
  label: string;
  description: string;
  isUrl: boolean;
}[] = [
  { type: "business_license", label: "Business License", description: "Upload a link to your business license document.", isUrl: false },
  { type: "storefront_photo", label: "Storefront Photo", description: "Upload a link to a photo of your storefront.", isUrl: false },
  { type: "tax_id", label: "Tax ID", description: "Upload a link to your tax ID document.", isUrl: false },
  { type: "social_media", label: "Social Media", description: "Link to your business social media profile.", isUrl: true },
  { type: "website", label: "Website", description: "Link to your business website.", isUrl: true },
];

const statusBadge: Record<VerificationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function VerifyPage() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["verifications"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in.");

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();
      if (!business) throw new Error("Please complete onboarding.");

      const { data: verifications } = await supabase
        .from("verifications")
        .select("id, verification_type, document_url, status, reviewer_notes, submitted_at, verified_at")
        .eq("business_id", business.id)
        .order("submitted_at", { ascending: false });

      return {
        businessId: business.id as string,
        verifications: (verifications ?? []) as VerificationRow[],
      };
    },
  });

  const submitMutation = useMutation({
    mutationFn: async ({ type, url }: { type: VerificationType; url: string }) => {
      const { error } = await supabase.from("verifications").insert({
        business_id: data!.businessId,
        verification_type: type,
        document_url: url,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verifications"] });
    },
  });

  const verificationMap = new Map<VerificationType, VerificationRow>();
  for (const v of data?.verifications ?? []) {
    if (!verificationMap.has(v.verification_type)) {
      verificationMap.set(v.verification_type, v);
    }
  }

  function validateUrl(type: VerificationType, value: string): string | null {
    if (!value.trim()) return "This field is required.";
    const config = VERIFICATION_TYPES.find((t) => t.type === type);
    if (config?.isUrl && !/^https?:\/\//.test(value.trim())) {
      return "URL must start with http:// or https://";
    }
    return null;
  }

  function handleSubmit(type: VerificationType) {
    const value = inputs[type] ?? "";
    const validationError = validateUrl(type, value);
    if (validationError) {
      setErrors((prev) => ({ ...prev, [type]: validationError }));
      return;
    }
    setErrors((prev) => ({ ...prev, [type]: "" }));
    submitMutation.mutate({ type, url: value.trim() });
    setInputs((prev) => ({ ...prev, [type]: "" }));
  }

  if (isLoading) return <div className="glass rounded-3xl p-6" role="status" aria-live="polite">Loading verifications…</div>;
  if (error)
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {(error as Error).message}
      </p>
    );

  return (
    <div className="space-y-4">
      <div className="glass rounded-3xl p-6">
        <p className="mb-1 text-sm font-medium uppercase tracking-[0.18em] text-sky-700">Trust & Verification</p>
        <h1 className="text-2xl font-semibold text-neutral-900">Submit Verification</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Verify your business to build trust with potential partners. Submit documents or links for review.
        </p>
      </div>

      {VERIFICATION_TYPES.map((config) => {
        const existing = verificationMap.get(config.type);
        const canSubmit = !existing || existing.status === "rejected";
        const inputValue = inputs[config.type] ?? "";
        const fieldError = errors[config.type];

        return (
          <div key={config.type} className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">{config.label}</h2>
              {existing && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge[existing.status]}`}>
                  {existing.status}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-500">{config.description}</p>

            {existing && (
              <div className="mt-3 space-y-1 text-sm text-neutral-600">
                <p>Submitted {new Date(existing.submitted_at).toLocaleDateString()}</p>
                {existing.verified_at && (
                  <p>Verified {new Date(existing.verified_at).toLocaleDateString()}</p>
                )}
                {existing.reviewer_notes && (
                  <p className="text-sm text-neutral-500">Reviewer: {existing.reviewer_notes}</p>
                )}
              </div>
            )}

            {canSubmit && (
              <div className="mt-4">
                <label className="label">{config.isUrl ? "URL" : "Document URL"}</label>
                <input
                  type="text"
                  className="input"
                  placeholder={config.isUrl ? "https://..." : "https://example.com/document.pdf"}
                  value={inputValue}
                  onChange={(e) => {
                    setInputs((prev) => ({ ...prev, [config.type]: e.target.value }));
                    if (fieldError) setErrors((prev) => ({ ...prev, [config.type]: "" }));
                  }}
                />
                {fieldError && <p className="mt-1 text-sm text-red-600">{fieldError}</p>}
                <button
                  className="btn-primary mt-3"
                  disabled={submitMutation.isPending}
                  aria-busy={submitMutation.isPending}
                  onClick={() => handleSubmit(config.type)}
                >
                  {submitMutation.isPending ? "Submitting…" : existing ? "Re-submit Verification" : "Submit Verification"}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
