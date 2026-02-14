import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Area Health Dashboard",
  description:
    "Compare local air quality, economic conditions, food access, and drug safety across locations.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/sortir-logo-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
