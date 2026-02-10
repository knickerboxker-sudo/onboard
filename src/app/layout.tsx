import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "sortir",
  description: "Private local-storage AI agent powered by Cohere",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/sortir-logo-192.png" },
    { rel: "apple-touch-icon", url: "/sortir-logo-512.png" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
