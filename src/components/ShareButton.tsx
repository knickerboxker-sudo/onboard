"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors px-4 py-2 rounded-lg hover:bg-highlight"
      aria-label={copied ? "Link copied" : "Share this recall"}
    >
      {copied ? (
        <>
          <Check size={16} className="text-success" />
          <span className="text-success">Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={16} />
          Share
        </>
      )}
    </button>
  );
}
