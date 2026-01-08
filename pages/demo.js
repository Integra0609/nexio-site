import { useMemo, useState } from "react";

const SUPABASE_PROJECT_REF = "lpoxlbbcmpxbfpfrufvf";
const SUPABASE_FN_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/get-player-insights`;

const regions = [
  { value: "tr1", label: "TR (tr1)" },
  { value: "euw1", label: "EUW (euw1)" },
  { value: "na1", label: "NA (na1)" },
  { value: "kr", label: "KR (kr)" },
];

function clampPct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

function StatCard({ title, value, sub }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
      {sub ? <div style={styles.statSub}>{sub}</div> : null}
    </div>
  );
}

function RoleBars({ roles = [] }) {
  const normalized = (roles || [])
    .map((r) => ({
      role: String(r.role || "UNKNOWN"),
      pct: clampPct(r.pct),
      count: Number(r.count || 0),
    }))
    .sort((a, b) => b.pct - a.pct);

  if (!normalized.length) {
    return <div style={styles.muted}>No role data available yet.</div>;
  }

  return (
    <div style={styles.roleList}>
      {normalized.map((r) => (
        <div key={r.role} style={styles.roleRow}>
          <div style={styles.roleLeft}>
            <div style={styles.roleName}>{r.role}</div>
            <div style={styles.roleSmall}>
              {r.count} match • {r.pct}%
            </div>
          </div>

          <div style={styles.roleBarTrack}>
            <div style={{ ...styles.roleBarFill, width: `${r.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BestChampionBreakdown({ bestChamp }) {
  if (!bestChamp) {
    return (
      <div style={styles.breakEmpty}>
        Not enough data yet to determine a best champion.
      </div>
    );
  }

  const name = bestChamp?.champion_name || "-";
  const games = bestChamp?.games ?? "-";
  const avgKda = bestChamp?.avg_kda ?? "-";

  return (
    <div style={styles.breakCard}>
      <div style={styles.breakTop}>
        <div style={styles.breakLeft}>
          <div style={styles.champIcon}>{String(name).slice(0, 1)}</div>
          <div>
            <div style={styles.breakTitle}>{name}</div>
            <div style={styles.breakSub}>Best champion (recent sample)</div>
          </div>
        </div>
        <div style={styles.pill}>READY</div>
      </div>

      <div style={styles.breakGrid}>
        <div style={styles.breakItem}>
          <div style={styles.breakLabel}>Games</div>
          <div style={styles.breakValue}>{games}</div>
        </div>
        <div style={styles.breakItem}>
          <div style={styles.breakLabel}>Avg KDA</div>
          <div style={styles.breakValue}>{avgKda}</div>
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
      ok: !!raw.ok,
      source: raw.source || "demo",
      sampleSize: s,
      last10,
      bestChamp,
      roles,
      puuid: raw.puuid || null,
    };
  }, [raw]);

  const run = async () => {
    setError(null);
    setRaw(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a summoner name.");
      return;
    }

    setLoading(true);
    try {
      const url = `${SUPABASE_FN_URL}?name=${encodeURIComponent(
        trimmed
      )}&region=${encodeURIComponent(region)}`;

      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(url, { method: "GET", signal: controller.signal }).finally(
        () => clearTimeout(t)
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          data?.error ||
          data?.message ||
          `Request failed (HTTP ${res.status})`;
        throw new Error(msg);
      }

      setRaw(data);
    } catch (e) {
      const msg =
        e?.name === "AbortError"
          ? "Request timed out. Please try again."
          : e?.message || "Failed to fetch.";
      setError(msg);
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
            Post-match performance insights based on recently available public match data.
          </p>
          <p style={{ ...styles.p, marginTop: 6 }}>
            This demo uses limited-rate development API access. Results may be partial and are shown for demonstration purposes only.
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
                placeholder="e.g. faker"
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
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Analyzing..." : "Run"}
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
                    Insights are derived from a limited recent match sample and may not represent full account history.
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={styles.sourcePill}>{String(parsed.source).toUpperCase()}</div>
                  <div style={styles.okBadge}>{parsed.ok ? "OK" : "CHECK"}</div>
                </div>
              </div>

              <div style={styles.grid}>
                <StatCard
                  title="Sample size"
                  value={parsed.sampleSize ?? "-"}
                  sub="Analyzed matches (recent)"
                />

                <StatCard
                  title="Recent KDA"
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
                  sub={parsed.bestChamp ? "Based on recent sample" : "Not enough data yet"}
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={styles.sectionTitle}>Best champion breakdown</div>
                <div style={styles.subCard}>
                  <BestChampionBreakdown bestChamp={parsed.bestChamp} />
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={styles.sectionTitle}>Role distribution</div>
                <div style={styles.subCard}>
                  <RoleBars roles={parsed.roles} />
                </div>
              </div>
            </>
          ) : (
            <div style={styles.helper}>
              <div style={styles.helperTitle}>Quick test</div>
              <div style={styles.helperText}>
                Enter a summoner → pick a region → <strong>Run</strong>.
              </div>
            </div>
          )}
        </section>

        <section style={styles.disclaimerCard}>
          <div style={styles.disclaimerTitle}>Disclaimer</div>
          <div style={styles.disclaimerText}>
            Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
            This product does not provide real-time assistance, automation, gameplay modification,
            or competitive advantage.
          </div>

          <div style={styles.chips}>
            <div style={styles.chip}>Post-match only</div>
            <div style={styles.chip}>No real-time assistance</div>
            <div style={styles.chip}>No automation</div>
            <div style={styles.chip}>No gameplay modification</div>
            <div style={styles.chip}>No competitive advantage</div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerSmall}>© {new Date().getFullYear()} Nexio.gg</div>
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
  },
  container: {
    maxWidth: 1040,
    margin: "0 auto",
    padding: "44px 20px 28px",
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
  p: { margin: 0, color: "rgba(232,238,252,0.75)", maxWidth: 820 },

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
  field: { flex: "1 1 340px", minWidth: 240 },
  fieldSmall: { flex: "0 0 190px", minWidth: 160 },
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
    fontWeight: 900,
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
  resultMeta: { marginTop: 6, color: "rgba(232,238,252,0.70)", fontSize: 12 },

  sourcePill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    fontWeight: 900,
    fontSize: 11,
    letterSpacing: 0.8,
    color: "rgba(232,238,252,0.9)",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
  statValue: { fontSize: 24, fontWeight: 950, marginTop: 6 },
  statSub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.65)" },

  sectionTitle: { marginTop: 12, fontWeight: 950, fontSize: 13 },

  subCard: {
    marginTop: 10,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.16)",
    padding: 14,
  },

  breakEmpty: { fontSize: 12, color: "rgba(232,238,252,0.72)" },
  breakCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  breakTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  breakLeft: { display: "flex", alignItems: "center", gap: 12 },
  champIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(59,130,246,0.25))",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
  },
  breakTitle: { fontWeight: 950 },
  breakSub: { fontSize: 12, color: "rgba(232,238,252,0.68)", marginTop: 2 },
  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    fontWeight: 950,
    fontSize: 12,
  },
  breakGrid: { marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  breakItem: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 12,
  },
  breakLabel: { fontSize: 12, color: "rgba(232,238,252,0.65)" },
  breakValue: { marginTop: 6, fontWeight: 950 },

  roleList: { display: "flex", flexDirection: "column", gap: 12 },
  roleRow: { display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "center" },
  roleLeft: { minWidth: 0 },
  roleName: { fontWeight: 950, fontSize: 12, letterSpacing: 0.4 },
  roleSmall: { marginTop: 4, fontSize: 12, color: "rgba(232,238,252,0.68)" },
  roleBarTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  roleBarFill: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(124,58,237,0.95), rgba(59,130,246,0.9), rgba(34,211,238,0.9))",
    boxShadow: "0 0 18px rgba(59,130,246,0.35)",
    transition: "width 550ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  },

  muted: { color: "rgba(232,238,252,0.6)" },

  disclaimerCard: {
    marginTop: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 18,
    boxShadow: "0 20px 80px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
  },
  disclaimerTitle: { fontWeight: 950, fontSize: 18, marginBottom: 8 },
  disclaimerText: { color: "rgba(232,238,252,0.78)", fontSize: 13, maxWidth: 900 },
  chips: { marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10 },
  chip: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    color: "rgba(232,238,252,0.85)",
    fontSize: 12,
    fontWeight: 900,
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
  link: { color: "rgba(232,238,252,0.86)", textDecoration: "none", fontWeight: 800 },
  dot: { opacity: 0.6 },
};
