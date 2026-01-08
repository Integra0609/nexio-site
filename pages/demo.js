import { useMemo, useState } from "react";

/**
 * ✅ SUPABASE EDGE FUNCTION URL (TAM)
 * Senin project ref: lpoxlbbcmpxbfpfrufvf
 */
const SUPABASE_FN_URL =
  "https://lpoxlbbcmpxbfpfrufvf.supabase.co/functions/v1/get-player-insights";

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

function RoleBars({ roles }) {
  if (!roles?.length) return <div style={styles.muted}>Veri yok</div>;

  // pct’e göre büyükten küçüğe
  const sorted = [...roles].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));

  return (
    <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
      {sorted.map((r) => {
        const pct = Math.max(0, Math.min(100, Number(r.pct ?? 0)));
        const count = Number(r.count ?? 0);

        return (
          <div key={r.role} style={styles.roleRow}>
            <div style={styles.roleMeta}>
              <div style={styles.roleName2}>{r.role}</div>
              <div style={styles.roleSmall}>
                {count} match • {pct}%
              </div>
            </div>

            <div style={styles.barTrack}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${pct}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BestChampionBreakdown({ bestChamp }) {
  if (!bestChamp)
    return (
      <div style={styles.breakdownEmpty}>
        Not enough data yet for a best champion.
      </div>
    );

  // bestChamp beklenen örnek: { champion_name, games, avg_kda }
  const name = bestChamp.champion_name || "-";
  const games = bestChamp.games ?? "-";
  const avgKda = bestChamp.avg_kda ?? "-";

  return (
    <div style={styles.breakdownCard}>
      <div style={styles.breakdownTop}>
        <div style={styles.breakdownLeft}>
          <div style={styles.champIcon}>{name?.slice(0, 1) || "C"}</div>
          <div>
            <div style={styles.breakdownTitle}>{name}</div>
            <div style={styles.breakdownSub}>Best champion (recent)</div>
          </div>
        </div>

        <div style={styles.pill}>READY</div>
      </div>

      <div style={styles.breakdownGrid}>
        <div style={styles.breakdownItem}>
          <div style={styles.breakdownLabel}>Games</div>
          <div style={styles.breakdownValue}>{games}</div>
        </div>
        <div style={styles.breakdownItem}>
          <div style={styles.breakdownLabel}>Avg KDA</div>
          <div style={styles.breakdownValue}>{avgKda}</div>
        </div>
      </div>
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
      const url = `${SUPABASE_FN_URL}?name=${encodeURIComponent(
        trimmed
      )}&region=${encodeURIComponent(region)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setRaw(data);
    } catch (e) {
      setError(e?.message || "Bir hata oluştu.");
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
          </p>
          <p style={{ ...styles.p, marginTop: 6 }}>
            This demo uses limited-rate development API access. Data may be
            partial or incomplete.
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
              <strong>Request failed:</strong> {error}
            </div>
          ) : null}

          {parsed ? (
            <>
              <div style={styles.resultHeader}>
                <div>
                  <div style={styles.resultTitle}>Result</div>
                  <div style={styles.resultMeta}>
                    Displayed data is based on recent available matches and may
                    not represent full account history.
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={styles.pillSmall}>DEMO</div>
                  <div style={styles.okBadge}>{parsed.ok ? "OK" : "NOT OK"}</div>
                </div>
              </div>

              <div style={styles.grid}>
                <StatCard
                  title="Sample size"
                  value={parsed.sampleSize ?? "-"}
                  sub="Analyzed matches (recent)"
                />

                <StatCard
                  title="Last 10 KDA"
                  value={parsed.last10?.kda != null ? parsed.last10.kda : "-"}
                  sub={
                    parsed.last10
                      ? `${parsed.last10.games} game • ${parsed.last10.winrate_pct}% WR`
                      : "No data"
                  }
                />

                <StatCard
                  title="Best champion"
                  value={parsed.bestChamp?.champion_name || "-"}
                  sub={parsed.bestChamp ? "Based on recent games" : "Not enough data yet"}
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={styles.sectionTitle}>Best champion breakdown</div>
                <BestChampionBreakdown bestChamp={parsed.bestChamp} />
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={styles.sectionTitle}>Role distribution</div>
                <RoleBars roles={parsed.roles} />
              </div>
            </>
          ) : (
            <div style={styles.helper}>
              <div style={styles.helperTitle}>Quick test</div>
              <div style={styles.helperText}>
                Summoner yaz → region seç → <strong>Run</strong>. Sonuçlar kartlar
                halinde gelir.
              </div>
            </div>
          )}
        </section>

        <section style={{ ...styles.card, marginTop: 18 }}>
          <div style={styles.sectionTitle}>(Disclaimer)</div>
          <div style={styles.disclaimerText}>
            Nexio.gg is not affiliated with, endorsed, sponsored, or approved by
            Riot Games.
          </div>

          <div style={styles.chips}>
            <div style={styles.chip}>No real-time in-game assistance</div>
            <div style={styles.chip}>No automation or scripting</div>
            <div style={styles.chip}>No betting / gambling</div>
            <div style={styles.chip}>No gameplay modification</div>
            <div style={styles.chip}>No competitive advantage</div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerSmall}>Nexio.gg is not affiliated with Riot Games.</div>
          <div style={styles.footerLinks}>
            <a href="/" style={styles.link}>
              Home
            </a>
            <span style={styles.dot}>•</span>
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
  h1: {
    margin: "12px 0 8px",
    fontSize: 46,
    lineHeight: 1.05,
    fontFamily:
      'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  p: { margin: 0, color: "rgba(232,238,252,0.75)", maxWidth: 760 },

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
  resultMeta: { marginTop: 6, color: "rgba(232,238,252,0.75)", fontSize: 12 },

  pillSmall: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
    fontSize: 12,
  },
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
  statTitle: { fontSize: 12, color: "rgba(232,238,252,0.72)" },
  statValue: { fontSize: 26, fontWeight: 900, marginTop: 6 },
  statSub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.65)" },

  sectionTitle: { marginTop: 10, fontWeight: 900, fontSize: 13 },
  muted: { color: "rgba(232,238,252,0.6)" },

  roleRow: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: 12,
    alignItems: "center",
  },
  roleMeta: { display: "grid", gap: 4 },
  roleName2: { fontWeight: 900, letterSpacing: 0.2 },
  roleSmall: { fontSize: 12, color: "rgba(232,238,252,0.65)" },

  barTrack: {
    height: 12,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(124,58,237,0.95), rgba(59,130,246,0.9), rgba(34,211,238,0.9))",
    boxShadow: "0 0 18px rgba(59,130,246,0.35)",
  },

  breakdownEmpty: {
    marginTop: 10,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
    color: "rgba(232,238,252,0.72)",
  },

  breakdownCard: {
    marginTop: 10,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  breakdownTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  breakdownLeft: { display: "flex", alignItems: "center", gap: 12 },
  champIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(59,130,246,0.25))",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
  },
  breakdownTitle: { fontWeight: 900 },
  breakdownSub: { fontSize: 12, color: "rgba(232,238,252,0.65)", marginTop: 2 },
  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    fontWeight: 900,
    fontSize: 12,
  },
  breakdownGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  breakdownItem: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 12,
  },
  breakdownLabel: { fontSize: 12, color: "rgba(232,238,252,0.65)" },
  breakdownValue: { marginTop: 6, fontWeight: 900 },

  disclaimerText: { marginTop: 8, color: "rgba(232,238,252,0.75)" },
  chips: {
    marginTop: 14,
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    fontWeight: 800,
    fontSize: 12,
    color: "rgba(232,238,252,0.85)",
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
