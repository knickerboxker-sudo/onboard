"use client";

export const dynamic = 'force-dynamic';

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const BLOCKED_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.uk", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr",
  "outlook.com", "live.com", "msn.com",
  "aol.com",
]);

function isPersonalEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? BLOCKED_DOMAINS.has(domain) : false;
}

type PasswordStrength = { score: 0 | 1 | 2; label: string; color: string; unmet: string[] };

function checkPasswordStrength(password: string): PasswordStrength {
  const unmet: string[] = [];
  if (password.length < 8) unmet.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) unmet.push("At least one uppercase letter");
  if (!/[a-z]/.test(password)) unmet.push("At least one lowercase letter");
  if (!/[0-9]/.test(password)) unmet.push("At least one number");

  const score = unmet.length === 0 ? 2 : unmet.length <= 2 ? 1 : 0;
  const labels: Record<number, string> = { 0: "Weak", 1: "Fair", 2: "Strong" };
  const colors: Record<number, string> = { 0: "#dc2626", 1: "#d97706", 2: "#16a34a" };
  return { score: score as 0 | 1 | 2, label: labels[score], color: colors[score], unmet };
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
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [personalEmailWarning, setPersonalEmailWarning] = useState<string | null>(null);

  const safeRedirect = searchParams.get("redirect")?.startsWith("/")
    ? searchParams.get("redirect")
    : "/discover";

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (isSignup && value.includes("@") && isPersonalEmail(value)) {
      setPersonalEmailWarning(
        "Tip: A business email (like yourname@yourbusiness.com) builds more trust with potential partners."
      );
    } else {
      setPersonalEmailWarning(null);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (isSignup && value.length > 0) {
      setPasswordStrength(checkPasswordStrength(value));
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setNotice(null);

    // Server-side email validation for signups
    if (isSignup) {
      try {
        const res = await fetch("/api/auth/validate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!data.valid) {
          setErrorMessage(data.reason ?? "Invalid email address.");
          setLoading(false);
          return;
        }
      } catch {
        // Network error — proceed with client-side check as fallback
      }

      // Block weak passwords on signup
      const strength = checkPasswordStrength(password);
      if (strength.score < 1) {
        setErrorMessage("Please choose a stronger password: " + strength.unmet.join(", ") + ".");
        setLoading(false);
        return;
      }
    }

    let nextPath = "/onboarding";
    if (isSignup && city) {
      const { count } = await supabase
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .ilike("city", city);
      if ((count ?? 0) < 50) {
        nextPath = `/prelaunch/city/${encodeURIComponent(city)}`;
      }
    }

    const response = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`,
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
    <div className="min-h-screen flex items-stretch">
      {/* Left: brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16"
        style={{ backgroundColor: 'var(--color-accent-2)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-paper)', fontStyle: 'italic' }}>
          Sortir
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--color-paper)', lineHeight: 1.1 }}>
            Your neighborhood businesses,{' '}
            <em>stronger together.</em>
          </h2>
          <p className="mt-6" style={{ color: 'rgba(245,242,235,0.7)', fontSize: '14px', lineHeight: 1.6 }}>
            Find your perfect local partner — cross-promote, share customers, and build cooperative networks that help every small business thrive.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4">
            {[
              { stat: 'Free · Always', label: 'No paywall, no credit card' },
              { stat: 'Every business type', label: 'Brick-and-mortar, online & freelancers' },
            ].map((s) => (
              <div key={s.stat} className="py-4" style={{ borderTop: '1px solid rgba(245,242,235,0.15)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-paper)' }}>{s.stat}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,242,235,0.5)', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(245,242,235,0.4)' }}>
          © {new Date().getFullYear()} Sortir
        </div>
      </div>

      {/* Right: form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-16"
        style={{ backgroundColor: 'var(--color-paper)' }}>
        <div className="mx-auto max-w-md w-full">
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
                {personalEmailWarning ? (
                  <p className="mt-1.5 rounded-xl bg-yellow-50 px-3 py-2 text-xs text-yellow-800">{personalEmailWarning}</p>
                ) : null}
              </div>
              {isSignup && (
                <div>
                  <label className="label" htmlFor="city">
                    Your city <span className="font-normal text-neutral-400">(optional)</span>
                  </label>
                  <input className="input" id="city" onChange={(event) => setCity(event.target.value)} placeholder="e.g. Austin" type="text" value={city} />
                </div>
              )}
              <div>
                <label className="label" htmlFor="password">
                  Password
                </label>
                <input className="input" id="password" minLength={8} onChange={(event) => handlePasswordChange(event.target.value)} required type="password" value={password} />
                {isSignup && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-1 flex-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-colors"
                            style={{
                              backgroundColor:
                                i <= passwordStrength.score
                                  ? passwordStrength.color
                                  : "var(--color-rule)",
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    {passwordStrength.unmet.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {passwordStrength.unmet.map((rule) => (
                          <li key={rule} className="text-xs" style={{ color: "var(--color-muted)" }}>
                            · {rule}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {!isSignup && <p className="mt-1 text-xs text-neutral-500">Use at least 8 characters for account security.</p>}
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
      </div>
    </div>
  );
}
