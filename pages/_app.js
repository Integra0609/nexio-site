// pages/_app.js
import Head from "next/head";
import { useState } from "react";

export default function App({ Component, pageProps, router }) {
  const [hovered, setHovered] = useState(null);
  const isActive = (href) => router?.pathname === href;

  const navStyle = (href) => {
    const active = isActive(href);
    const hover = hovered === href;

    if (active) {
      return {
        ...styles.navLink,
        ...styles.navActive,
      };
    }

    if (hover) {
      return {
        ...styles.navLink,
        ...styles.navHover,
      };
    }

    return styles.navLink;
  };

  return (
    <>
      <Head>
        <title>Nexio.gg</title>
        <meta name="description" content="AI-powered post-match esports analytics." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </Head>

      <div style={styles.shell}>
        {/* HEADER */}
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <a href="/" style={styles.brand}>
              <img
                src="/nexio-mark.svg"
                alt="Nexio.gg"
                width={40}
                height={40}
                style={styles.logoImg}
              />
              <div>
                <div style={styles.brandName}>Nexio.gg</div>
                <div style={styles.brandSub}>AI-powered esports analytics</div>
              </div>
            </a>

            <nav style={styles.nav}>
              {[
                { href: "/", label: "Home" },
                { href: "/demo", label: "Demo" },
                { href: "/how-it-works", label: "How it works" },
                { href: "/about", label: "About" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={navStyle(item.href)}
                  onMouseEnter={() => setHovered(item.href)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        {/* PAGE */}
        <div style={styles.content}>
          <Component {...pageProps} />
        </div>

        {/* FOOTER */}
        <footer style={styles.footer}>
          <div style={styles.footerInner}>
            <div>© {new Date().getFullYear()} Nexio.gg</div>
            <div style={styles.footerRight}>
              <a href="/terms" style={styles.footerLink}>Terms</a>
              <span style={styles.dot}>•</span>
              <a href="/privacy" style={styles.footerLink}>Privacy</a>
              <span style={styles.dot}>•</span>
              <span style={styles.footerMuted}>Not affiliated with Riot Games</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

const styles = {
  shell: { minHeight: "100vh", backgroundColor: "#0B1020" },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(11,16,32,0.86)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap", // mobile wrap
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    color: "#E8EEFC",
  },
  logoImg: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 34px rgba(0,0,0,0.45)",
  },
  brandName: { fontWeight: 950 },
  brandSub: { fontSize: 12, color: "rgba(232,238,252,0.7)" },

  nav: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  navLink: {
    padding: "8px 12px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 850,
    textDecoration: "none",
    color: "rgba(232,238,252,0.78)",
    transition: "all 180ms ease",
  },

  navHover: {
    background: "rgba(255,255,255,0.06)",
    color: "#E8EEFC",
  },

  navActive: {
    background: "rgba(124,58,237,0.16)",
    border: "1px solid rgba(124,58,237,0.35)",
    color: "#E8EEFC",
    boxShadow: "0 10px 28px rgba(124,58,237,0.12)",
  },

  content: { minHeight: "calc(100vh - 140px)" },

  footer: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(11,16,32,0.74)",
    backdropFilter: "blur(12px)",
  },
  footerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 12,
    color: "rgba(232,238,252,0.65)",
  },
  footerRight: { display: "flex", gap: 10, flexWrap: "wrap" },
  footerLink: {
    color: "rgba(232,238,252,0.82)",
    textDecoration: "none",
    fontWeight: 850,
  },
  footerMuted: { color: "rgba(232,238,252,0.55)" },
  dot: { opacity: 0.6 },
};
