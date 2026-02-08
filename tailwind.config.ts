import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#fafafa",
        card: "#ffffff",
        "card-hover": "#f8f9fb",
        ink: "#1a1a2e",
        muted: "#6b7280",
        border: "#e5e7eb",
        accent: "#3ECF8E",
        "accent-hover": "#38b27d",
        "accent-light": "#3ECF8E1a",
        success: "#3ECF8E",
        warning: "#f59e0b",
        danger: "#ef4444",
        highlight: "#f3f4f6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        card: "0 1px 2px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)",
        "card-hover": "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        header: "0 1px 3px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      keyframes: {
        "skeleton-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "skeleton-pulse": "skeleton-pulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
