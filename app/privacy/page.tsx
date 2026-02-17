import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-neutral-500">Last updated: February 2026</p>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {/* PLACEHOLDER: Legal content pending attorney review before launch */}
        <p className="text-sm leading-relaxed text-neutral-600">
          Privacy Policy — Legal content pending attorney review before launch.
          Please check back soon for our complete privacy policy.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          For questions about your data, contact us at{" "}
          <a
            href="mailto:hello@sortir.app"
            className="text-brand-600 hover:text-brand-700"
          >
            hello@sortir.app
          </a>
          .
        </p>
      </div>
    </div>
  );
}
