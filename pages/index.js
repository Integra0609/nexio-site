export default function Home() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.badge}>NEXIO.GG</div>
          <h1 style={styles.h1}>AI-powered esports analytics</h1>
          <p style={styles.lead}>
            Post-match performance insights for competitive players.
            <br />
            Starting with League of Legends — more games coming soon.
          </p>

          <div style={styles.ctaRow}>
            <a href="/demo" style={styles.primaryBtn}>
              Try Live Demo
            </a>
            <a href="#what-you-get" style={styles.secondaryBtn}>
              What you get
            </a>
          </div>
        </header>

        <section id="what-you-get" style={styles.card}>
          <h2 style={styles.h2}>What you’ll get</h2>
          <div style={styles.grid}>
            <div style={styles.feature}>
              <div style={styles.featureTitle}>KDA trend</div>
              <div style={styles.featureText}>
                Understand recent performance patterns and consistency.
              </div>
            </div>

            <div style={styles.feature}>
              <div style={styles.featureTitle}>Best champion</div>
              <div style={styles.featureText}>
                Identify your strongest picks based on recent matches.
              </div>
            </div>

            <div style={styles.feature}>
              <div style={styles.featureTitle}>Role distribution</div>
              <div style={styles.featureText}>
                See how your roles split over time and where you perform best.
              </div>
            </div>
          </div>
        </section>

        <section style={{ ...styles.card, marginTop: 14 }}>
          <h2 style={styles.h2}>What Nexio.gg does not do</h2>
          <div style={styles.boundaryWrap}>
            <div style={styles.boundaryItem}>No real-time in-game assistance</div>
            <div style={styles.boundaryItem}>No automation or scripting</div>
            <div style={styles.boundaryItem}>No coaching / decision guidance</div>
            <div style={styles.boundaryItem}>No betting, gambling, or wagering</div>
            <div style={styles.boundaryItem}>No gameplay modification</div>
            <div style={styles.boundaryItem}>No competitive advantages</div>
          </div>

          <div style={styles.disclaimerBox}>
            <div style={styles.disclaimerTitle}>Disclaimer</div>
            <div style={styles.disclaimerText}>
              Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
              Riot Games and associated properties are trademarks or registered trademarks of Riot Games, Inc.
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerLeft}>
            <div style={styles.footerSmall}>© {new Date().getFullYear()} Nexio.gg</div>
            <div style={styles.footerSmall}>
              Nexio.gg is not affiliated with Riot Games.
            </div>
          </div>

          <div style={styles.footerLinks}>
            <a href="/terms" style={styles.link}>Terms</a>
            <span style={styles.dot}>•</span>
            <a href="/privacy" style={styles.link}>Privacy</a>
            <span style={styles.dot}>•</span>
            <a href="/demo" style={styles.link}>Demo</a>
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
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  container: { maxWidth: 980, margin: "0 auto", padding: "56px 20px 28px" },
  header: { marginBottom: 18 },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    letterSpacing: 1,
  },
  h1: { margin: "14px 0 10px", fontSize: 46, lineHeight: 1.05, fontWeight: 900 },
  lead: { margin: 0, color: "rgba(232,238,252,0.78)", maxWidth: 720, fontSize: 16, lineHeight: 1.6 },
  ctaRow: { display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" },
  primaryBtn: {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.85))",
    color: "#fff",
    fontWeight: 800,
    textDecoration: "none",
  },
  secondaryBtn: {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.9)",
    fontWeight: 800,
    textDecoration: "none",
  },

  card: {
    marginTop: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  h2: { margin: 0, fontSize: 16, fontWeight: 900 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
    marginTop: 14,
  },
  feature: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  featureTitle: { fontWeight: 900, marginBottom: 6 },
  featureText: { color: "rgba(232,238,252,0.72)", fontSize: 13, lineHeight: 1.5 },

  boundaryWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  boundaryItem: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    fontSize: 12,
    color: "rgba(232,238,252,0.85)",
    fontWeight: 700,
  },
  disclaimerBox: {
    marginTop: 14,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
    padding: 14,
  },
  disclaimerTitle: { fontWeight: 900, fontSize: 13, marginBottom: 6 },
  disclaimerText: { color: "rgba(232,238,252,0.70)", fontSize: 12, lineHeight: 1.6 },

  footer: {
    marginTop: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    color: "rgba(232,238,252,0.65)",
    fontSize: 12,
  },
  footerLeft: { display: "flex", flexDirection: "column", gap: 6 },
  footerSmall: { opacity: 0.9 },
  footerLinks: { display: "flex", alignItems: "center", gap: 10 },
  link: { color: "rgba(232,238,252,0.85)", textDecoration: "none", fontWeight: 700 },
  dot: { opacity: 0.6 },
};
