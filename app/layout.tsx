import type { Metadata } from "next";
import Providers from "./providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toaster from "./components/Toast";
import CookieBanner from "./components/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://sortir.app"),
  title: "Sortir — Your neighborhood businesses, stronger together.",
  description: "Find your perfect local business partner. Cross-promote, share customers, and build partnerships that help every small business thrive. Free, always.",
  icons: {
    icon: "/sortir-logo-transparent.png",
    apple: "/sortir-logo-transparent.png",
  },
  openGraph: {
    type: "website",
    siteName: "Sortir",
    title: "Sortir — Your neighborhood businesses, stronger together.",
    description: "Find your perfect local business partner. Cross-promote, share customers, and build partnerships that help every small business thrive. Free, always.",
    images: [{ url: '/sortir-logo-512.png', width: 512, height: 512, alt: 'Sortir' }],
  },
  twitter: {
    card: "summary_large_image",
    images: ['/sortir-logo-512.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c8622a" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://sortir.app"}`}
        />
      </head>
      <body className="overflow-x-hidden">
        <Providers>
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pt-0 pb-0 sm:px-6">
            <Header />
            <main className="min-w-0 flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
