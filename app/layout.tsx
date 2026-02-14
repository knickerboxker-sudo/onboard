import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Sortir",
  description: "Find public permit opportunities by ZIP code.",
  icons: {
    icon: "/sortir-logo-192.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
