import { useMemo, useState } from "react";

/* =========================
   SUPABASE CONFIG
========================= */
const SUPABASE_PROJECT_REF = "lpoxlbbcmpxbfpfrufvf";
const SUPABASE_FN_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/get-player-insights`;

// Raw JSON'u production'da gizle (Riot review için daha clean)
const SHOW_RAW = process.env.NODE_ENV !== "production";

const regions = [
  { value: "tr1", label: "TR (tr1)" },
  { value: "euw1", label: "EUW (euw1)" },
  { value: "na1", label: "NA (na1)" },
  { value: "kr", label: "KR (kr)" },
];

function StatCard({ title, value, sub }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
      {sub ? <div style={styles.statSub}>{sub}</div> : null}
    </div>
  );
}

export default function Demo() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState(null);

  const parsed = useMemo(() => {
    if (!raw?.insights) return null;

    const s = raw.insights.sample_size ?? null;
    const last10 = raw.insights.kda_trend?.last_10 ?? null;
    const bestChamp = raw.insights.best_champion ?? null;
    const roles = raw.insights.role_distribution ?? [];

    return { sampleSize: s, last10, bestChamp, roles, puuid: raw.puuid, ok: raw.ok };
  }, [raw]);

  const run = async () => {
    setError(null);
    setRaw(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Summoner name gerekli.");
      return;
    }

    setLoading(true);
    try {
      const url = `${SUPABASE_FN_URL}?name=${encodeURIComponent(trimmed)}&region=${encodeURIComponent(region)}`;

      const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          "Demo request failed. This demo runs on limited development API access. Please try again later.";
        throw new Error(msg);
      }

      setRaw(data);
    } catch (e) {
      setError(e?.message || "Demo request failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const onEnter = (e) => {
    if (e.key === "Enter") run();
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.badge}>DEMO</div>
          <h1 style={styles.h1}>Nexio.gg Insights</h1>
          <p style={styles.p}>
            Post-match performance insights using publicly available game data.
            <br />
            <span style={styles.muted}>
              This demo uses limited-rate development API access. Data may be partial or incomplete.
            </span>
          </p>
        </header>

        <section style={styles.card}>
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label}>Summoner name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={onEnter}
                placeholder="örn: faker"
                style={styles.input}
                autoComplete="off"
              />
            </div>

            <div style={styles.fieldSmall}>
              <label style={styles.label}>Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} style={styles.select}>
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldSmall}>
              <label style={styles.label}>&nbsp;</label>
              <button
                onClick={run}
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Analyzing..." : "Run"}
              </button>
            </div>
          </div>

          {error ? (
            <div style={styles.alertError}>
              <strong>Request failed:</strong>{" "}
              <span style={{ opacity: 0.95 }}>
                {error}
              </span>
            </div>
          ) : null}

          {parsed ? (
            <>
              <div style={styles.resultHeader}>
                <div>
                  <div style={styles.resultTitle}>Result</div>
                  <div style={styles.resultMeta}>
                    Displayed data is based on recent available matches and may not represent full account history.
                  </div>
                </div>
                <div style={styles.okBadge}>{parsed.ok ? "OK" : "NOT OK"}</div>
              </div>

              <div style={styles.grid}>
                <StatCard title="Sample size" value={parsed.sampleSize ?? "-"} sub="Analyzed matches (recent)" />

                <StatCard
                  title="Last 10 KDA"
                  value={parsed.last10?.kda != null ? parsed.last10.kda : "-"}
                  sub={
                    parsed.last10
                      ? `${parsed.last10.games} game • ${parsed.last10.winrate_pct}% WR`
                      : "Not enough data yet"
                  }
                />

                <StatCard
                  title="Best champion"
                  value={parsed.bestChamp?.champion_name || "-"}
                  sub={
                    parsed.bestChamp
                      ? `Games: ${parsed.bestChamp.games} • Avg KDA: ${parsed.bestChamp.avg_kda}`
                      : "Not enough data yet"
                  }
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={styles.sectionTitle}>Role distribution</div>
                <div style={styles.rolesWrap}>
                  {parsed.roles?.length ? (
                    parsed.roles.map((r) => (
                      <div key={r.role} style={styles.rolePill}>
                        <span style={styles.roleName}>{r.role}</span>
                        <span style={styles.rolePct}>{r.pct}%</span>
                        <span style={styles.roleCount}>{r.count}</span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.muted}>No role data</div>
                  )}
                </div>
              </div>

              {SHOW_RAW ? (
                <details style={styles.details}>
                  <summary style={styles.summary}>Raw JSON (dev only)</summary>
                  <pre style={styles.pre}>{JSON.stringify(raw, null, 2)}</pre>
                </details>
              ) : null}
            </>
          ) : (
            <div style={styles.helper}>
              <div style={styles.helperTitle}>Quick test</div>
              <div style={styles.helperText}>
                Summoner yaz → region seç → <strong>Run</strong>. Sonuçlar kartlar halinde gelir.
              </div>
            </div>
          )}
        </section>

        <section style={{ ...styles.card, marginTop: 14 }}>
          <h2 style={styles.h2}>Disclaimer</h2>
          <p style={{ ...styles.p, marginTop: 8 }}>
            Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
          </p>
          <div style={styles.boundaryWrap}>
            <div style={styles.boundaryItem}>No real-time in-game assistance</div>
            <div style={styles.boundaryItem}>No automation or scripting</div>
            <div style={styles.boundaryItem}>No betting / gambling</div>
            <div style={styles.boundaryItem}>No gameplay modification</div>
            <div style={styles.boundaryItem}>No competitive advantage</div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerSmall}>Nexio.gg is not affiliated with Riot Games.</div>
          <div style={styles.footerLinks}>
            <a href="/" style={styles.link}>Home</a>
            <span style={styles.dot}>•</span>
            <a href="/terms" style={styles.link}>Terms</a>
            <span style={styles.dot}>•</span>
            <a href="/privacy" style={styles.link}>Privacy</a>
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
  h1: { margin: "12px 0 8px", fontSize: 40, lineHeight: 1.1, fontWeight: 900 },
  h2: { margin: 0, fontSize: 16, fontWeight: 900 },
  p: { margin: 0, color: "rgba(232,238,252,0.78)", maxWidth: 760, lineHeight: 1.6 },
  muted: { color: "rgba(232,238,252,0.62)" },

  card: {
    marginTop: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },

  formRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  field: { flex: "1 1 320px", minWidth: 240 },
  fieldSmall: { flex: "0 0 180px", minWidth: 160 },
  label: { display: "block", fontSize: 12, color: "rgba(232,238,252,0.75)", marginBottom: 6 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e8eefc",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e8eefc",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.85))",
    color: "#fff",
    fontWeight: 800,
  },

  alertError: {
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.10)",
    color: "#ffd7d7",
  },

  helper: {
    marginTop: 16,
    padding: "14px 14px",
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.03)",
  },
  helperTitle: { fontWeight: 900, marginBottom: 6 },
  helperText: { color: "rgba(232,238,252,0.78)" },

  resultHeader: {
    marginTop: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.10)",
  },
  resultTitle: { fontWeight: 900, fontSize: 14 },
  resultMeta: { marginTop: 6, color: "rgba(232,238,252,0.72)", fontSize: 12, maxWidth: 640 },
  okBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    fontWeight: 900,
    fontSize: 12,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    marginTop: 14,
  },
  statCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  statTitle: { fontSize: 12, color: "rgba(232,238,252,0.72)", fontWeight: 800 },
  statValue: { fontSize: 22, fontWeight: 950, marginTop: 6 },
  statSub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.65)" },

  sectionTitle: { marginTop: 10, fontWeight: 950, fontSize: 13 },
  rolesWrap: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 },
  rolePill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
  },
  roleName: { fontWeight: 950 },
  rolePct: { color: "rgba(232,238,252,0.75)", fontSize: 12 },
  roleCount: {
    marginLeft: 6,
    fontSize: 12,
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
  },

  details: {
    marginTop: 18,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
    padding: 12,
  },
  summary: { cursor: "pointer", fontWeight: 900 },
  pre: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    background: "rgba(0,0,0,0.35)",
    overflowX: "auto",
    fontSize: 12,
    color: "rgba(232,238,252,0.92)",
  },

  boundaryWrap: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 },
  boundaryItem: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    fontSize: 12,
    color: "rgba(232,238,252,0.85)",
    fontWeight: 800,
  },

  footer: {
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    color: "rgba(232,238,252,0.65)",
    fontSize: 12,
  },
  footerSmall: { opacity: 0.9 },
  footerLinks: { display: "flex", alignItems: "center", gap: 10 },
  link: { color: "rgba(232,238,252,0.85)", textDecoration: "none", fontWeight: 800 },
  dot: { opacity: 0.6 },
};
