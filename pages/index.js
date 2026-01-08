export default function Home() {
  return (
    <main style={styles.page}>
      {/* TOP BAR */}
      <header style={styles.topbar}>
        <div style={styles.brand}>
          <div style={styles.logo}>N</div>
          <div>
            <div style={styles.brandName}>Nexio.gg</div>
            <div style={styles.brandSub}>AI-powered esports analytics</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <a href="/terms" style={styles.navLink}>Terms</a>
          <span style={styles.dot}>•</span>
          <a href="/privacy" style={styles.navLink}>Privacy</a>
        </nav>
      </header>

      {/* HERO */}
      <section style={styles.heroCard}>
        <div style={styles.beta}>BETA</div>

        <h1 style={styles.h1}>
          Premium post-match insights for{" "}
          <span style={styles.grad}>League of Legends</span>.
        </h1>

        <p style={styles.heroText}>
          Post-match performance insights based on publicly available match data.
          <br />
          Built for clarity, analysis, and policy compliance.
        </p>

        <div style={styles.ctaRow}>
          <a href="/demo" style={styles.primaryBtn}>
            Try the Demo →
          </a>
          <a href="#features" style={styles.secondaryBtn}>
            See features
          </a>
        </div>

        <div style={styles.chips}>
          <span style={styles.chip}>No real-time or in-game assistance</span>
          <span style={styles.chip}>No automation or scripting</span>
          <span style={styles.chip}>No betting / gambling</span>
          <span style={styles.chip}>No gameplay modification</span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.features}>
        <h2 style={styles.sectionTitle}>What you’ll get</h2>
        <p style={styles.sectionSub}>
          Clean, fast, and readable analytics — built for understanding.
        </p>

        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <div style={styles.icon}>📊</div>
            <h3 style={styles.featureTitle}>Recent performance</h3>
            <p style={styles.featureText}>
              KDA trends, winrate snapshots, and recent match-based signals.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.icon}>✨</div>
            <h3 style={styles.featureTitle}>Insights-first UX</h3>
            <p style={styles.featureText}>
              Minimal noise. Clear visuals. Built for quick interpretation.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.icon}>📈</div>
            <h3 style={styles.featureTitle}>Role distribution</h3>
            <p style={styles.featureText}>
              Compact overview of your most played roles (recent sample).
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.icon}>🛡️</div>
            <h3 style={styles.featureTitle}>Policy-aware design</h3>
            <p style={styles.featureText}>
              Designed to avoid automation, gameplay modification, or real-time assistance.
            </p>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section style={styles.disclaimer}>
        <h3 style={styles.disclaimerTitle}>Disclaimer</h3>
        <p style={styles.disclaimerText}>
          Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
          <br />
          This product does not provide real-time assistance, automation, gameplay modification,
          or competitive advantage.
        </p>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div>© 2026 Nexio.gg</div>
        <div style={styles.footerLinks}>
          <a href="/demo" style={styles.footerLink}>Demo</a>
          <span style={styles.dot}>•</span>
          <a href="/terms" style={styles.footerLink}>Terms</a>
          <span style={styles.dot}>•</span>
          <a href="/privacy" style={styles.footerLink}>Privacy</a>
        </div>
      </footer>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.25), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(59,130,246,0.18), transparent 55%), #0b1020",
    color: "#e8eefc",
    padding: "24px",
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 1200,
    margin: "0 auto 32px",
  },

  brand: { display: "flex", alignItems: "center", gap: 12 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },
  brandName: { fontWeight: 800 },
  brandSub: { fontSize: 12, opacity: 0.7 },

  nav: { display: "flex", alignItems: "center", gap: 12 },
  navLink: { color: "#e8eefc", opacity: 0.8, textDecoration: "none" },
  dot: { opacity: 0.5 },

  heroCard: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "48px",
    borderRadius: 24,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
  },

  beta: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    fontSize: 12,
    marginBottom: 16,
  },

  h1: { fontSize: 48, margin: "0 0 16px" },
  grad: {
    background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  heroText: { maxWidth: 640, opacity: 0.8 },

  ctaRow: { display: "flex", gap: 16, marginTop: 24 },
  primaryBtn: {
    padding: "12px 20px",
    borderRadius: 14,
    background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
    color: "#fff",
    fontWeight: 800,
    textDecoration: "none",
  },
  secondaryBtn: {
    padding: "12px 20px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#e8eefc",
    textDecoration: "none",
  },

  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 28,
  },
  chip: {
    padding: "6px 12px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
  },

  features: {
    maxWidth: 1200,
    margin: "64px auto 0",
  },
  sectionTitle: { fontSize: 28, fontWeight: 900 },
  sectionSub: { opacity: 0.7, marginBottom: 24 },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
  },
  featureCard: {
    padding: 24,
    borderRadius: 20,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  icon: { fontSize: 24, marginBottom: 8 },
  featureTitle: { fontWeight: 800 },
  featureText: { fontSize: 14, opacity: 0.75 },

  disclaimer: {
    maxWidth: 1200,
    margin: "64px auto 0",
    padding: 24,
    borderRadius: 20,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  disclaimerTitle: { fontWeight: 900, marginBottom: 8 },
  disclaimerText: { fontSize: 13, opacity: 0.75 },

  footer: {
    maxWidth: 1200,
    margin: "48px auto 0",
    display: "flex",
    justifyContent: "space-between",
    opacity: 0.6,
    fontSize: 12,
  },
  footerLinks: { display: "flex", gap: 10 },
  footerLink: { color: "#e8eefc", textDecoration: "none" },
};
