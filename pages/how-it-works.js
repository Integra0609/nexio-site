export default function HowItWorks() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.badge}>HOW IT WORKS</div>
          <h1 style={styles.h1}>How Nexio.gg works</h1>

          <p style={styles.p}>
            Nexio.gg generates <strong>post-match</strong> insights from recently
            available public match data. It is designed to be transparent,
            policy-aware, and easy to understand.
          </p>

          <div style={styles.steps}>
            <div style={styles.step}>
              <div style={styles.stepNum}>1</div>
              <div>
                <div style={styles.stepTitle}>You enter a summoner name</div>
                <div style={styles.stepText}>
                  Choose a region and request a summary.
                </div>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepNum}>2</div>
              <div>
                <div style={styles.stepTitle}>We fetch recent match data</div>
                <div style={styles.stepText}>
                  Using limited-rate development API access during beta. Results
                  may be partial.
                </div>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepNum}>3</div>
              <div>
                <div style={styles.stepTitle}>We compute summaries</div>
                <div style={styles.stepText}>
                  KDA trend, role distribution, and best champion breakdown
                  based on a recent sample.
                </div>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepNum}>4</div>
              <div>
                <div style={styles.stepTitle}>You get readable insights</div>
                <div style={styles.stepText}>
                  Built for review and learning—not for real-time gameplay
                  guidance.
                </div>
              </div>
            </div>
          </div>

          <div style={styles.rulesCard}>
            <div style={styles.rulesTitle}>Policy & Safety</div>
            <div style={styles.rulesGrid}>
              <div style={styles.rule}>Post-match only</div>
              <div style={styles.rule}>No real-time or in-game assistance</div>
              <div style={styles.rule}>No automation or scripting</div>
              <div style={styles.rule}>No gameplay modification</div>
              <div style={styles.rule}>No competitive advantage</div>
              <div style={styles.rule}>No betting / gambling</div>
            </div>
          </div>

          <div style={styles.actions}>
            <a href="/demo" style={styles.primaryBtn}>
              Open Demo →
            </a>
            <a href="/" style={styles.secondaryBtn}>
              Back to Home
            </a>
          </div>

          <div style={styles.note}>
            Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
          </div>
        </div>
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
  container: { maxWidth: 980, margin: "0 auto", padding: "40px 20px" },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
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
  h1: { margin: "12px 0 10px", fontSize: 40, lineHeight: 1.1 },
  p: { margin: 0, color: "rgba(232,238,252,0.78)", maxWidth: 820, lineHeight: 1.6 },

  steps: { marginTop: 18, display: "grid", gap: 12 },
  step: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
  },
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
  stepTitle: { fontWeight: 950, marginBottom: 4 },
  stepText: { fontSize: 13, color: "rgba(232,238,252,0.72)", lineHeight: 1.5 },

  rulesCard: {
    marginTop: 16,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  rulesTitle: { fontWeight: 950, marginBottom: 10 },
  rulesGrid: { display: "flex", flexWrap: "wrap", gap: 10 },
  rule: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    fontSize: 12,
    fontWeight: 900,
    color: "rgba(232,238,252,0.85)",
  },

  actions: { marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" },
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
  },
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

  note: {
    marginTop: 16,
    fontSize: 12,
    color: "rgba(232,238,252,0.65)",
  },
};
