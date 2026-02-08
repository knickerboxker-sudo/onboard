import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#f7f9fc",
        card: "#ffffff",
        "card-hover": "#f3f6fb",
        ink: "#0f172a",
        muted: "#52616f",
        border: "#dfe5ec",
        accent: "#355d77",
        "accent-hover": "#2f5269",
        "accent-light": "#355d7724",
        success: "#2f9e88",
        warning: "#f59e0b",
        danger: "#ef4444",
        highlight: "#eef2f6",
      },
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px rgba(15, 23, 42, 0.06)",
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 4px 10px rgba(15, 23, 42, 0.08), 0 12px 24px rgba(15, 23, 42, 0.08)",
        header: "0 1px 2px rgba(15, 23, 42, 0.04)",
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
