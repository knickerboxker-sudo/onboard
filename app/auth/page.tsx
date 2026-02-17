"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const safeRedirect = searchParams.get("redirect")?.startsWith("/")
    ? searchParams.get("redirect")
    : "/discover";

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setNotice(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm?next=${safeRedirect ?? "/discover"}`,
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setNotice(null);

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
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-semibold text-neutral-900">{isSignup ? "Create your business account" : "Sign in"}</h1>
        <p className="mt-2 text-sm text-neutral-600">
          {isSignup
            ? "Join Sortir to connect, collaborate, and promote alongside other local businesses. After signup you'll set up your business profile."
            : "Welcome back. Sign in to manage your partnerships and discover new collaborators."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-neutral-400">or continue with email</span>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input className="input" id="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
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
