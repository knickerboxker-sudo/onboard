import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#f8fafc",
        card: "#ffffff",
        "card-hover": "#f1f5f9",
        ink: "#0f172a",
        muted: "#475569",
        border: "#e2e8f0",
        accent: "#2563eb",
        "accent-hover": "#1d4ed8",
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
        highlight: "#f1f5f9",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(15, 23, 42, 0.08)",
        card: "0 1px 3px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
