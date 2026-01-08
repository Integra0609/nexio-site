// pages/_app.js
import SiteHeader from "../components/SiteHeader";

export default function App({ Component, pageProps }) {
  // sayfa bazlı aktif tab (opsiyonel)
  const active =
    pageProps?.activeNav ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/analyzer")
      ? "analyzer"
      : typeof window !== "undefined" && window.location.pathname.startsWith("/how-it-works")
      ? "how"
      : typeof window !== "undefined" && window.location.pathname.startsWith("/about")
      ? "about"
      : "home");

  return (
    <div style={styles.page}>
      <SiteHeader active={active} />
      <Component {...pageProps} />
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={styles.footerLeft}>
            Nexio.gg is not affiliated with Riot Games.
          </div>
          <div style={styles.footerRight}>
            <a href="/analyzer" style={styles.footerLink}>Analyzer</a>
            <span style={styles.footerDot}>•</span>
            <a href="/terms" style={styles.footerLink}>Terms</a>
            <span style={styles.footerDot}>•</span>
            <a href="/privacy" style={styles.footerLink}>Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.25), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(59,130,246,0.18), transparent 55%), #0b1020",
    color: "#e8eefc",
  },
  footer: {
    marginTop: 28,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(11,16,32,0.35)",
    backdropFilter: "blur(10px)",
  },
  footerInner: {
    maxWidth: 1160,
    margin: "0 auto",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    color: "rgba(232,238,252,0.65)",
    fontSize: 12,
  },
  footerLeft: { opacity: 0.95 },
  footerRight: { display: "flex", alignItems: "center", gap: 10 },
  footerLink: { color: "rgba(232,238,252,0.8)", textDecoration: "none" },
  footerDot: { color: "rgba(232,238,252,0.35)" },
};
