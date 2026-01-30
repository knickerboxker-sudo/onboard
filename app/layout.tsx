import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnboardAI",
  description: "Personal job ramp coach with memory."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
