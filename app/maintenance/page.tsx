import type { Metadata } from "next";
import RetryButton from "./RetryButton";

export const metadata: Metadata = {
  title: "Maintenance — Sortir",
  description: "Sortir is temporarily unavailable. Please check back shortly.",
};

export default function MaintenancePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="max-w-md">
        <p
          className="mb-4 text-xs uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}
        >
          Temporarily Unavailable
        </p>
        <h1
          className="mb-6"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            lineHeight: "1.1",
            color: "var(--color-ink)",
          }}
        >
          We&apos;ll be back shortly.
        </h1>
        <p
          className="mb-10 text-base leading-relaxed"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-body)" }}
        >
          Sortir is undergoing scheduled maintenance. Our team is working to
          restore the platform as quickly as possible. Thank you for your
          patience.
        </p>
        <RetryButton />
      </div>
    </div>
  );
}
