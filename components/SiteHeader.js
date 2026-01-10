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
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
    []
  );

  // Close mobile menu on route change
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  return (
    <header style={styles.wrap}>
      <div style={styles.inner}>
        {/* Brand */}
        <Link href="/" style={styles.brand}>
          <span style={styles.logo} />
          <span>
            Nexio<span style={{ opacity: 0.7 }}>.gg</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={styles.nav}>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              style={{
                ...styles.link,
                ...(router.pathname === n.href ? styles.active : {}),
              }}
            >
              {n.label}
            </Link>
          ))}
          <Link href="/analyzer" style={styles.cta}>
            Open Analyzer
          </Link>
        </nav>

        {/* Mobile button */}
        <button onClick={() => setOpen(!open)} style={styles.burger}>
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={styles.mobile}>
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              style={styles.mobileLink}
            >
              {n.label}
            </Link>
          ))}
          <Link href="/analyzer" style={styles.mobileCta}>
            Open Analyzer
          </Link>
        </div>
      )}
    </header>
  );
}

const styles = {
  wrap: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(7,11,24,0.9)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  inner: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    textDecoration: "none",
    color: "#fff",
    fontWeight: 900,
    fontSize: 18,
  },
  logo: {
    width: 12,
    height: 12,
    borderRadius: 999,
    background:
      "linear-gradient(135deg, rgba(124,58,237,1), rgba(59,130,246,1))",
  },
  nav: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  link: {
    color: "rgba(255,255,255,0.75)",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 800,
    padding: "8px 10px",
    borderRadius: 10,
  },
  active: {
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
  },
  cta: {
    marginLeft: 6,
    padding: "10px 14px",
    borderRadius: 12,
    background:
      "linear-gradient(135deg, rgba(124,58,237,1), rgba(59,130,246,1))",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    fontSize: 13,
  },
  burger: {
    display: "none",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: 22,
  },
  mobile: {
    display: "grid",
    gap: 10,
    padding: 16,
    background: "rgba(7,11,24,0.97)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  mobileLink: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
  },
  mobileCta: {
    marginTop: 10,
    padding: "12px",
    textAlign: "center",
    borderRadius: 12,
    background:
      "linear-gradient(135deg, rgba(124,58,237,1), rgba(59,130,246,1))",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
  },
};
