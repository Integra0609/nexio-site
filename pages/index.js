// pages/index.js
import Link from "next/link";

export default function Home() {
  return (
    <main style={styles.main}>
      <section style={styles.heroCard}>
        <div style={styles.badge}>BETA</div>

        <h1 style={styles.h1}>
          Post-match insights for{" "}
          <span style={styles.grad}>esports</span>.
        </h1>

        <p style={styles.p}>
          Clean performance summaries based on publicly available match data.
          Built for clarity — designed to be policy-aware.
        </p>

        <div style={styles.actions}>
          <Link href="/analyzer" style={styles.primaryBtn}>
            Open Analyzer <span style={styles.arrow}>→</span>
          </Link>
          <Link href="/how-it-works" style={styles.secondaryBtn}>
            How it works
          </Link>
        </div>

        <div style={styles.chips}>
          <span style={styles.chip}>Post-match only</span>
          <span style={styles.chip}>No real-time assistance</span>
          <span style={styles.chip}>No automation</span>
          <span style={styles.chip}>No gameplay modification</span>
          <span style={styles.chipSoft}>Currently: League of Legends</span>
          <span style={styles.chipSoft}>More games soon</span>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <div style={styles.sectionTitle}>What you’ll get</div>
            <div style={styles.sectionSub}>
              Clean, fast, and readable analytics — built for clarity.
            </div>
          </div>
          <div style={styles.pills}>
            <span style={styles.pill}>LoL</span>
            <span style={styles.pill}>More soon</span>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📊</div>
            <div style={styles.featureTitle}>Recent performance</div>
            <div style={styles.featureText}>
              KDA trend, winrate snapshot, and recent match-based signals.
            </div>
          </div>

          <div style={styles.feature}>
            <div style={styles.featureIcon}>🧠</div>
            <div style={styles.featureTitle}>Insights-first UX</div>
            <div style={styles.featureText}>
              Minimal noise. Clear visuals. Built for quick understanding.
            </div>
          </div>

          <div style={styles.feature}>
            <div style={styles.featureIcon}>🎯</div>
            <div style={styles.featureTitle}>Role distribution</div>
            <div style={styles.featureText}>
              A compact overview of your most played roles (recent sample).
            </div>
          </div>

          <div style={styles.feature}>
            <div style={styles.featureIcon}>🛡️</div>
            <div style={styles.featureTitle}>Policy-aware</div>
            <div style={styles.featureText}>
              Designed to avoid automation, gameplay modification, or real-time assistance.
            </div>
          </div>
        </div>
      </section>

      <section style={styles.disclaimer}>
        <div style={styles.disclaimerTitle}>Disclaimer</div>
        <div style={styles.disclaimerText}>
          Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
        </div>
      </section>
    </main>
  );
}

const styles = {
  main: { maxWidth: 1160, margin: "0 auto", padding: "28px 20px 0" },
  heroCard: {
    marginTop: 18,
    padding: "30px 26px",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    boxShadow: "0 30px 110px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: 800,
  },
  h1: { margin: "14px 0 10px", fontSize: 54, lineHeight: 1.05 },
  grad: {
    background: "linear-gradient(90deg, #7c3aed, #38bdf8)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  p: { margin: 0, maxWidth: 860, color: "rgba(232,238,252,0.72)", fontSize: 16, lineHeight: 1.6 },
  actions: { marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" },
  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 900,
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.85))",
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
  },
  secondaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "12px 16px",
    borderRadius: 14,
    textDecoration: "none",
    fontWeight: 900,
    color: "rgba(232,238,252,0.9)",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
  },
  arrow: { opacity: 0.9 },
  chips: { marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" },
  chip: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    fontSize: 12,
    color: "rgba(232,238,252,0.78)",
    fontWeight: 700,
  },
  chipSoft: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(124,58,237,0.22)",
    background: "rgba(124,58,237,0.12)",
    fontSize: 12,
    color: "rgba(232,238,252,0.82)",
    fontWeight: 800,
  },
  section: {
    marginTop: 18,
    padding: "22px 22px",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(10px)",
  },
  sectionHeader: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" },
  sectionTitle: { fontSize: 16, fontWeight: 900 },
  sectionSub: { marginTop: 4, fontSize: 13, color: "rgba(232,238,252,0.65)" },
  pills: { display: "flex", gap: 10, alignItems: "center" },
  pill: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(232,238,252,0.78)",
  },
  grid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  feature: {
    padding: 16,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
  },
  featureIcon: { fontSize: 18 },
  featureTitle: { marginTop: 10, fontWeight: 900 },
  featureText: { marginTop: 6, color: "rgba(232,238,252,0.65)", fontSize: 13, lineHeight: 1.5 },
  disclaimer: {
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
  },
  disclaimerTitle: { fontWeight: 900 },
  disclaimerText: { marginTop: 6, color: "rgba(232,238,252,0.65)", fontSize: 13 },
};
