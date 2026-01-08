// components/SiteHeader.js
import Link from "next/link";

export default function SiteHeader({ active = "home" }) {
  const nav = [
    { href: "/", label: "Home", key: "home" },
    { href: "/analyzer", label: "Analyzer", key: "analyzer" },
    { href: "/how-it-works", label: "How it works", key: "how" },
    { href: "/about", label: "About", key: "about" },
  ];

  return (
    <header style={styles.wrap}>
      <div style={styles.inner}>
        <Link href="/" style={styles.brand}>
          <div style={styles.logo}>N</div>
          <div>
            <div style={styles.brandTitle}>Nexio.gg</div>
            <div style={styles.brandSub}>AI-powered esports analytics</div>
          </div>
        </Link>

        <nav style={styles.nav}>
          {nav.map((i) => (
            <Link
              key={i.key}
              href={i.href}
              style={{
                ...styles.navItem,
                ...(active === i.key ? styles.navItemActive : null),
              }}
            >
              {i.label}
            </Link>
          ))}
        </nav>

        <div style={styles.right}>
          <Link href="/terms" style={styles.smallLink}>
            Terms
          </Link>
          <span style={styles.dot}>•</span>
          <Link href="/privacy" style={styles.smallLink}>
            Privacy
          </Link>
        </div>
      </div>
    </header>
  );
}

const styles = {
  wrap: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(14px)",
    background: "rgba(11,16,32,0.55)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  inner: {
    maxWidth: 1160,
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brand: { display: "flex", alignItems: "center", gap: 12, textDecoration: "none" },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#e8eefc",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  brandTitle: { color: "#e8eefc", fontWeight: 900, lineHeight: 1.1 },
  brandSub: { color: "rgba(232,238,252,0.65)", fontSize: 12, marginTop: 2 },
  nav: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  navItem: {
    color: "rgba(232,238,252,0.78)",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 13,
    padding: "9px 12px",
    borderRadius: 999,
    border: "1px solid transparent",
  },
  navItemActive: {
    background: "rgba(124,58,237,0.16)",
    border: "1px solid rgba(124,58,237,0.35)",
    color: "#e8eefc",
  },
  right: { display: "flex", alignItems: "center", gap: 10 },
  smallLink: { color: "rgba(232,238,252,0.75)", textDecoration: "none", fontSize: 12 },
  dot: { color: "rgba(232,238,252,0.35)" },
};
