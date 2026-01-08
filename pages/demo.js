import { useEffect, useMemo, useState } from "react";

/* =========================
   SUPABASE CONFIG
========================= */
const SUPABASE_PROJECT_REF = "lpoxlbbcmpxbfpfrufvf";
const SUPABASE_FN_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/get-player-insights`;

// Raw JSON'u production'da gizle (Riot review için daha clean)
const SHOW_RAW = process.env.NODE_ENV !== "production";

// Champion icon source (Data Dragon)
const DDRAGON_VER = "14.1.1";
const champIconUrl = (championName) =>
  championName
    ? `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VER}/img/champion/${encodeURIComponent(
        championName
      )}.png`
    : null;

const regions = [
  { value: "tr1", label: "TR (tr1)" },
  { value: "euw1", label: "EUW (euw1)" },
  { value: "na1", label: "NA (na1)" },
  { value: "kr", label: "KR (kr)" },
];

/* =========================
   UI COMPONENTS
========================= */
function StatCard({ title, value, sub, rightSlot, bodySlot }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statRow}>
        <div style={styles.statTitle}>{title}</div>
        {rightSlot ? <div style={styles.statRight}>{rightSlot}</div> : null}
      </div>

      {bodySlot ? (
        <div style={{ marginTop: 10 }}>{bodySlot}</div>
      ) : (
        <>
          <div style={styles.statValue}>{value}</div>
          {sub ? <div style={styles.statSub}>{sub}</div> : null}
        </>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={styles.statCard}>
      <div style={styles.statRow}>
        <div style={{ ...styles.skel, width: "38%" }} />
        <div style={{ ...styles.skel, width: 38, height: 10 }} />
      </div>
      <div style={{ ...styles.skel, height: 22, marginTop: 10 }} />
      <div style={{ ...styles.skel, width: "62%", marginTop: 10 }} />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div style={styles.grid}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

// Lightweight SVG sparkline (no libs)
function Sparkline({ values = [] }) {
  if (!values || values.length < 2) return null;

  const w = 140;
  const h = 40;
  const pad = 4;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const toX = (i) => pad + (i * (w - pad * 2)) / (values.length - 1);
  const toY = (v) => h - pad - ((v - min) / range) * (h - pad * 2);

  const points = values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id="nexioGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(124,58,237,0.95)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.95)" />
        </linearGradient>
      </defs>

      <polyline
        fill="none"
        stroke="url(#nexioGrad)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

/** Role Distribution Mini Bar Chart */
function RoleBars({ roles = [] }) {
  if (!roles?.length) return <div style={styles.muted}>No role data</div>;

  const sorted = [...roles].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  const top = sorted.slice(0, 5);

  return (
    <div style={styles.roleBars}>
      {top.map((r) => (
        <div key={r.role} style={styles.roleBarRow}>
          <div style={styles.roleBarLeft}>
            <div style={styles.roleBarRole}>{r.role}</div>
            <div style={styles.roleBarMeta}>
              {r.count} match • {r.pct}%
            </div>
          </div>

          <div style={styles.roleBarTrack}>
            <div
              style={{
                ...styles.roleBarFill,
                width: `${Math.max(0, Math.min(100, r.pct || 0))}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChampionIcon({ championName, size = 44 }) {
  const [broken, setBroken] = useState(false);
  const src = champIconUrl(championName);

  if (!championName) {
    return (
      <div style={{ ...styles.champFallback, width: size, height: size }}>
        ?
      </div>
    );
  }

  if (broken || !src) {
    const initial = championName?.slice(0, 1)?.toUpperCase() || "?";
    return (
      <div style={{ ...styles.champFallback, width: size, height: size }}>
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={championName}
      width={size}
      height={size}
      style={styles.champImg}
      onError={() => setBroken(true)}
    />
  );
}

function ChampionBreakdown({ bestChamp }) {
  // bestChamp beklenen: { champion_name, games, avg_kda }
  if (!bestChamp?.champion_name) {
    return (
      <div style={styles.champEmpty}>
        Not enough data yet for a best champion.
      </div>
    );
  }

  const champ = bestChamp.champion_name;
  const games = bestChamp.games ?? "-";
  const avgKda =
    bestChamp.avg_kda != null ? String(bestChamp.avg_kda) : "-";

  return (
    <div style={styles.champRow}>
      <ChampionIcon championName={champ} size={46} />
      <div style={styles.champInfo}>
        <div style={styles.champName}>{champ}</div>
        <div style={styles.champMeta}>
          <span style={styles.champMetaItem}>Games: {games}</span>
          <span style={styles.champMetaDot}>•</span>
          <span style={styles.champMetaItem}>Avg KDA: {avgKda}</span>
        </div>

        <div style={styles.champMini}>
          <div style={styles.champMiniItem}>
            <div style={styles.champMiniLabel}>Reliability</div>
            <div style={styles.champMiniValue}>
              {typeof games === "number"
                ? games >= 8
                  ? "High"
                  : games >= 4
                  ? "Medium"
                  : "Low"
                : "—"}
            </div>
          </div>

          <div style={styles.champMiniItem}>
            <div style={styles.champMiniLabel}>Signal</div>
            <div style={styles.champMiniValue}>
              {avgKda !== "-" && Number(avgKda) >= 3
                ? "Strong"
                : avgKda !== "-" && Number(avgKda) >= 2
                ? "Good"
                : avgKda !== "-" && Number(avgKda) > 0
                ? "Early"
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   PAGE
========================= */
export default function Demo() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState(null);

  // Inject shimmer keyframes once (client only)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("nexio-shimmer-style")) return;

    const style = document.createElement("style");
    style.id = "nexio-shimmer-style";
    style.innerHTML = `
      @keyframes shimmer {
        0% { background-position: 100% 0; }
        100% { background-position: 0 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const parsed = useMemo(() => {
    if (!raw?.insights) return null;

    const s = raw.insights.sample_size ?? null;
    const last10 = raw.insights.kda_trend?.last_10 ?? null;
    const prev10 = raw.insights.kda_trend?.prev_10 ?? null;
    const bestChamp = raw.insights.best_champion ?? null;
    const roles = raw.insights.role_distribution ?? [];

    // Sparkline için min 2 nokta
    const kdaSeries =
      prev10?.kda != null && last10?.kda != null ? [prev10.kda, last10.kda] : null;

    return {
      sampleSize: s,
      last10,
      prev10,
      bestChamp,
      roles,
      puuid: raw.puuid,
      ok: raw.ok,
      kdaSeries,
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
      const url = `${SUPABASE_FN_URL}?name=${encodeURIComponent(trimmed)}&region=${encodeURIComponent(
        region
      )}`;

      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

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
              <strong>Request failed:</strong> <span style={{ opacity: 0.95 }}>{error}</span>
            </div>
          ) : null}

          {loading ? (
            <>
              <div style={styles.resultHeader}>
                <div>
                  <div style={styles.resultTitle}>Result</div>
                  <div style={styles.resultMeta}>Analyzing recent matches…</div>
                </div>
                <div style={styles.okBadge}>…</div>
              </div>

              <SkeletonGrid />

              <div style={{ marginTop: 18 }}>
                <div style={styles.sectionTitle}>Best champion</div>
                <div style={{ ...styles.skel, width: "100%", height: 68, marginTop: 10 }} />
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={styles.sectionTitle}>Role distribution</div>
                <div style={{ ...styles.skel, width: "100%", height: 66, marginTop: 10 }} />
              </div>
            </>
          ) : parsed ? (
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
                      : "Not enough data yet"
                  }
                  rightSlot={parsed.kdaSeries ? <Sparkline values={parsed.kdaSeries} /> : null}
                />

                <StatCard
                  title="Best champion"
                  value={parsed.bestChamp?.champion_name || "-"}
                  sub={
                    parsed.bestChamp
                      ? `Games: ${parsed.bestChamp.games} • Avg KDA: ${parsed.bestChamp.avg_kda}`
                      : "Not enough data yet"
                  }
                  rightSlot={
                    parsed.bestChamp?.champion_name ? (
                      <ChampionIcon championName={parsed.bestChamp.champion_name} size={36} />
                    ) : null
                  }
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={styles.sectionTitle}>Best champion breakdown</div>
                <div style={styles.panel}>
                  <ChampionBreakdown bestChamp={parsed.bestChamp} />
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={styles.sectionTitle}>Role distribution</div>
                <RoleBars roles={parsed.roles} />
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

/* =========================
   STYLES (premium)
========================= */
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
    minHeight: 96,
  },
  statRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  statRight: { opacity: 0.95 },
  statTitle: { fontSize: 12, color: "rgba(232,238,252,0.72)", fontWeight: 800 },
  statValue: { fontSize: 22, fontWeight: 950, marginTop: 8 },
  statSub: { marginTop: 8, fontSize: 12, color: "rgba(232,238,252,0.65)" },

  // Skeleton shimmer
  skel: {
    height: 12,
    borderRadius: 8,
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.18) 37%, rgba(255,255,255,0.08) 63%)",
    backgroundSize: "400% 100%",
    animation: "shimmer 1.4s ease infinite",
  },

  sectionTitle: { marginTop: 10, fontWeight: 950, fontSize: 13 },

  // Champion breakdown panel
  panel: {
    marginTop: 10,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
    padding: 14,
  },
  champRow: { display: "flex", gap: 12, alignItems: "center" },
  champImg: {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
  },
  champFallback: {
    display: "grid",
    placeItems: "center",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    fontWeight: 950,
    color: "rgba(232,238,252,0.85)",
  },
  champInfo: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
  champName: { fontWeight: 950, fontSize: 14 },
  champMeta: { fontSize: 12, color: "rgba(232,238,252,0.70)" },
  champMetaItem: {},
  champMetaDot: { margin: "0 8px", opacity: 0.6 },
  champMini: { display: "flex", gap: 10, flexWrap: "wrap" },
  champMiniItem: {
    padding: "8px 10px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    minWidth: 140,
  },
  champMiniLabel: { fontSize: 11, color: "rgba(232,238,252,0.65)" },
  champMiniValue: { marginTop: 4, fontWeight: 950 },
  champEmpty: { color: "rgba(232,238,252,0.65)", fontSize: 12 },

  // Role bars
  roleBars: {
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  roleBarRow: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: 12,
    alignItems: "center",
  },
  roleBarLeft: { display: "flex", flexDirection: "column", gap: 4 },
  roleBarRole: { fontWeight: 950, fontSize: 12 },
  roleBarMeta: { fontSize: 12, color: "rgba(232,238,252,0.65)" },
  roleBarTrack: {
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  roleBarFill: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.85))",
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
