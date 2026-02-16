"use client";

import { useState } from "react";
import { MapPin, Check } from "lucide-react";

export default function CityRequestForm() {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !state.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/prelaunch/city-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: city.trim(), state: state.trim(), email: email.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <Check className="h-5 w-5 flex-shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-medium text-emerald-900">City requested!</p>
          <p className="text-xs text-emerald-600">
            We&apos;ll notify you when {city}, {state} is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
        <MapPin className="h-4 w-4" />
        Request your city
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          className="input"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <input
          type="text"
          className="input"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        />
      </div>
      <input
        type="email"
        className="input"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button
        type="submit"
        className="btn-secondary w-full"
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Request City"}
      </button>
    </form>
  );
}
