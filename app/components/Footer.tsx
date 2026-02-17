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
      className="mt-20"
      style={{
        borderTop: '1px solid var(--color-rule)',
        backgroundColor: 'var(--color-paper)',
      }}
    >
      <div className="pt-12 pb-10 px-6 sm:px-12">
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2">
          {/* Left — wordmark */}
          <div>
            <Link className="flex items-center" href="/">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  color: 'var(--color-ink)',
                }}
              >
                Sortir
              </span>
              <span
                style={{
                  color: 'var(--color-accent)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  marginLeft: '1px',
                }}
              >
                ·
              </span>
            </Link>
          </div>

          {/* Right — links */}
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--color-muted)',
                  }}
                >
                  {heading}
                </p>
                <ul className="mt-3 space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className="transition-colors duration-200"
                        href={link.href}
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase' as const,
                          color: 'var(--color-muted)',
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
        </div>

        {/* Legal copy */}
        <div
          className="mt-12 pt-6"
          style={{ borderTop: '1px solid var(--color-rule)' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-muted)',
            }}
          >
            &copy; {new Date().getFullYear()} Sortir. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
