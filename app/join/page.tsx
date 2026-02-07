"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function JoinPage() {
  const [step, setStep] = useState<"code" | "auth">("code");
  const [accessCode, setAccessCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode, email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      // Sign in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        setError("Joined but login failed. Try logging in.");
        setLoading(false);
        return;
      }

      window.location.href = `/app/${data.workspaceSlug}/feed`;
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            sortir
          </Link>
          <p className="text-sm text-[#6b7280] mt-1">Join a workspace</p>
        </div>

        {step === "code" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5">
                5-digit access code
              </label>
              <input
                type="text"
                maxLength={5}
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#111] text-center tracking-[0.3em] text-lg font-mono"
                placeholder="00000"
              />
            </div>
            <button
              onClick={() => {
                if (accessCode.length === 5) setStep("auth");
                else setError("Please enter a 5-digit code.");
              }}
              className="w-full py-2 text-sm bg-[#111] text-white rounded-md hover:bg-[#333] transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === "auth" && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-[#f3f4f6] rounded-md text-xs font-mono tracking-wider">
                {accessCode}
              </span>
              <button
                type="button"
                onClick={() => setStep("code")}
                className="ml-2 text-xs text-[#6b7280] underline"
              >
                change
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#111]"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#111]"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#111]"
                placeholder="At least 6 characters"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-sm bg-[#111] text-white rounded-md hover:bg-[#333] disabled:opacity-50 transition-colors"
            >
              {loading ? "Joining…" : "Join workspace"}
            </button>
          </form>
        )}

        {error && step === "code" && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <p className="text-center text-xs text-[#6b7280]">
          Want to create a workspace?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
