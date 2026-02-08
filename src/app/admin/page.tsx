"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";

const initialFormState = {
  name: "",
  email: "",
  message: "",
};

type FeedbackEntry = {
  id: string;
  name?: string;
  email?: string;
  message: string;
  createdAt: string;
};

export default function AdminPage() {
  const [formState, setFormState] = useState(initialFormState);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [adminStatus, setAdminStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus(null);

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formState),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setSubmitStatus(body.error ?? "Unable to submit feedback.");
      return;
    }

    setFormState(initialFormState);
    setSubmitStatus("Thanks! Your feedback has been received.");
  };

  const handleLoadFeedback = async () => {
    setAdminStatus(null);
    setIsLoading(true);

    const response = await fetch("/api/feedback", {
      method: "GET",
      headers: { "x-admin-password": adminPassword },
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setAdminStatus(body.error ?? "Unable to load feedback.");
      setFeedbackEntries([]);
      setIsLoading(false);
      return;
    }

    const body = (await response.json()) as { entries: FeedbackEntry[] };
    setFeedbackEntries(body.entries ?? []);
    setAdminStatus(
      body.entries.length
        ? `Loaded ${body.entries.length} message(s).`
        : "No feedback submitted yet.",
    );
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-sand">
      <Header />
      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <section className="bg-white rounded-2xl shadow-sm border border-sand/60 p-8">
            <h1 className="text-3xl font-semibold text-ink mb-2">
              Admin feedback panel
            </h1>
            <p className="text-muted max-w-2xl">
              Visitors can leave feedback about anything that feels off. Admins
              can review messages by entering the configured password.
            </p>
          </section>

          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-white rounded-2xl shadow-sm border border-sand/60 p-8">
              <h2 className="text-xl font-semibold text-ink mb-4">
                Submit feedback
              </h2>
              <form className="space-y-4" onSubmit={handleSubmitFeedback}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col text-sm font-medium text-ink">
                    Name (optional)
                    <input
                      className="mt-2 rounded-lg border border-sand px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink/30"
                      type="text"
                      name="name"
                      value={formState.name}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label className="flex flex-col text-sm font-medium text-ink">
                    Email (optional)
                    <input
                      className="mt-2 rounded-lg border border-sand px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink/30"
                      type="email"
                      name="email"
                      value={formState.email}
                      onChange={handleInputChange}
                    />
                  </label>
                </div>
                <label className="flex flex-col text-sm font-medium text-ink">
                  Message
                  <textarea
                    className="mt-2 min-h-[140px] rounded-lg border border-sand px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink/30"
                    name="message"
                    value={formState.message}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
                >
                  Send feedback
                </button>
                {submitStatus ? (
                  <p className="text-sm text-ink">{submitStatus}</p>
                ) : null}
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-sand/60 p-8">
              <h2 className="text-xl font-semibold text-ink mb-4">
                Review messages
              </h2>
              <label className="flex flex-col text-sm font-medium text-ink">
                Admin password
                <input
                  className="mt-2 rounded-lg border border-sand px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink/30"
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-full border border-ink px-6 py-2 text-sm font-semibold text-ink transition hover:bg-ink hover:text-white"
                onClick={handleLoadFeedback}
                disabled={!adminPassword || isLoading}
              >
                {isLoading ? "Loading..." : "Load messages"}
              </button>
              {adminStatus ? (
                <p className="mt-3 text-sm text-ink">{adminStatus}</p>
              ) : null}
              <div className="mt-6 space-y-4">
                {feedbackEntries.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-xl border border-sand/70 bg-sand/20 p-4"
                  >
                    <div className="flex flex-col gap-1 text-xs text-muted">
                      <span>
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                      <span>
                        {entry.name ? entry.name : "Anonymous"}
                        {entry.email ? ` · ${entry.email}` : ""}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-ink">{entry.message}</p>
                  </article>
                ))}
                {!feedbackEntries.length && adminStatus ? (
                  <p className="text-sm text-muted">No messages to display.</p>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
