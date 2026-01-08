// pages/index.js
export default function Home() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Top bar */}
        <header style={styles.topbar}>
          <a href="/" style={styles.brand}>
            <div style={styles.brandMark}>N</div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={styles.brandName}>Nexio.gg</div>
              <div style={styles.brandTag}>AI-powered esports analytics</div>
            </div>
          </a>

          <nav style={styles.nav}>
            <a href="/terms" style={styles.navLink}>
              Terms
            </a>
            <span style={styles.navDot}>•</span>
            <a href="/privacy" style={styles.navLink}>
              Privacy
            </a>
          </nav>
        </header>

        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroInner}>
            <div style={styles.badge}>BETA</div>

            <h1 style={styles.h1}>
              Post-match insights for <span style={styles.h1Accent}>esports</span>.
            </h1>

            <p style={styles.sub}>
              Clean performance summaries based on publicly available match data.
              Built for clarity — designed to be policy-aware.
            </p>

            <div style={styles.ctaRow}>
              <a href="/analyzer" style={styles.primaryBtn}>
                Open Analyzer <span style={styles.arrow}>→</span>
              </a>
              <a href="#how-it-works" style={styles.secondaryBtn}>
                How it works
              </a>
            </div>

            <div style={styles.chips}>
              <span style={styles.chip}>Post-match only</span>
              <span style={styles.chip}>No real-time assistance</span>
              <span style={styles.chip}>No automation</span>
              <span style={styles.chip}>No gameplay modification</span>
            </div>

            <div style={styles.gameRow}>
              <span style={styles.gameChip}>Currently: League of Legends</span>
              <span style={styles.gameChipMuted}>More games soon</span>
            </div>
          </div>
        </section>

        {/* Value / Features */}
        <section id="how-it-works" style={styles.section}>
          <div style={styles.sectionHead}>
            <div>
              <h2 style={styles.h2}>What you’ll get</h2>
              <p style={styles.sectionSub}>
                Clean, fast, and readable analytics — built for clarity.
              </p>
            </div>

            <div style={styles.pillsRight}>
              <span style={styles.smallPill}>LoL</span>
              <span style={styles.smallPillMuted}>More soon</span>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardIcon}>📊</div>
              <div style={styles.cardTitle}>Recent performance</div>
              <div style={styles.cardText}>
                KDA trend, winrate snapshot, and recent match-based signals.
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcon}>🧠</div>
              <div style={styles.cardTitle}>Insights-first UX</div>
              <div style={styles.cardText}>
                Minimal noise. Clear visuals. Built for quick understanding.
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcon}>🎯</div>
              <div style={styles.cardTitle}>Role distribution</div>
              <div style={styles.cardText}>
                A compact overview of your most played roles (recent sample).
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardIcon}>🛡️</div>
              <div style={styles.cardTitle}>Policy-aware</div>
              <div style={styles.cardText}>
                Designed to avoid automation, gameplay modification, or real-time assistance.
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section style={styles.disclaimer}>
          <h3 style={styles.disclaimerTitle}>Disclaimer</h3>
          <p style={styles.disclaimerText}>
            Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
          </p>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerLeft}>© {new Date().getFullYear()} Nexio.gg</div>
          <div style={styles.footerLinks}>
            <a href="/analyzer" style={styles.footerLink}>
              Analyzer
            </a>
            <span style={styles.navDot}>•</span>
            <a href="/terms" style={styles.footerLink}>
              Terms
            </a>
            <span style={styles.navDot}>•</span>
            <a href="/privacy" style={styles.footerLink}>
              Privacy
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1100px 700px at 12% 10%, rgba(124,58,237,0.22), transparent 60%), radial-gradient(900px 520px at 85% 22%, rgba(59,130,246,0.16), transparent 55%), #070a14",
    color: "#EAF0FF",
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "28px 20px 40px",
  },

  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 22,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    color: "inherit",
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  },
  brandName: { fontWeight: 900, fontSize: 14 },
  brandTag: { fontSize: 12, color: "rgba(234,240,255,0.72)" },

  nav: { display: "flex", alignItems: "center", gap: 10 },
  navLink: { color: "rgba(234,240,255,0.82)", textDecoration: "none", fontSize: 13 },
  navDot: { opacity: 0.55 },

  hero: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    boxShadow: "0 26px 90px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
  },
  heroInner: {
    padding: "40px 34px 30px",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    letterSpacing: 1,
  },
  h1: {
    margin: "14px 0 12px",
    fontSize: 56,
    lineHeight: 1.03,
    letterSpacing: -0.8,
  },
  h1Accent: {
    background: "linear-gradient(90deg, rgba(124,58,237,1), rgba(59,130,246,1))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  sub: {
    margin: 0,
    maxWidth: 760,
    color: "rgba(234,240,255,0.78)",
    fontSize: 16,
    lineHeight: 1.6,
  },
  ctaRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 18,
  },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 14,
    textDecoration: "none",
    color: "#fff",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.14)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(59,130,246,0.90))",
    boxShadow: "0 14px 50px rgba(0,0,0,0.35)",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: 14,
    textDecoration: "none",
    color: "rgba(234,240,255,0.9)",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
  },
  arrow: { opacity: 0.95 },

  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  chip: {
    padding: "9px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(234,240,255,0.80)",
    fontSize: 12,
    fontWeight: 700,
  },

  gameRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  gameChip: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(234,240,255,0.86)",
  },
  gameChipMuted: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.12)",
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(234,240,255,0.62)",
  },

  section: {
    marginTop: 18,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    boxShadow: "0 18px 70px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    padding: "22px 22px 18px",
  },
  sectionHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  h2: { margin: 0, fontSize: 18, fontWeight: 900 },
  sectionSub: { margin: "6px 0 0", color: "rgba(234,240,255,0.70)", fontSize: 13 },
  pillsRight: { display: "flex", gap: 10, alignItems: "center" },
  smallPill: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 800,
  },
  smallPillMuted: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.12)",
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(234,240,255,0.62)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  card: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 16,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  },
  cardIcon: { fontSize: 18, marginBottom: 10, opacity: 0.95 },
  cardTitle: { fontWeight: 900, marginBottom: 6 },
  cardText: { color: "rgba(234,240,255,0.72)", fontSize: 13, lineHeight: 1.5 },

  disclaimer: {
    marginTop: 18,
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: "18px 18px",
  },
  disclaimerTitle: { margin: 0, fontSize: 16, fontWeight: 900 },
  disclaimerText: { margin: "8px 0 0", color: "rgba(234,240,255,0.72)", fontSize: 13 },

  footer: {
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    color: "rgba(234,240,255,0.62)",
    fontSize: 12,
  },
  footerLeft: { opacity: 0.9 },
  footerLinks: { display: "flex", alignItems: "center", gap: 10 },
  footerLink: { color: "rgba(234,240,255,0.78)", textDecoration: "none" },
};
