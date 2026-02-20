import type { Metadata } from "next";
import Providers from "./providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toaster from "./components/Toast";
import CookieBanner from "./components/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://sortir.app"),
  title: "Sortir — Connect with businesses that send you customers.",
  description: "Sortir connects freelancers and local businesses who refer clients to each other. Grow through word-of-mouth that actually scales — no ad spend, always free.",
  icons: {
    icon: "/sortir-logo-transparent.png",
    apple: "/sortir-logo-transparent.png",
  },
  openGraph: {
    type: "website",
    siteName: "Sortir",
    title: "Sortir — Connect with businesses that send you customers.",
    description: "Sortir connects freelancers and local businesses who refer clients to each other. Grow through word-of-mouth that actually scales — no ad spend, always free.",
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
