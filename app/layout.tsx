import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "sortir - Peer-to-Peer Delivery",
  description:
    "Connect with drivers to pick up items from any store. Set your price, get it delivered.",
  icons: {
    icon: "/sortir-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-base text-ink min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
