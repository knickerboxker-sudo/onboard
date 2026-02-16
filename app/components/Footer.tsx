import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "mailto:hello@sortir.app" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/60 pt-12 pb-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link className="flex items-center gap-2.5" href="/">
            <Image
              src="/sortir-logo.png"
              alt="Sortir"
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-slate-900">Sortir</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Helping small businesses and solo entrepreneurs form real partnerships to grow together.
          </p>
        </div>
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{heading}</p>
            <ul className="mt-4 space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    className="text-sm text-slate-500 transition-colors hover:text-slate-900"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200/60 pt-6 text-sm text-slate-400 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Sortir. All rights reserved.</p>
        <div className="flex gap-5">
          <Link className="transition-colors hover:text-slate-600" href="/privacy">
            Privacy
          </Link>
          <Link className="transition-colors hover:text-slate-600" href="/terms">
            Terms
          </Link>
          <Link className="transition-colors hover:text-slate-600" href="mailto:hello@sortir.app">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
