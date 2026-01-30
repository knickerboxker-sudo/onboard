"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (mode === "signup") {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Unable to create account.");
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setError("Invalid credentials. Try again.");
      return;
    }

    router.push("/chat");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-soft">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
            OA
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Welcome to OnboardAI</h1>
          <p className="text-sm text-muted">
            Capture what you learn. Ask anything later.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div>
              <label className="text-xs font-semibold text-muted">Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
                placeholder="Jane Doe"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted">Email</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-border px-3 py-2">
              <Mail className="h-4 w-4 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full text-sm outline-none"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted">Password</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-border px-3 py-2">
              <Lock className="h-4 w-4 text-muted" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full text-sm outline-none"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-muted">
          {mode === "signin" ? (
            <button onClick={() => setMode("signup")} className="underline">
              New here? Create an account
            </button>
          ) : (
            <button onClick={() => setMode("signin")} className="underline">
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
