import { useMemo, useState } from "react";

const SUPABASE_FN_BASE =
  "https://lpxlbbcmpxbfprufvf.supabase.co/functions/v1/get-player-insights";

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

    return {
      sampleSize: s,
      last10,
      bestChamp,
      roles,
      puuid: raw.puuid,
      ok: raw.ok,
    };
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
      const url = `${SUPABASE_FN_BASE}?name=${encodeURIComponent(
        trimmed
      )}&region=${encodeURIComponent(region)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setRaw(data);
    } catch (e) {
      setError(e.message || "Bir hata oluştu.");
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
            AI-powered esports analytics. League of Legends için başlangıç — daha
            fazlası yolda.
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
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={styles.select}
              >
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
                {loading ? "Running..." : "Run"}
              </button>
            </div>
          </div>

          {error ? (
            <div style={styles.alertError}>
              <strong>Hata:</strong> {error}
            </div>
          ) : null}

          {parsed ? (
            <>
              <div style={styles.resultHeader}>
                <div>
                  <div style={styles.resultTitle}>Result</div>
                  <div style={styles.resultMeta}>
                    PUUID: <span style={styles.mono}>{parsed.puuid}</span>
                  </div>
                </div>
                <div style={styles.okBadge}>
                  {parsed.ok ? "OK" : "NOT OK"}
                </div>
              </div>

              <div style={styles.grid}>
                <StatCard
                  title="Sample size"
                  value={parsed.sampleSize ?? "-"}
                  sub="Analiz edilen match sayısı"
                />

                <StatCard
                  title="Last 10 KDA"
                  value={
                    parsed.last10?.kda != null ? parsed.last10.kda : "-"
                  }
                  sub={
                    parsed.last10
                      ? `${parsed.last10.games} game • ${parsed.last10.winrate_pct}% WR`
                      : "Veri yok"
                  }
                />

                <StatCard
                  title="Best champion"
                  value={parsed.bestChamp?.champion_name || "-"}
                  sub={
                    parsed.bestChamp
                      ? `Games: ${parsed.bestChamp.games} • Avg KDA: ${parsed.bestChamp.avg_kda}`
                      : "Henüz yeterli veri yok"
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
                    <div style={styles.muted}>Veri yok</div>
                  )}
                </div>
              </div>

              <details style={styles.details}>
                <summary style={styles.summary}>Raw JSON</summary>
                <pre style={styles.pre}>{JSON.stringify(raw, null, 2)}</pre>
              </details>
            </>
          ) : (
            <div style={styles.helper}>
              <div style={styles.helperTitle}>Hızlı test</div>
              <div style={styles.helperText}>
                Summoner yaz → region seç → <strong>Run</strong>. Sonuçları kart
                halinde göreceksin.
              </div>
            </div>
          )}
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerSmall}>
            Nexio.gg is not affiliated with Riot Games.
          </div>
          <div style={styles.footerLinks}>
            <a href="/terms" style={styles.link}>
              Terms
            </a>
            <span style={styles.dot}>•</span>
            <a href="/privacy" style={styles.link}>
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
      "radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.25), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(59,130,246,0.18), transparent 55%), #0b1020",
    color: "#e8eefc",
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "48px 20px 28px",
  },
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
  h1: { margin: "12px 0 8px", fontSize: 40, lineHeight: 1.1 },
  p: { margin: 0, color: "rgba(232,238,252,0.75)", maxWidth: 700 },

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
  label: {
    display: "block",
    fontSize: 12,
    color: "rgba(232,238,252,0.75)",
    marginBottom: 6,
  },
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
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.85))",
    color: "#fff",
    fontWeight: 700,
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
  helperTitle: { fontWeight: 800, marginBottom: 6 },
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
  resultTitle: { fontWeight: 800, fontSize: 14 },
  resultMeta: { marginTop: 6, color: "rgba(232,238,252,0.75)", fontSize: 12 },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  okBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    fontWeight: 800,
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
  statTitle: { fontSize: 12, color: "rgba(232,238,252,0.72)" },
  statValue: { fontSize: 22, fontWeight: 900, marginTop: 6 },
  statSub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.65)" },

  sectionTitle: { marginTop: 10, fontWeight: 900, fontSize: 13 },
  rolesWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  rolePill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
  },
  roleName: { fontWeight: 900 },
  rolePct: { color: "rgba(232,238,252,0.75)", fontSize: 12 },
  roleCount: {
    marginLeft: 6,
    fontSize: 12,
    padding: "3px 8px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  muted: { color: "rgba(232,238,252,0.6)" },

  details: {
    marginTop: 18,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
    padding: 12,
  },
  summary: { cursor: "pointer", fontWeight: 800 },
  pre: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    background: "rgba(0,0,0,0.35)",
    overflowX: "auto",
    fontSize: 12,
    color: "rgba(232,238,252,0.92)",
  },

  footer: {
    marginTop: 16,
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
  link: { color: "rgba(232,238,252,0.80)", textDecoration: "none" },
  dot: { opacity: 0.6 },
};
