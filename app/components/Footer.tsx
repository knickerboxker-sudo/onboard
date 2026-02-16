import Link from "next/link";

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
    <footer className="mt-16 border-t border-slate-200/60 pt-10 pb-10">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Sortir</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Helping small businesses and solo entrepreneurs form real partnerships to grow together.
          </p>
        </div>
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <p className="text-sm font-semibold text-slate-900">{heading}</p>
            <ul className="mt-3 space-y-2">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    className="text-sm text-slate-500 transition hover:text-slate-700"
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
      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200/60 pt-6 text-sm text-slate-400 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Sortir. All rights reserved.</p>
        <div className="flex gap-4">
          <Link className="transition hover:text-slate-600" href="/privacy">
            Privacy
          </Link>
          <Link className="transition hover:text-slate-600" href="/terms">
            Terms
          </Link>
          <Link className="transition hover:text-slate-600" href="mailto:hello@sortir.app">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
