"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  url: string;
  businessName: string;
}

export default function ShareButton({ url, businessName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Copy profile link for ${businessName}`}
      className="btn-ghost flex items-center gap-1.5 text-sm"
      style={{ color: "var(--color-muted)" }}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
          <span style={{ color: "var(--color-accent)" }}>Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share
        </>
      )}
    </button>
  );
}
