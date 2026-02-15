import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trading Terminal",
  description: "Real-time stock trading terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#05070b] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
