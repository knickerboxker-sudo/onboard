import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#f6f6f6",
        card: "#ffffff",
        ink: "#1f2937",
        muted: "#6b7280",
        border: "#e5e7eb",
        accent: "#111827",
        highlight: "#f3f4f6",
        success: "#10b981"
      },
      boxShadow: {
        soft: "0 8px 24px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
