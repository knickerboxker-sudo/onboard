"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, staleTime: 10_000 },
        },
      }),
  );

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  return (
    <QueryClientProvider client={client}>
      {children}
      {showInstallBanner && (
        <div
          className="fixed bottom-4 left-4 right-4 z-[9998] flex items-center justify-between gap-4 px-4 py-3 sm:left-auto sm:right-4 sm:w-auto sm:max-w-sm"
          style={{
            backgroundColor: "var(--color-ink)",
            color: "var(--color-paper)",
            borderRadius: "2px",
            fontFamily: "var(--font-body)",
            fontSize: "14px",
          }}
        >
          <span>Add Sortir to your home screen</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleInstall}
              className="btn"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-paper)",
                padding: "4px 12px",
                fontSize: "12px",
              }}
            >
              Install
            </button>
            <button
              type="button"
              onClick={() => setShowInstallBanner(false)}
              aria-label="Dismiss install prompt"
              style={{ color: "rgba(245,242,235,0.6)" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </QueryClientProvider>
  );
}
