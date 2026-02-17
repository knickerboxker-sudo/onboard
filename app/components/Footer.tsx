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
      style={{
        borderTop: "1px solid var(--color-rule)",
        background: "var(--color-paper)",
        marginTop: "80px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          padding: "48px 0 24px",
          alignItems: "start",
        }}
        className="sm:grid-cols-2"
      >
        {/* Left: wordmark */}
        <div>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              color: "var(--color-ink)",
              fontWeight: 400,
              textDecoration: "none",
            }}
          >
            Sortir
            <span style={{ color: "var(--color-accent)", marginLeft: "2px" }}>·</span>
          </Link>
          <p
            style={{
              marginTop: "12px",
              fontSize: "13px",
              fontFamily: "var(--font-body)",
              color: "var(--color-muted)",
              lineHeight: 1.6,
              maxWidth: "260px",
            }}
          >
            Helping small businesses form real partnerships to grow together.
          </p>
        </div>

        {/* Right: links */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            justifyContent: "flex-end",
          }}
        >
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-ink)",
                  fontWeight: 500,
                  marginBottom: "12px",
                }}
              >
                {heading}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "13px",
                        color: "var(--color-muted)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      className="hover:text-[var(--color-ink)]"
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
      </div>

      {/* Legal line */}
      <div
        style={{
          borderTop: "1px solid var(--color-rule)",
          padding: "16px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--color-muted)",
          }}
        >
          &copy; {new Date().getFullYear()} Sortir. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: "20px" }}>
          {[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Contact", href: "mailto:hello@sortir.app" },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--color-muted)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              className="hover:text-[var(--color-ink)]"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
