import "@/src/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "sortir - Unified Recall Search",
  description:
    "Search across vehicle, consumer product, food, drug, and medical device recalls from NHTSA, CPSC, USDA FSIS, and FDA.",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/sortir-logo.png" },
    { rel: "apple-touch-icon", url: "/sortir-logo-192.png" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#fafafa" />
      </head>
      <body className="bg-base text-ink min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
