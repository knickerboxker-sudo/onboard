import "@/src/app/globals.css";
import type { Metadata } from "next";

if (typeof window === "undefined") {
  void import("@/src/lib/env").then(({ validateEnv }) => {
    try {
      validateEnv();
    } catch (error) {
      console.error("Environment validation failed:", error);
      process.exit(1);
    }
  });
}

export const metadata: Metadata = {
  title: "sortir - Unified Recall Search",
  description:
    "Search across vehicle, consumer product, food, drug, medical device, environmental, and marine recalls from NHTSA, CPSC, USDA FSIS, FDA, EPA, and USCG.",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/sortir-logo.png" },
    { rel: "apple-touch-icon", url: "/sortir-logo-192.png" },
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://sortir.app"),
  openGraph: {
    type: "website",
    siteName: "sortir",
    title: "sortir - Unified Recall Search",
    description:
      "Search across vehicle, consumer product, food, drug, medical device, environmental, and marine recalls from multiple U.S. government agencies.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#f7f9fc" />
      </head>
      <body className="bg-base text-ink min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
