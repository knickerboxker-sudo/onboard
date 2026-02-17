import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Launch Progress", href: "/coming-soon" },
    { label: "Success Stories", href: "/success-stories" },
    { label: "Dashboard Preview", href: "/dashboard-preview" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "mailto:hello@sortir.app" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-20">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      <div className="pt-12 pb-10">
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
              <span className="text-lg font-bold tracking-tight text-neutral-900">Sortir</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Helping small businesses and solo entrepreneurs form real partnerships to grow together.
            </p>
          </div>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{heading}</p>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-sm text-neutral-500 transition-colors duration-200 hover:text-neutral-900"
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
        <div className="mt-12 flex flex-col items-center justify-between gap-3 pt-6 text-sm text-neutral-400 sm:flex-row">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent sm:hidden" />
          <p>&copy; {new Date().getFullYear()} Sortir. All rights reserved.</p>
          <div className="flex gap-5">
            <Link className="transition-colors duration-200 hover:text-neutral-600" href="/privacy">
              Privacy
            </Link>
            <Link className="transition-colors duration-200 hover:text-neutral-600" href="/terms">
              Terms
            </Link>
            <Link className="transition-colors duration-200 hover:text-neutral-600" href="mailto:hello@sortir.app">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
