"use client";

export const dynamic = 'force-dynamic';

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const BLOCKED_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr", "outlook.com", "outlook.co.uk",
  "live.com", "msn.com", "icloud.com", "me.com", "mac.com", "aol.com",
  "protonmail.com", "proton.me", "mail.com", "gmx.com", "gmx.net",
  "zoho.com", "yandex.com", "tutanota.com", "fastmail.com",
]);

function isPersonalEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? BLOCKED_DOMAINS.has(domain) : false;
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md" />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [isSignup, setIsSignup] = useState(!searchParams.get("redirect"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const safeRedirect = searchParams.get("redirect")?.startsWith("/")
    ? searchParams.get("redirect")
    : "/discover";

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (isSignup && value.includes("@") && isPersonalEmail(value)) {
      setEmailError("Please sign up with your business email address (e.g. you@yourbusiness.com). Personal email addresses like Gmail are not accepted.");
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setNotice(null);

    if (isSignup && isPersonalEmail(email)) {
      setErrorMessage("Please sign up with your business email address (e.g. you@yourbusiness.com). Personal email addresses like Gmail are not accepted.");
      setLoading(false);
      return;
    }

    const response = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=/onboarding`,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (response.error) {
      setErrorMessage(response.error.message);
      return;
    }

    if (isSignup) {
      setNotice("Account created. Check your email to confirm your account, then continue onboarding.");
      return;
    }

    router.push(safeRedirect ?? "/discover");
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setErrorMessage("Enter your email first, then click reset password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setNotice(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setNotice("Password reset email sent. Check your inbox for the secure reset link.");
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="glass rounded-3xl p-8" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background watermark */}
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(6rem, 20vw, 14rem)',
            fontStyle: 'italic',
            color: 'rgba(13,13,13,0.03)',
            position: 'absolute',
            bottom: '-0.2em',
            right: '-0.1em',
            lineHeight: '1',
            pointerEvents: 'none',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          Sortir
        </span>
        <h1 className="text-2xl font-semibold text-neutral-900">{isSignup ? "Create your business account" : "Sign in"}</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {isSignup
            ? "Join Sortir to connect, collaborate, and promote alongside other local businesses. After signup you'll set up your business profile."
            : "Welcome back. Sign in to manage your partnerships and discover new collaborators."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input className="input" id="email" onChange={(event) => handleEmailChange(event.target.value)} required type="email" value={email} />
            {emailError ? <p className="mt-1 text-xs text-red-600">{emailError}</p> : null}
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input className="input" id="password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            <p className="mt-1 text-xs text-neutral-500">Use at least 8 characters for account security.</p>
          </div>

          {errorMessage ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}
          {notice ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p> : null}

          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? "Working..." : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        {!isSignup && (
          <button
            className="mt-4 w-full text-sm text-neutral-600 underline-offset-2 hover:underline"
            disabled={loading}
            onClick={handlePasswordReset}
            type="button"
          >
            Forgot password?
          </button>
        )}

        <button className="mt-4 w-full text-sm text-neutral-600 underline-offset-2 hover:underline" onClick={() => setIsSignup((value) => !value)} type="button">
          {isSignup ? "Already have an account? Sign in" : "Need an account? Create one"}
        </button>
      </div>
    </div>
  );
}
