// pages/_app.js
import Head from "next/head";

export default function App({ Component, pageProps, router }) {
  const isActive = (href) => router?.pathname === href;

  return (
    <>
      <Head>
        <title>Nexio.gg</title>
        <meta name="description" content="AI-powered post-match esports analytics." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </Head>

      <div style={styles.shell}>
        {/* GLOBAL HEADER */}
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
              <div style={{ display: "grid", gap: 2 }}>
                <div style={styles.brandName}>Nexio.gg</div>
                <div style={styles.brandSub}>AI-powered esports analytics</div>
              </div>
            </a>

            <nav style={styles.nav}>
              <a
                href="/"
                style={{
                  ...styles.navLink,
                  ...(isActive("/") ? styles.navActive : null),
                }}
              >
                Home
              </a>
              <a
                href="/demo"
                style={{
                  ...styles.navLink,
                  ...(isActive("/demo") ? styles.navActive : null),
                }}
              >
                Demo
              </a>
              <a
                href="/how-it-works"
                style={{
                  ...styles.navLink,
                  ...(isActive("/how-it-works") ? styles.navActive : null),
                }}
              >
                How it works
              </a>
              <a
                href="/about"
                style={{
                  ...styles.navLink,
                  ...(isActive("/about") ? styles.navActive : null),
                }}
              >
                About
              </a>
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={styles.content}>
          <Component {...pageProps} />
        </div>

        {/* GLOBAL FOOTER */}
        <footer style={styles.footer}>
          <div style={styles.footerInner}>
            <div style={styles.footerLeft}>© {new Date().getFullYear()} Nexio.gg</div>

            <div style={styles.footerRight}>
              <a href="/terms" style={styles.footerLink}>
                Terms
              </a>
              <span style={styles.dot}>•</span>
              <a href="/privacy" style={styles.footerLink}>
                Privacy
              </a>
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

  // Header: deeper Nexio tone + premium blur
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(11,16,32,0.86)", // #0B1020 with premium opacity
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
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
  brandName: { fontWeight: 950, letterSpacing: 0.2, color: "#E8EEFC" },
  brandSub: { fontSize: 12, color: "rgba(232,238,252,0.70)" },

  nav: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  // Base nav link: calmer, more premium
  navLink: {
    textDecoration: "none",
    color: "rgba(232,238,252,0.78)",
    fontSize: 13,
    fontWeight: 850,
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.00)",
    background: "rgba(255,255,255,0.00)",
    transition: "background 180ms ease, border-color 180ms ease, color 180ms ease",
  },

  // Active: violet-tinted (Nexio DNA)
  navActive: {
    color: "#E8EEFC",
    background: "rgba(124,58,237,0.16)", // violet
    border: "1px solid rgba(124,58,237,0.35)",
    boxShadow: "0 10px 28px rgba(124,58,237,0.12)",
  },

  content: { minHeight: "calc(100vh - 140px)" },

  // Footer: consistent depth
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    color: "rgba(232,238,252,0.65)",
    fontSize: 12,
  },
  footerLeft: { opacity: 0.95, color: "rgba(232,238,252,0.70)" },
  footerRight: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  footerLink: {
    color: "rgba(232,238,252,0.82)",
    textDecoration: "none",
    fontWeight: 850,
  },
  footerMuted: { color: "rgba(232,238,252,0.55)" },
  dot: { opacity: 0.6 },
};
