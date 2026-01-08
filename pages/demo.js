import { useMemo, useState } from "react";

const SUPABASE_PROJECT_REF = "lpoxlbbcmpxbfpfrufvf";
const SUPABASE_FN_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/get-player-insights`;

const regions = [
  { value: "tr1", label: "TR (tr1)" },
  { value: "euw1", label: "EUW (euw1)" },
  { value: "na1", label: "NA (na1)" },
  { value: "kr", label: "KR (kr)" },
];

const quickExamples = [
  { name: "faker", region: "kr" },
  { name: "Hide on bush", region: "kr" },
  { name: "solbekberkay", region: "tr1" },
];

function clampPct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

function fmtNum(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return String(x);
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
              {fmtNum(r.count)} match • {fmtNum(r.pct)}%
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

function BestChampionCard({ bestChamp }) {
  if (!bestChamp) {
    return (
      <div style={styles.emptyCard}>
        Not enough data yet to determine a best champion from the recent sample.
      </div>
    );
  }

  const name = bestChamp?.champion_name || "-";
  const games = bestChamp?.games ?? "-";
  const avgKda = bestChamp?.avg_kda ?? "-";

  return (
    <div style={styles.champCard}>
      <div style={styles.champTop}>
        <div style={styles.champLeft}>
          <div style={styles.champIcon}>{String(name).slice(0, 1)}</div>
          <div>
            <div style={styles.champName}>{name}</div>
            <div style={styles.champSub}>Best champion (recent sample)</div>
          </div>
        </div>
        <div style={styles.pill}>BETA</div>
      </div>

      <div style={styles.champGrid}>
        <div style={styles.champItem}>
          <div style={styles.champLabel}>Games</div>
          <div style={styles.champValue}>{games}</div>
        </div>
        <div style={styles.champItem}>
          <div style={styles.champLabel}>Avg KDA</div>
          <div style={styles.champValue}>{avgKda}</div>
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
      source: raw.source || "beta",
      sampleSize: s,
      last10,
      bestChamp,
      roles,
      puuid: raw.puuid || null,
    };
  }, [raw]);

  const run = async (override) => {
    setError(null);
    setRaw(null);

    const finalName = (override?.name ?? name).trim();
    const finalRegion = override?.region ?? region;

    if (!finalName) {
      setError("Please enter a summoner name.");
      return;
    }

    setLoading(true);
    try {
      const url = `${SUPABASE_FN_URL}?name=${encodeURIComponent(
        finalName
      )}&region=${encodeURIComponent(finalRegion)}`;

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

  const setExample = (ex) => {
    setName(ex.name);
    setRegion(ex.region);
    run(ex);
  };

  const clear = () => {
    setName("");
    setRegion("tr1");
    setError(null);
    setRaw(null);
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* MINI HERO */}
        <header style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.badge}>ANALYZER</div>
            <h1 style={styles.h1}>
              Insights <span style={styles.grad}>(Beta)</span>
            </h1>
            <p style={styles.p}>
              Search a summoner to generate post-match insights from a recent sample:
              KDA trend, best champion signals, and role distribution.
            </p>

            <div style={styles.heroChips}>
              <span style={styles.chip}>Post-match only</span>
              <span style={styles.chip}>No real-time assistance</span>
              <span style={styles.chip}>No automation</span>
              <span style={styles.chip}>No gameplay modification</span>
            </div>
          </div>

          {/* BETA MODE BANNER */}
          <div style={styles.betaBanner}>
            <div style={styles.betaTitle}>Beta mode</div>
            <div style={styles.betaText}>
              Access may be limited while Riot review is pending. Results can be partial and
              rate-limited.
            </div>
            <div style={styles.betaRow}>
              <span style={styles.betaPill}>Limited-rate</span>
              <span style={styles.betaPill}>Partial sample</span>
              <span style={styles.betaPill}>Graceful errors</span>
            </div>
          </div>
        </header>

        {/* SEARCH CARD */}
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
                onClick={() => run()}
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

            <div style={styles.fieldTiny}>
              <label style={styles.label}>&nbsp;</label>
              <button
                onClick={clear}
                disabled={loading}
                style={{
                  ...styles.ghostBtn,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {error ? (
            <div style={styles.alertError}>
              <strong>Request failed:</strong> {error}
              <div style={{ marginTop: 8, color: "rgba(255,215,215,0.9)" }}>
                Tip: Try another region or wait a bit if rate-limited.
              </div>
            </div>
          ) : null}

          {parsed ? (
            <>
              <div style={styles.resultHeader}>
                <div>
                  <div style={styles.resultTitle}>Result</div>
                  <div style={styles.resultMeta}>
                    Limited recent sample — may not represent full history.
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
                  title="PUUID"
                  value={parsed.puuid ? "Available" : "-"}
                  sub={parsed.puuid ? "Player identifier resolved" : "Not provided"}
                />
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>Best champion</div>
                <div style={styles.sectionCard}>
                  <BestChampionCard bestChamp={parsed.bestChamp} />
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>Role distribution</div>
                <div style={styles.sectionCard}>
                  <RoleBars roles={parsed.roles} />
                </div>
              </div>

              <div style={styles.bottomCta}>
                <div style={styles.bottomCtaText}>
                  Want to understand how insights are computed?
                </div>
                <div style={styles.bottomCtaLinks}>
                  <a href="/how-it-works" style={styles.linkBtn}>
                    How it works
                  </a>
                  <a href="/about" style={styles.linkBtnGhost}>
                    About Nexio
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>Quick start</div>
              <div style={styles.emptyText}>
                Try one of these examples (1 click), or search your own summoner.
              </div>

              <div style={styles.exampleRow}>
                {quickExamples.map((ex) => (
                  <button
                    key={ex.name + ex.region}
                    onClick={() => setExample(ex)}
                    style={styles.exampleBtn}
                  >
                    {ex.name} <span style={styles.exampleSub}>{ex.region}</span>
                  </button>
                ))}
              </div>

              <div style={styles.emptyHint}>
                If results look limited, it’s normal during beta access — try again later.
              </div>
            </div>
          )}
        </section>

        {/* DISCLAIMER */}
        <section style={styles.disclaimerCard}>
          <div style={styles.disclaimerTitle}>Disclaimer</div>
          <div style={styles.disclaimerText}>
            Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
            This product does not provide real-time assistance, automation, gameplay modification,
            or competitive advantage.
          </div>

          <div style={styles.chipsRow}>
            <div style={styles.chipSoft}>No in-game advantage</div>
            <div style={styles.chipSoft}>Post-match analytics</div>
            <div style={styles.chipSoft}>No betting / gambling</div>
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
  container: { maxWidth: 1040, margin: "0 auto", padding: "44px 20px 28px" },

  hero: {
    display: "grid",
    gridTemplateColumns: "1.35fr 1fr",
    gap: 14,
    alignItems: "stretch",
    marginBottom: 18,
  },
  heroLeft: {
    borderRadius: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: 18,
    boxShadow: "0 18px 70px rgba(0,0,0,0.35)",
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
  h1: { margin: "12px 0 8px", fontSize: 40, lineHeight: 1.1 },
  grad: {
    background: "linear-gradient(135deg, #7C3AED, #3B82F6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 950,
  },
  p: { margin: 0, color: "rgba(232,238,252,0.75)", maxWidth: 720, lineHeight: 1.6 },

  heroChips: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 },
  chip: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    fontSize: 12,
    color: "rgba(232,238,252,0.78)",
    fontWeight: 850,
  },

  betaBanner: {
    borderRadius: 18,
    border: "1px solid rgba(124,58,237,0.28)",
    background:
      "linear-gradient(180deg, rgba(124,58,237,0.12), rgba(59,130,246,0.08))",
    padding: 18,
    boxShadow: "0 18px 70px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
  },
  betaTitle: { fontWeight: 950, fontSize: 14, marginBottom: 6 },
  betaText: { fontSize: 12, color: "rgba(232,238,252,0.75)", lineHeight: 1.5 },
  betaRow: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 },
  betaPill: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    fontSize: 12,
    fontWeight: 900,
    color: "rgba(232,238,252,0.85)",
  },

  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },

  formRow: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" },
  field: { flex: "1 1 340px", minWidth: 240 },
  fieldSmall: { flex: "0 0 190px", minWidth: 160 },
  fieldTiny: { flex: "0 0 120px", minWidth: 120 },

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
    fontWeight: 900,
  },
  ghostBtn: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.9)",
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

  emptyState: {
    marginTop: 16,
    padding: "14px 14px",
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.03)",
  },
  emptyTitle: { fontWeight: 950, marginBottom: 6 },
  emptyText: { color: "rgba(232,238,252,0.78)", marginBottom: 10 },

  exampleRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  exampleBtn: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    color: "#E8EEFC",
    fontWeight: 950,
    cursor: "pointer",
  },
  exampleSub: { opacity: 0.7, fontWeight: 800 },
  emptyHint: { marginTop: 10, fontSize: 12, color: "rgba(232,238,252,0.60)" },

  resultHeader: {
    marginTop: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.10)",
  },
  resultTitle: { fontWeight: 950, fontSize: 14 },
  resultMeta: { marginTop: 6, color: "rgba(232,238,252,0.70)", fontSize: 12 },

  sourcePill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.18)",
    fontWeight: 950,
    fontSize: 11,
    letterSpacing: 0.8,
    color: "rgba(232,238,252,0.9)",
  },
  okBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    fontWeight: 950,
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

  section: { marginTop: 18 },
  sectionTitle: { fontWeight: 950, fontSize: 13, marginBottom: 10 },
  sectionCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.16)",
    padding: 14,
  },

  emptyCard: { fontSize: 12, color: "rgba(232,238,252,0.72)" },

  champCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  champTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  champLeft: { display: "flex", alignItems: "center", gap: 12 },
  champIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(59,130,246,0.25))",
    display: "grid",
    placeItems: "center",
    fontWeight: 950,
  },
  champName: { fontWeight: 950 },
  champSub: { fontSize: 12, color: "rgba(232,238,252,0.68)", marginTop: 2 },
  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    fontWeight: 950,
    fontSize: 12,
  },
  champGrid: { marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  champItem: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 12,
  },
  champLabel: { fontSize: 12, color: "rgba(232,238,252,0.65)" },
  champValue: { marginTop: 6, fontWeight: 950 },

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

  bottomCta: {
    marginTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    paddingTop: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  bottomCtaText: { color: "rgba(232,238,252,0.78)", fontWeight: 900 },
  bottomCtaLinks: { display: "flex", gap: 10, flexWrap: "wrap" },
  linkBtn: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.90), rgba(59,130,246,0.85))",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 900,
  },
  linkBtnGhost: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.9)",
    textDecoration: "none",
    fontWeight: 900,
  },

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

  chipsRow: { marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" },
  chipSoft: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    fontSize: 12,
    color: "rgba(232,238,252,0.72)",
    fontWeight: 900,
  },
};
