"use client";

import { useEffect, useState } from "react";

function getCookieConsent(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)cookie_consent=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const setConsent = (value: "all" | "essential") => {
    const maxAge = 365 * 24 * 60 * 60;
    document.cookie = `cookie_consent=${value}; path=/; max-age=${maxAge}; samesite=lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-[9990] px-4 pb-4 sm:px-6"
    >
      <div
        className="mx-auto flex max-w-4xl flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6"
        style={{
          backgroundColor: "var(--color-ink)",
          color: "var(--color-paper)",
          borderRadius: "2px",
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          lineHeight: "1.5",
        }}
      >
        <p className="flex-1" style={{ color: "rgba(245,242,235,0.85)" }}>
          We use essential cookies to make Sortir work, and optional analytics cookies to help us improve. You can choose what to allow.{" "}
          <a
            href="/privacy"
            style={{ color: "var(--color-accent)", textDecoration: "underline" }}
          >
            Learn more
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setConsent("essential")}
            className="btn"
            style={{
              backgroundColor: "transparent",
              color: "rgba(245,242,235,0.7)",
              border: "1px solid rgba(245,242,235,0.25)",
              fontSize: "12px",
              padding: "6px 14px",
            }}
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => setConsent("all")}
            className="btn"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-paper)",
              fontSize: "12px",
              padding: "6px 14px",
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
