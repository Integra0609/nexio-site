export default function Home() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* HERO */}
        <section style={styles.heroCard}>
          <div style={styles.badge}>BETA</div>

          <h1 style={styles.h1}>
            Post-match insights for{" "}
            <span style={styles.grad}>League of Legends</span>.
          </h1>

          <p style={styles.p}>
            Clean performance summaries based on recently available public match
            data. Built for clarity — designed to be policy-aware.
          </p>

          <div style={styles.ctaRow}>
            <a href="/demo" style={styles.primaryBtn}>
              Try the Demo <span style={styles.arrow}>→</span>
            </a>
            <a href="/how-it-works" style={styles.secondaryBtn}>
              How it works
            </a>
          </div>

          <div style={styles.chips}>
            <span style={styles.chip}>Post-match only</span>
            <span style={styles.chip}>No real-time assistance</span>
            <span style={styles.chip}>No automation</span>
            <span style={styles.chip}>No gameplay modification</span>
          </div>
        </section>

        {/* DEPTH: 3 STEPS */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>How it works</h2>
            <p style={styles.sectionSub}>
              Three simple steps — fast, readable, and post-match.
            </p>
          </div>

          <div style={styles.stepsGrid}>
            <div style={styles.stepCard}>
              <div style={styles.stepTop}>
                <div style={styles.stepNum}>1</div>
                <div style={styles.stepTitle}>Enter a summoner</div>
              </div>
              <div style={styles.stepText}>
                Choose a region and request insights for recent matches.
              </div>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepTop}>
                <div style={styles.stepNum}>2</div>
                <div style={styles.stepTitle}>Fetch recent public matches</div>
              </div>
              <div style={styles.stepText}>
                We analyze a limited recent sample during beta. Results may be partial.
              </div>
            </div>

            <div style={styles.stepCard}>
              <div style={styles.stepTop}>
                <div style={styles.stepNum}>3</div>
                <div style={styles.stepTitle}>Get clean insights</div>
              </div>
              <div style={styles.stepText}>
                KDA trend, role distribution, best champion breakdown — easy to read.
              </div>
            </div>
          </div>

          <div style={styles.sectionCtaRow}>
            <a href="/demo" style={styles.primaryBtnSmall}>
              Run a quick test →
            </a>
            <a href="/how-it-works" style={styles.secondaryBtnSmall}>
              Learn more
            </a>
          </div>
        </section>

        {/* DEPTH: WHY NEXIO */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Why Nexio</h2>
            <p style={styles.sectionSub}>
              Most sites give raw stats. Nexio focuses on understanding.
            </p>
          </div>

          <div style={styles.whyGrid}>
            <div style={styles.whyCard}>
              <div style={styles.whyIcon}>🧠</div>
              <div style={styles.whyTitle}>Insight-first</div>
              <div style={styles.whyText}>
                We summarize patterns so you can interpret performance quickly.
              </div>
            </div>

            <div style={styles.whyCard}>
              <div style={styles.whyIcon}>✨</div>
              <div style={styles.whyTitle}>Clean UX</div>
              <div style={styles.whyText}>
                Minimal noise. Premium visuals. Built for speed and readability.
              </div>
            </div>

            <div style={styles.whyCard}>
              <div style={styles.whyIcon}>🛡️</div>
              <div style={styles.whyTitle}>Policy-aware</div>
              <div style={styles.whyText}>
                Post-match only. No real-time assistance, automation, or gameplay modification.
              </div>
            </div>
          </div>
        </section>

        {/* TRUST + DISCLAIMER */}
        <section style={styles.disclaimerCard}>
          <div style={styles.disclaimerTitle}>Disclaimer</div>
          <div style={styles.disclaimerText}>
            Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
            This product does not provide real-time assistance, automation, gameplay modification,
            or competitive advantage.
          </div>

          <div style={styles.disclaimerChips}>
            <span style={styles.chipSoft}>No betting / gambling</span>
            <span style={styles.chipSoft}>No in-game advantage</span>
            <span style={styles.chipSoft}>Post-match analytics</span>
          </div>
        </section>
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
    padding: "30px 20px 46px",
  },

  heroCard: {
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
  },
  h1: {
    margin: "14px 0 10px",
    fontSize: 52,
    lineHeight: 1.05,
    letterSpacing: -0.8,
  },
  grad: {
    background: "linear-gradient(135deg, #7C3AED, #3B82F6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  p: { margin: 0, color: "rgba(232,238,252,0.78)", maxWidth: 780, lineHeight: 1.6 },

  ctaRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(59,130,246,0.9))",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
  },
  arrow: { opacity: 0.95, fontWeight: 900 },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.9)",
    fontWeight: 850,
    textDecoration: "none",
  },

  chips: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 },
  chip: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    fontSize: 12,
    color: "rgba(232,238,252,0.78)",
    fontWeight: 850,
  },

  section: { marginTop: 18 },
  sectionHeader: {
    padding: "14px 6px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  sectionTitle: { margin: 0, fontSize: 22, fontWeight: 950 },
  sectionSub: { margin: 0, color: "rgba(232,238,252,0.70)", maxWidth: 820 },

  stepsGrid: {
    marginTop: 10,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  stepCard: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
    boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
  },
  stepTop: { display: "flex", alignItems: "center", gap: 10 },
  stepNum: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  stepTitle: { fontWeight: 950 },
  stepText: { marginTop: 10, fontSize: 13, color: "rgba(232,238,252,0.72)", lineHeight: 1.5 },

  sectionCtaRow: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", padding: "0 6px" },
  primaryBtnSmall: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.90), rgba(59,130,246,0.85))",
    color: "#fff",
    fontWeight: 900,
    textDecoration: "none",
  },
  secondaryBtnSmall: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.9)",
    fontWeight: 850,
    textDecoration: "none",
  },

  whyGrid: {
    marginTop: 10,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  whyCard: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
  },
  whyIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.10)",
    marginBottom: 10,
  },
  whyTitle: { fontWeight: 950, marginBottom: 6 },
  whyText: { fontSize: 13, color: "rgba(232,238,252,0.72)", lineHeight: 1.5 },

  disclaimerCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 22,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  disclaimerTitle: { fontWeight: 950, marginBottom: 6 },
  disclaimerText: { fontSize: 12, color: "rgba(232,238,252,0.72)", lineHeight: 1.6, maxWidth: 980 },
  disclaimerChips: { marginTop: 10, display: "flex", flexWrap: "wrap", gap: 10 },
  chipSoft: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    fontSize: 12,
    color: "rgba(232,238,252,0.72)",
    fontWeight: 850,
  },
};
