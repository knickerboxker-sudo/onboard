import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Launch Progress", href: "/coming-soon" },
    { label: "Success Stories", href: "/success-stories" },
    { label: "Partnership Ideas", href: "/partnership-ideas" },
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
    <footer
      className="-mx-4 sm:-mx-6 mt-20 relative overflow-hidden"
      style={{ backgroundColor: "var(--color-ink)" }}
    >
      {/* Background wordmark watermark */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute bottom-0 left-6 leading-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(5rem, 15vw, 12rem)",
          fontStyle: "italic",
          color: "rgba(245,242,235,0.06)",
          lineHeight: "0.85",
          zIndex: 0,
        }}
      >
        Sortir
      </span>

      <div className="relative px-6 sm:px-12 pt-16 pb-10" style={{ zIndex: 1 }}>
        {/* Top: wordmark + tagline */}
        <div className="mb-12">
          <Link className="inline-block" href="/">
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontStyle: "italic",
                color: "var(--color-paper)",
              }}
            >
              Sortir
            </span>
            <span
              style={{
                color: "var(--color-accent)",
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                marginLeft: "1px",
              }}
            >
              ·
            </span>
          </Link>
          <p
            className="mt-3 max-w-sm"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "15px",
              fontStyle: "italic",
              color: "rgba(245,242,235,0.55)",
              lineHeight: "1.5",
            }}
          >
            Your neighborhood businesses, stronger together.
          </p>
        </div>

        {/* 3-column nav grid */}
        <div className="grid grid-cols-3 gap-8 sm:gap-12">
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: "rgba(245,242,235,0.4)",
                  marginBottom: "12px",
                }}
              >
                {heading}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="footer-nav-link transition-colors duration-200"
                      href={link.href}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase" as const,
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Legal copy */}
        <div
          className="mt-16 pt-6"
          style={{ borderTop: "1px solid rgba(245,242,235,0.1)" }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "rgba(245,242,235,0.3)",
            }}
          >
            &copy; {new Date().getFullYear()} Sortir. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
