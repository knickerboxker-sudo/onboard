import "@/src/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RecallGuard - Unified Recall Search",
  description:
    "Search across vehicle, consumer product, food, drug, and medical device recalls from NHTSA, CPSC, USDA FSIS, and FDA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-base text-ink min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
