"use client";

import { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToastStore, type Toast } from "./use-toast";

const variantStyles: Record<Toast["variant"], { bg: string; color: string; icon: React.ReactNode }> = {
  success: {
    bg: "var(--color-accent-2)",
    color: "#fff",
    icon: <CheckCircle2 className="h-4 w-4 shrink-0" />,
  },
  error: {
    bg: "#dc2626",
    color: "#fff",
    icon: <AlertCircle className="h-4 w-4 shrink-0" />,
  },
  info: {
    bg: "var(--color-ink)",
    color: "var(--color-paper)",
    icon: <Info className="h-4 w-4 shrink-0" />,
  },
  warning: {
    bg: "#d97706",
    color: "#fff",
    icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const styles = variantStyles[toast.variant];

  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, remove]);

  return (
    <div
      role={toast.variant === "error" || toast.variant === "warning" ? "alert" : "status"}
      aria-live={toast.variant === "error" || toast.variant === "warning" ? "assertive" : "polite"}
      className="flex items-center gap-3 px-4 py-3 shadow-lg"
      style={{
        backgroundColor: styles.bg,
        color: styles.color,
        borderRadius: "2px",
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        minWidth: "280px",
        maxWidth: "420px",
      }}
    >
      {styles.icon}
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => remove(toast.id)}
        aria-label="Dismiss notification"
        style={{ color: "inherit", opacity: 0.75 }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
