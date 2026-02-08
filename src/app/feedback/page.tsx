"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { Send, CheckCircle2 } from "lucide-react";

const initialFormState = {
  name: "",
  email: "",
  message: "",
};

export default function FeedbackPage() {
  const [formState, setFormState] = useState(initialFormState);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    // Clear status when user starts typing again
    if (submitStatus) setSubmitStatus(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const body = await response.json();

      if (!response.ok) {
        setSubmitStatus({
          type: "error",
          message: body.error ?? "Unable to submit feedback. Please try again.",
        });
        return;
      }

      setFormState(initialFormState);
      setSubmitStatus({
        type: "success",
        message: "Thanks! Your feedback has been sent to our team.",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-ink mb-3">
              Send Us Feedback
            </h1>
            <p className="text-muted max-w-xl mx-auto">
              Found a bug? Have a suggestion? Want to report incorrect data?
              We'd love to hear from you.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-card border border-border p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col text-sm font-medium text-ink">
                  Name <span className="text-muted font-normal">(optional)</span>
                  <input
                    className="mt-2 rounded-lg border border-border px-4 py-2.5 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={formState.name}
                    onChange={handleInputChange}
                    maxLength={100}
                  />
                </label>
                <label className="flex flex-col text-sm font-medium text-ink">
                  Email <span className="text-muted font-normal">(optional)</span>
                  <input
                    className="mt-2 rounded-lg border border-border px-4 py-2.5 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formState.email}
                    onChange={handleInputChange}
                    maxLength={200}
                  />
                </label>
              </div>
              <label className="flex flex-col text-sm font-medium text-ink">
                Message <span className="text-danger">*</span>
                <textarea
                  className="mt-2 min-h-[160px] rounded-lg border border-border px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-y"
                  name="message"
                  placeholder="Tell us what's on your mind..."
                  value={formState.message}
                  onChange={handleInputChange}
                  required
                  minLength={10}
                  maxLength={2000}
                />
                <span className="mt-1 text-xs text-muted">
                  {formState.message.length} / 2000 characters
                </span>
              </label>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !formState.message.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Feedback
                    </>
                  )}
                </button>

                {submitStatus && (
                  <div
                    className={`flex items-center gap-2 text-sm font-medium ${
                      submitStatus.type === "success"
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {submitStatus.type === "success" && (
                      <CheckCircle2 size={18} />
                    )}
                    {submitStatus.message}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-muted bg-highlight border border-border rounded-xl p-4">
            <p>
              Your feedback helps us improve sortir for everyone. We typically
              respond within 2-3 business days if you provide an email address.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
