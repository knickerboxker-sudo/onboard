"use client";

import { useState } from "react";
import { Check, Lock, Copy, Share2 } from "lucide-react";

interface Reward {
  threshold: number;
  label: string;
  description: string;
}

const rewards: Reward[] = [
  { threshold: 5, label: "Priority Placement", description: "Priority placement at launch" },
  { threshold: 10, label: "Featured Listing", description: "Featured in launch announcement" },
  { threshold: 15, label: "Free Pro Tier", description: "Free Professional tier for 3 months" },
];

interface ReferralStatsProps {
  referralCode: string;
  referralCount: number;
  city: string;
}

export default function ReferralStats({
  referralCode,
  referralCount,
  city,
}: ReferralStatsProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = `sortir.app/r/${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${referralLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const shareText = `I just joined the Sortir waitlist in ${city}! Join me and help us unlock local business partnerships. Sign up here:`;
  const shareUrl = `https://${referralLink}`;

  return (
    <div className="space-y-6">
      {/* Referral link */}
      <div>
        <label className="label">Your referral link</label>
        <div className="flex items-center gap-2">
          <div className="input flex items-center overflow-hidden text-neutral-500">
            <span className="truncate">{referralLink}</span>
          </div>
          <button
            onClick={handleCopy}
            className="btn-primary flex-shrink-0"
            type="button"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Referral count */}
      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lavender-50 text-lavender-600 font-semibold">
          {referralCount}
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900">Referrals</p>
          <p className="text-xs text-neutral-500">
            {referralCount === 0
              ? "Share your link to start earning rewards"
              : `${referralCount} business${referralCount === 1 ? "" : "es"} joined through your link`}
          </p>
        </div>
      </div>

      {/* Rewards progress */}
      <div>
        <p className="label">Referral rewards</p>
        <div className="space-y-3">
          {rewards.map((reward) => {
            const unlocked = referralCount >= reward.threshold;
            return (
              <div
                key={reward.threshold}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  unlocked
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-neutral-200 bg-white"
                }`}
              >
                {unlocked ? (
                  <Check className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                ) : (
                  <Lock className="h-5 w-5 flex-shrink-0 text-neutral-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      unlocked ? "text-emerald-900" : "text-neutral-700"
                    }`}
                  >
                    {reward.label}
                  </p>
                  <p
                    className={`text-xs ${
                      unlocked ? "text-emerald-600" : "text-neutral-500"
                    }`}
                  >
                    {reward.description}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium ${
                    unlocked ? "text-emerald-600" : "text-neutral-400"
                  }`}
                >
                  {reward.threshold} referrals
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social share */}
      <div>
        <p className="label">Share on social</p>
        <div className="flex gap-2">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            Facebook
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
