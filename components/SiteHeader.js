// components/SiteHeader.js
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nav = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/analyzer", label: "Analyzer" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/about", label: "About" },
    ],
    []
  );

  // Close menu on route change
  useEffect(() => {
    const handle = () => setOpen(false);
    router.events?.on?.("routeChangeStart", handle);
    return () => router.events?.off?.("routeChangeStart", handle);
  }, [router.events]);

  // ESC closes
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header style={styles.wrap}>
      <div style={styles.inner}>
        {/* Left: Brand */}
        <div style={styles.left}>
          <Link href="/" style={styles.brand} aria-label="Nexio.gg Home">
            <span style={styles.logoDot} />
            <span style={styles.brandText}>
              Nexio<span style={styles.brandTld}>.gg</span>
            </span>
          </Link>

          <span style={styles.badge}>POST-MATCH</span>
        </div>

        {/* Right: Desktop nav */}
        <nav style={styles.navDesktop} aria-label="Primary">
          {nav.map((item) => {
            const active = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...styles.navLink,
                  ...(active ? styles.navLinkActive : null),
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {/* CTA SLOT (future auth) */}
          <button
            type="button"
            style={styles.authCta}
            onClick={() => alert("Login is coming soon.")}
          >
            Login (soon)
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          style={styles.burger}
        >
          <span
            style={{
              ...styles.bLine,
              ...(open ? styles.bLineTopOpen : null),
              top: 14,
            }}
          />
          <span
            style={{
              ...styles.bLine,
              ...(open ? styles.bLineMidOpen : null),
              top: 19,
            }}
          />
          <span
            style={{
              ...styles.bLine,
              ...(open ? styles.bLineBotOpen : null),
              top: 24,
            }}
          />
        </button>
      </div>

      {/* Mobile panel */}
      {open ? (
        <>
          <div style={styles.backdrop} onClick={() => setOpen(false)} />
          <div style={styles.mobilePanel} role="dialog" aria-label="Menu">
            <div style={styles.mobileTop}>
              <div style={styles.mobileTitle}>Menu</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.mobileLinks}>
              {nav.map((item) => {
                const active = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      ...styles.mobileLink,
                      ...(active ? styles.mobileLinkActive : null),
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div style={styles.mobileCtas}>
              <button
                type="button"
                style={styles.mobileAuthCta}
                onClick={() => alert("Login is coming soon.")}
              >
                Login (soon)
              </button>

              <div style={styles.mobileHint}>
                Nexio.gg is not affiliated with Riot Games.
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Responsive visibility rules (no globals.css needed) */}
      <style jsx>{`
        @media (max-width: 860px) {
          nav[aria-label="Primary"] {
            display: none !important;
          }
        }
        @media (max-width: 860px) {
          button[aria-label="Open menu"],
          button[aria-label="Close menu"] {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}

const styles = {
  wrap: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background:
      "linear-gradient(180deg, rgba(7,11,24,0.92), rgba(7,11,24,0.72))",
    backdropFilter: "blur(10px)",
  },
  inner: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  left: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 },

  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    color: "#e8eefc",
    minWidth: 0,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    background:
      "linear-gradient(135deg, rgba(124,58,237,1), rgba(59,130,246,1))",
    boxShadow: "0 0 0 3px rgba(124,58,237,0.15)",
    flex: "0 0 auto",
  },
  brandText: {
    fontWeight: 950,
    letterSpacing: -0.4,
    fontSize: 18,
    whiteSpace: "nowrap",
  },
  brandTld: { color: "rgba(232,238,252,0.75)", fontWeight: 900 },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(232,238,252,0.82)",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  navDesktop: { display: "flex", alignItems: "center", gap: 10 },
  navLink: {
    textDecoration: "none",
    color: "rgba(232,238,252,0.80)",
    fontSize: 13,
    fontWeight: 800,
    padding: "9px 10px",
    borderRadius: 12,
    border: "1px solid transparent",
    background: "transparent",
  },
  navLinkActive: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#e8eefc",
  },

  authCta: {
    appearance: "none",
    WebkitAppearance: "none",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#e8eefc",
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 950,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  burger: {
    width: 44,
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
    flex: "0 0 auto",
  },
  bLine: {
    position: "absolute",
    left: 13,
    width: 18,
    height: 2,
    background: "rgba(232,238,252,0.92)",
    borderRadius: 999,
    transition: "transform 180ms ease, opacity 180ms ease",
  },
  bLineTopOpen: { transform: "translateY(5px) rotate(45deg)" },
  bLineMidOpen: { opacity: 0 },
  bLineBotOpen: { transform: "translateY(-5px) rotate(-45deg)" },

  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 60,
  },
  mobilePanel: {
    position: "fixed",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 70,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "linear-gradient(180deg, rgba(8,12,26,0.96), rgba(8,12,26,0.92))",
    boxShadow: "0 30px 120px rgba(0,0,0,0.55)",
    backdropFilter: "blur(10px)",
    overflow: "hidden",
  },
  mobileTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  mobileTitle: { fontWeight: 950, color: "#e8eefc" },
  closeBtn: {
    width: 36,
    height: 32,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(232,238,252,0.92)",
    cursor: "pointer",
    fontWeight: 900,
  },
  mobileLinks: { display: "grid", gap: 8, padding: 14 },
  mobileLink: {
    textDecoration: "none",
    color: "rgba(232,238,252,0.88)",
    fontWeight: 900,
    fontSize: 14,
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
  },
  mobileLinkActive: {
    border: "1px solid rgba(124,58,237,0.35)",
    background: "rgba(124,58,237,0.10)",
  },
  mobileCtas: {
    padding: 14,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "grid",
    gap: 10,
  },
  mobileAuthCta: {
    appearance: "none",
    WebkitAppearance: "none",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.92), rgba(59,130,246,0.88))",
    color: "#fff",
    padding: "12px 12px",
    fontWeight: 950,
    cursor: "pointer",
  },
  mobileHint: {
    fontSize: 12,
    color: "rgba(232,238,252,0.62)",
    lineHeight: 1.5,
  },
};
