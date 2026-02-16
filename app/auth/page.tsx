"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setNotice(null);

    const response = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (response.error) {
      setErrorMessage(response.error.message);
      return;
    }

    if (isSignup) {
      setNotice("Account created. Please check your email confirmation settings and continue onboarding.");
      router.push("/onboarding");
      return;
    }

    router.push("/swipe");
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-semibold text-slate-900">{isSignup ? "Create your PartnerSwipe account" : "Sign in"}</h1>
        <p className="mt-2 text-sm text-slate-600">Secure email authentication for business owners.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            <p className="mt-1 text-xs text-slate-500">Use at least 8 characters for account security.</p>
          </div>

          {errorMessage ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p> : null}
          {notice ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p> : null}

          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? "Working..." : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <button className="mt-4 w-full text-sm text-slate-600 underline-offset-2 hover:underline" onClick={() => setIsSignup((value) => !value)} type="button">
          {isSignup ? "Already have an account? Sign in" : "Need an account? Create one"}
        </button>
      </div>
    </div>
  );
}
