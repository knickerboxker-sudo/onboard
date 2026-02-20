"use client";

export default function CookiePreferencesLink() {
  const handleClick = () => {
    // Clear the cookie and reload to re-show the banner
    document.cookie = "cookie_consent=; path=/; max-age=0";
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-2 block transition-colors"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "rgba(245,242,235,0.3)",
        textDecoration: "underline",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      Cookie Preferences
    </button>
  );
}
