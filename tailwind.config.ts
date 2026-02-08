import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0f0f0f",
        card: "#1a1a1a",
        "card-hover": "#222222",
        ink: "#ffffff",
        muted: "#a1a1aa",
        border: "#2a2a2a",
        accent: "#3b82f6",
        "accent-hover": "#2563eb",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        highlight: "#1e1e1e",
      },
      fontFamily: {
        sans: ["Inter", "SF Pro", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.3)",
        card: "0 1px 3px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
