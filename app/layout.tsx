import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onboard | Local Business Investment Matchmaking",
  description:
    "Connect local investors with brick-and-mortar businesses seeking funding. We facilitate introductions only.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/sortir-logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/sortir-logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Onboard",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
