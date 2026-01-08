export default function About() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.badge}>ABOUT</div>
          <h1 style={styles.h1}>What is Nexio.gg?</h1>

          <p style={styles.p}>
            Nexio.gg is a <strong>post-match</strong> esports analytics product.
            We turn recently available public match data into clean, readable
            insights—built for clarity and review.
          </p>

          <div style={styles.grid}>
            <div style={styles.block}>
              <div style={styles.blockTitle}>What we do</div>
              <div style={styles.blockText}>
                Summaries like KDA trends, role distribution, and recent
                performance signals.
              </div>
            </div>

            <div style={styles.block}>
              <div style={styles.blockTitle}>What we don’t do</div>
              <div style={styles.blockText}>
                No real-time or in-game assistance. No automation or scripting.
                No gameplay modification. No betting/gambling.
              </div>
            </div>

            <div style={styles.block}>
              <div style={styles.blockTitle}>Why we exist</div>
              <div style={styles.blockText}>
                Esports stats are everywhere—understanding is not. Nexio focuses
                on interpretation and simplicity.
              </div>
            </div>
          </div>

          <div style={styles.note}>
            <div style={styles.noteTitle}>Disclaimer</div>
            <div style={styles.noteText}>
              Nexio.gg is not affiliated with, endorsed, sponsored, or approved
              by Riot Games.
            </div>
          </div>

          <div style={styles.actions}>
            <a href="/demo" style={styles.primaryBtn}>
              Try the Demo →
            </a>
            <a href="/how-it-works" style={styles.secondaryBtn}>
              How it works
            </a>
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
  p: { margin: 0, color: "rgba(232,238,252,0.78)", maxWidth: 800, lineHeight: 1.6 },

  grid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  block: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
  },
  blockTitle: { fontWeight: 950, marginBottom: 6 },
  blockText: { fontSize: 13, color: "rgba(232,238,252,0.72)", lineHeight: 1.5 },

  note: {
    marginTop: 16,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  noteTitle: { fontWeight: 950, marginBottom: 4 },
  noteText: { fontSize: 13, color: "rgba(232,238,252,0.72)" },

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
};
