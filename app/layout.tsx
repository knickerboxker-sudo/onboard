import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "sortir",
  description: "A calm, pull-based internal team feed for small businesses.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/sortir-logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/sortir-logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/sortir-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#fafafa] text-[#111] min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
