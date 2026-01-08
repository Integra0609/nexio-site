export default function Home() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Top bar */}
        <header style={styles.topRow}>
          <div style={styles.brand}>
            <div style={styles.logoMark}>N</div>
            <div>
              <div style={styles.brandName}>Nexio.gg</div>
              <div style={styles.brandSub}>AI-powered esports analytics</div>
            </div>
          </div>

          <nav style={styles.topActions}>
            <a href="/terms" style={styles.topLink}>Terms</a>
            <span style={styles.dot}>•</span>
            <a href="/privacy" style={styles.topLink}>Privacy</a>
          </nav>
        </header>

        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.badge}>BETA</div>

          <h1 style={styles.h1}>
            Post-match insights for{" "}
            <span style={styles.gradText}>League of Legends</span>.
          </h1>

          <p style={styles.p}>
            Clean performance summaries based on recently available public match data.
            <br />
            Built for clarity — designed to be policy-aware.
          </p>

          <div style={styles.ctaRow}>
            <a href="/demo" style={styles.primaryBtn}>
              Try the Demo <span style={styles.btnArrow}>→</span>
            </a>

            <a href="#features" style={styles.secondaryBtn}>
              See features
            </a>
          </div>

          <div style={styles.metaRow}>
            <div style={styles.metaPill}>Post-match only</div>
            <div style={styles.metaPill}>No real-time or in-game assistance</div>
            <div style={styles.metaPill}>No automation or scripting</div>
            <div style={styles.metaPill}>No betting / gambling</div>
            <div style={styles.metaPill}>No gameplay modification</div>
          </div>
        </section>

        {/* Feature Card */}
        <section id="features" style={styles.featureCard}>
          <div style={styles.featureHeader}>
            <div>
              <div style={styles.featureTitle}>What you’ll get</div>
              <div style={styles.featureSub}>
                Fast, readable analytics — focused on understanding, not noise.
              </div>
            </div>

            <div style={styles.statusPills}>
              <div style={styles.pill}>LoL</div>
              <div style={styles.pillSoft}>More games soon</div>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.iconWrap}>📊</div>
                <div style={styles.cardTitle}>Recent performance</div>
              </div>
              <div style={styles.cardText}>
                KDA trend, winrate snapshot, and recent match-based signals.
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.iconWrap}>🎯</div>
                <div style={styles.cardTitle}>Role distribution</div>
              </div>
              <div style={styles.cardText}>
                A compact view of your most played roles (based on a recent sample).
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.iconWrap}>🧠</div>
                <div style={styles.cardTitle}>Insights-first UX</div>
              </div>
              <div style={styles.cardText}>
                Minimal noise. Clear visuals. Built for quick interpretation.
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.iconWrap}>🛡️</div>
                <div style={styles.cardTitle}>Policy-aware</div>
              </div>
              <div style={styles.cardText}>
                Designed to avoid automation, gameplay modification, or real-time assistance.
              </div>
            </div>
          </div>
        </section>

        {/* Gold-standard disclaimer */}
        <section style={styles.disclaimerCard}>
          <div style={styles.disclaimerTitle}>Disclaimer</div>
          <div style={styles.disclaimerText}>
            Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
            This product does not provide real-time assistance, automation, gameplay modification,
            or competitive advantage.
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerLeft}>© {new Date().getFullYear()} Nexio.gg</div>
          <div style={styles.footerRight}>
            <a href="/demo" style={styles.footerLink}>Demo</a>
            <span style={styles.dot}>•</span>
            <a href="/terms" style={styles.footerLink}>Terms</a>
            <span style={styles.dot}>•</span>
            <a href="/privacy" style={styles.footerLink}>Privacy</a>
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
      "radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.25), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(59,130,246,0.18), transparent 55%), #0b1020",
    color: "#e8eefc",
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "28px 20px 34px",
  },

  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 26,
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  },
  brandName: { fontWeight: 900, letterSpacing: 0.2 },
  brandSub: { fontSize: 12, color: "rgba(232,238,252,0.7)", marginTop: 2 },

  topActions: { display: "flex", alignItems: "center", gap: 10 },
  topLink: { color: "rgba(232,238,252,0.8)", textDecoration: "none" },
  dot: { opacity: 0.6 },

  hero: {
    padding: "34px 26px",
    borderRadius: 22,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 26px 90px rgba(0,0,0,0.45)",
    backdropFilter: "blur(10px)",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    letterSpacing: 1,
    width: "fit-content",
  },
  h1: {
    margin: "14px 0 10px",
    fontSize: 52,
    lineHeight: 1.05,
    letterSpacing: -0.8,
  },
  gradText: {
    background:
      "linear-gradient(135deg, rgba(124,58,237,1), rgba(59,130,246,1))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  p: { margin: 0, color: "rgba(232,238,252,0.78)", maxWidth: 760 },

  ctaRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(59,130,246,0.9))",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  },
  btnArrow: { opacity: 0.9, fontWeight: 900 },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.9)",
    fontWeight: 800,
    textDecoration: "none",
  },

  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  metaPill: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    fontSize: 12,
    color: "rgba(232,238,252,0.78)",
  },

  featureCard: {
    marginTop: 18,
    padding: "18px 18px",
    borderRadius: 22,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 26px 90px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  featureHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: "6px 6px 14px",
  },
  featureTitle: { fontWeight: 900, fontSize: 14 },
  featureSub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.7)" },
  statusPills: { display: "flex", gap: 10, alignItems: "center" },
  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    fontWeight: 900,
    fontSize: 12,
  },
  pillSoft: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    fontWeight: 800,
    fontSize: 12,
    color: "rgba(232,238,252,0.75)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
    marginTop: 6,
    padding: 6,
  },
  card: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
  },
  cardTop: { display: "flex", alignItems: "center", gap: 10 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  cardTitle: { fontWeight: 900 },
  cardText: { marginTop: 10, color: "rgba(232,238,252,0.72)", fontSize: 12 },

  disclaimerCard: {
    marginTop: 16,
    padding: "16px 18px",
    borderRadius: 22,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  disclaimerTitle: { fontWeight: 900, marginBottom: 6 },
  disclaimerText: { color: "rgba(232,238,252,0.72)", fontSize: 12, maxWidth: 980 },

  footer: {
    marginTop: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    color: "rgba(232,238,252,0.6)",
    fontSize: 12,
    padding: "0 6px",
  },
  footerLeft: { opacity: 0.9 },
  footerRight: { display: "flex", alignItems: "center", gap: 10 },
  footerLink: { color: "rgba(232,238,252,0.8)", textDecoration: "none" },
};
