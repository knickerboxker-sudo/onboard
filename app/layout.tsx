import type { Metadata } from "next";
import Providers from "./providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sortir — Connect. Collaborate. Promote.",
  description: "Help small businesses and solo entrepreneurs form partnerships to sell, promote, and grow together.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        <Providers>
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pt-0 pb-0 sm:px-6">
            <Header />
            <main className="min-w-0 flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
