import { useEffect, useMemo, useState } from "react";

/**
 * Nexio.gg — Analyzer (Product polish)
 * - Loading skeletons
 * - Empty state copy
 * - Preset examples
 * - Shareable result link (query-based)
 * - Shareable card links (#card=...)
 * - Last updated (relative)
 * - Policy-aware chips + notes
 */

// ✅ If you ever change project/function name, update this one line:
const DEFAULT_FN_URL =
  "https://lpoxlbbcmpxbfpfrufvf.supabase.co/functions/v1/get-player-insights";

// Optional override via Vercel env:
const SUPABASE_FN_URL =
  process?.env?.NEXT_PUBLIC_SUPABASE_FN_URL || DEFAULT_FN_URL;

const REGIONS = [
  { value: "tr1", label: "TR (tr1)" },
  { value: "euw1", label: "EUW (euw1)" },
  { value: "na1", label: "NA (na1)" },
  { value: "kr", label: "KR (kr)" },
];

const PRESETS = [
  { name: "faker", region: "kr", label: "Faker (KR)" },
  { name: "Doublelift", region: "na1", label: "Doublelift (NA)" },
  { name: "Caps", region: "euw1", label: "Caps (EUW)" },
  { name: "BrokenBlade", region: "euw1", label: "BrokenBlade (EUW)" },
];

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function titleCase(s) {
  if (!s) return "";
  return String(s)
    .toLowerCase()
    .replace(/(^|\s|-|_)\w/g, (m) => m.toUpperCase());
}

function timeAgo(ts) {
  const t = typeof ts === "string" ? Date.parse(ts) : Number(ts);
  if (!Number.isFinite(t) || t <= 0) return null;

  const diff = Date.now() - t;
  if (diff < 0) return "just now";

  const sec = Math.floor(diff / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

function buildResultUrl({ name, region }) {
  const u = new URL(window.location.href);
  u.pathname = "/analyzer";
  u.searchParams.set("name", name);
  u.searchParams.set("region", region);
  // Remove card hash for "result link"
  u.hash = "";
  return u.toString();
}

function buildCardUrl({ name, region, card }) {
  const u = new URL(buildResultUrl({ name, region }));
  u.hash = `card=${encodeURIComponent(card)}`;
  return u.toString();
}

function SkeletonLine({ w = "100%", h = 12, r = 10, style }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.1s linear infinite",
        ...style,
      }}
    />
  );
}

function StatCard({ id, title, value, sub, onShare, loading }) {
  return (
    <div id={id} style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={styles.statTitle}>{title}</div>
        <button onClick={onShare} style={styles.shareBtn} type="button">
          ↗ Share
        </button>
      </div>

      {loading ? (
        <div style={{ marginTop: 10 }}>
          <SkeletonLine w="48%" h={24} r={12} />
          <SkeletonLine w="70%" h={12} r={10} style={{ marginTop: 10 }} />
        </div>
      ) : (
        <>
          <div style={styles.statValue}>{value ?? "—"}</div>
          <div style={styles.statSub}>{sub ?? ""}</div>
        </>
      )}
    </div>
  );
}

function RoleBars({ roles, loading }) {
  if (loading) {
    return (
      <div style={styles.sectionBox}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.sectionTitle}>Role distribution</div>
            <div style={styles.sectionHint}>Based on recent matches — mini bar chart.</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <SkeletonLine w="28%" h={12} r={8} />
              <SkeletonLine w="100%" h={10} r={999} style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!roles?.length) {
    return (
      <div style={styles.sectionBox}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.sectionTitle}>Role distribution</div>
            <div style={styles.sectionHint}>Based on recent matches — mini bar chart.</div>
          </div>
        </div>
        <div style={styles.emptyBox}>No role data yet.</div>
      </div>
    );
  }

  // Sort by pct desc
  const sorted = [...roles].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));

  return (
    <div style={styles.sectionBox}>
      <div style={styles.sectionHead}>
        <div>
          <div style={styles.sectionTitle}>Role distribution</div>
          <div style={styles.sectionHint}>Based on recent matches — mini bar chart.</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {sorted.map((r) => {
          const pct = safeNum(r.pct) ?? 0;
          const count = safeNum(r.count) ?? 0;
          const role = String(r.role ?? "UNKNOWN").toUpperCase();

          return (
            <div key={role} style={styles.roleRow}>
              <div style={styles.roleLeft}>
                <div style={styles.roleName}>{role}</div>
                <div style={styles.roleMeta}>
                  {count} match • {pct}%
                </div>
              </div>

              <div style={styles.roleBarWrap}>
                <div style={styles.roleBarTrack}>
                  <div
                    style={{
                      ...styles.roleBarFill,
                      width: `${Math.max(0, Math.min(100, pct))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChampionBreakdown({ champ, loading }) {
  if (loading) {
    return (
      <div style={styles.sectionBox}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.sectionTitle}>Best champion breakdown</div>
            <div style={styles.sectionHint}>A compact breakdown from the recent sample.</div>
          </div>
        </div>
        <div style={styles.champBox}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={styles.champIcon} />
            <div style={{ flex: 1 }}>
              <SkeletonLine w="34%" h={14} r={8} />
              <SkeletonLine w="52%" h={12} r={8} style={{ marginTop: 8 }} />
            </div>
            <div style={styles.pillBadge}>READY</div>
          </div>
          <div style={styles.champGrid}>
            <div style={styles.champMini}>
              <SkeletonLine w="30%" h={10} r={8} />
              <SkeletonLine w="22%" h={16} r={10} style={{ marginTop: 8 }} />
            </div>
            <div style={styles.champMini}>
              <SkeletonLine w="30%" h={10} r={8} />
              <SkeletonLine w="22%" h={16} r={10} style={{ marginTop: 8 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!champ) {
    return (
      <div style={styles.sectionBox}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.sectionTitle}>Best champion breakdown</div>
            <div style={styles.sectionHint}>A compact breakdown from the recent sample.</div>
          </div>
        </div>
        <div style={styles.emptyBox}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Not enough data yet</div>
          <div style={{ color: "rgba(232,238,252,0.7)" }}>
            Best champion breakdown will appear after more recent matches are available.
          </div>
        </div>
      </div>
    );
  }

  const name = champ.champion_name || champ.name || "Best champion";
  const games = safeNum(champ.games);
  const avgKda = champ.avg_kda ?? champ.avgKDA ?? champ.kda;

  return (
    <div style={styles.sectionBox}>
      <div style={styles.sectionHead}>
        <div>
          <div style={styles.sectionTitle}>Best champion breakdown</div>
          <div style={styles.sectionHint}>A compact breakdown from the recent sample.</div>
        </div>
      </div>

      <div style={styles.champBox}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={styles.champIconText}>{String(name).slice(0, 1).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 1000, fontSize: 16 }}>{name}</div>
            <div style={{ color: "rgba(232,238,252,0.7)", fontSize: 12 }}>
              Best champion (recent)
            </div>
          </div>
          <div style={styles.pillBadge}>READY</div>
        </div>

        <div style={styles.champGrid}>
          <div style={styles.champMini}>
            <div style={styles.champMiniLabel}>Games</div>
            <div style={styles.champMiniValue}>{games ?? "—"}</div>
          </div>
          <div style={styles.champMini}>
            <div style={styles.champMiniLabel}>Avg KDA</div>
            <div style={styles.champMiniValue}>{avgKda ?? "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Analyzer() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [raw, setRaw] = useState(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  // Read query params on load
  useEffect(() => {
    const u = new URL(window.location.href);
    const qName = u.searchParams.get("name") || "";
    const qRegion = u.searchParams.get("region") || "tr1";
    if (qName) setName(qName);
    if (qRegion) setRegion(qRegion);
  }, []);

  const parsed = useMemo(() => {
    const insights = raw?.insights || raw?.data?.insights || null;
    if (!insights) return null;

    const sampleSize =
      safeNum(insights.sample_size) ??
      safeNum(insights.sampleSize) ??
      safeNum(insights.sample) ??
      null;

    const last10 = insights.kda_trend?.last_10 || insights.last10 || null;
    const last10Games = safeNum(last10?.games);
    const last10Kda = last10?.kda ?? null;
    const last10Wr = last10?.winrate_pct ?? null;

    const bestChampion =
      insights.best_champion || insights.bestChampion || null;

    const roles =
      insights.role_distribution || insights.roles || [];

    const puuid = raw?.puuid || raw?.player?.puuid || raw?.player_puuid || null;

    const source = raw?.source || raw?.debug?.source || raw?.meta?.source || "LIVE";

    return {
      sampleSize,
      last10: { games: last10Games, kda: last10Kda, winrate_pct: last10Wr },
      bestChampion,
      roles,
      puuid,
      source,
    };
  }, [raw]);

  // Auto-run if query has name (after first render sets state)
  useEffect(() => {
    const u = new URL(window.location.href);
    const qName = u.searchParams.get("name");
    if (!qName) return;

    // Run only if we don't already have results
    if (raw || loading) return;

    // slight delay so state is set
    const t = setTimeout(() => run(qName, u.searchParams.get("region") || "tr1"), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const setUrl = (newName, newRegion, card = null) => {
    const u = new URL(window.location.href);
    u.pathname = "/analyzer";
    if (newName) u.searchParams.set("name", newName);
    else u.searchParams.delete("name");

    if (newRegion) u.searchParams.set("region", newRegion);
    else u.searchParams.delete("region");

    u.hash = card ? `card=${encodeURIComponent(card)}` : "";
    window.history.replaceState({}, "", u.toString());
  };

  const run = async (forcedName, forcedRegion) => {
    const trimmed = (forcedName ?? name).trim();
    const reg = forcedRegion ?? region;

    setError(null);
    setRaw(null);
    setLastUpdatedAt(null);

    if (!trimmed) {
      setError("Summoner name is required.");
      return;
    }

    setUrl(trimmed, reg, null);

    setLoading(true);
    try {
      const url = `${SUPABASE_FN_URL}?name=${encodeURIComponent(trimmed)}&region=${encodeURIComponent(reg)}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
      }

      setRaw(data);
      setLastUpdatedAt(Date.now());
      setToast({ type: "ok", text: "Insights updated." });
    } catch (e) {
      setError(e?.message || "Request failed.");
      setToast({ type: "err", text: "Request failed." });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setName("");
    setRegion("tr1");
    setRaw(null);
    setError(null);
    setLastUpdatedAt(null);
    setUrl("", "tr1", null);
  };

  const onPreset = (p) => {
    setName(p.name);
    setRegion(p.region);
    setTimeout(() => run(p.name, p.region), 0);
  };

  const copyResultLink = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setToast({ type: "err", text: "Enter a summoner name first." });
      return;
    }
    const ok = await copyText(buildResultUrl({ name: trimmed, region }));
    setToast({ type: ok ? "ok" : "err", text: ok ? "Result link copied." : "Copy failed." });
  };

  const shareCard = async (cardId) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setToast({ type: "err", text: "Enter a summoner name first." });
      return;
    }
    const ok = await copyText(buildCardUrl({ name: trimmed, region, card: cardId }));
    setToast({ type: ok ? "ok" : "err", text: ok ? "Card link copied." : "Copy failed." });
  };

  const updatedLabel = useMemo(() => {
    const ago = timeAgo(lastUpdatedAt);
    return ago ? `Updated ${ago}` : null;
  }, [lastUpdatedAt]);

  return (
    <main style={styles.page}>
      {/* Keyframes for shimmer */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={styles.container}>
        {/* HERO */}
        <div style={styles.hero}>
          <div style={styles.heroBadgeRow}>
            <span style={styles.badge}>ANALYZER</span>
            <div style={styles.badgeChips}>
              <span style={styles.chip}>Post-match only</span>
              <span style={styles.chip}>Shareable links</span>
              <span style={styles.chip}>Policy-aware</span>
            </div>
          </div>

          <h1 style={styles.h1}>
            Performance insights for <span style={styles.gradText}>esports</span>.
          </h1>
          <p style={styles.heroP}>
            Clean summaries based on recently available public match data. Shareable links included — built for clarity,
            designed to be policy-aware.
          </p>

          {/* Presets */}
          <div style={styles.presetRow}>
            <div style={styles.presetLabel}>Quick examples:</div>
            <div style={styles.presetWrap}>
              {PRESETS.map((p) => (
                <button
                  key={`${p.name}-${p.region}`}
                  type="button"
                  onClick={() => onPreset(p)}
                  style={styles.presetBtn}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CARD */}
        <section style={styles.card}>
          {/* FORM */}
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label style={styles.label}>Summoner name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.btnCol}>
              <label style={styles.label}>&nbsp;</label>
              <button
                type="button"
                onClick={() => run()}
                disabled={loading}
                style={{
                  ...styles.primaryBtn,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Running..." : "Run"}
              </button>
            </div>

            <div style={styles.btnCol}>
              <label style={styles.label}>&nbsp;</label>
              <button type="button" onClick={reset} style={styles.secondaryBtn}>
                Reset
              </button>
            </div>
          </div>

          {error ? (
            <div style={styles.alertError}>
              <strong>Error:</strong> {error}
            </div>
          ) : null}

          {/* RESULT HEADER */}
          <div style={styles.resultHead}>
            <div>
              <div style={styles.resultTitle}>Result</div>
              <div style={styles.resultMeta}>
                {parsed ? (
                  <>
                    {updatedLabel ? <span>{updatedLabel}</span> : <span>Updated just now</span>}
                    <span style={styles.dot}>•</span>
                    <span>
                      Source: <strong>{parsed.source || "LIVE"}</strong>
                    </span>
                  </>
                ) : (
                  <span>
                    Run an analysis to see results. You can share result links and card links.
                  </span>
                )}
              </div>
            </div>

            <button type="button" onClick={copyResultLink} style={styles.copyBtn}>
              Copy result link
            </button>
          </div>

          {/* STATS */}
          <div style={styles.grid}>
            <StatCard
              id="card=sample"
              title="Sample size"
              value={parsed?.sampleSize}
              sub="Analyzed matches (recent)"
              loading={loading}
              onShare={() => shareCard("sample")}
            />

            <StatCard
              id="card=kda"
              title="Recent KDA"
              value={
                parsed?.last10?.kda != null ? Number(parsed.last10.kda).toFixed(2) : "—"
              }
              sub={
                parsed?.last10?.games != null && parsed?.last10?.winrate_pct != null
                  ? `${parsed.last10.games} game • ${parsed.last10.winrate_pct}% WR`
                  : "Recent performance snapshot"
              }
              loading={loading}
              onShare={() => shareCard("kda")}
            />

            <StatCard
              id="card=player"
              title="Player ID"
              value={parsed?.puuid ? "Resolved" : "—"}
              sub={parsed?.puuid ? "PUUID available" : "Identity resolution"}
              loading={loading}
              onShare={() => shareCard("player")}
            />
          </div>

          {/* NOTE */}
          <div style={styles.note}>
            <strong>Note:</strong> This is post-match analytics only. Nexio.gg provides no real-time assistance, automation,
            or gameplay modification.
          </div>

          {/* SECTIONS */}
          <ChampionBreakdown champ={parsed?.bestChampion} loading={loading} />
          <RoleBars roles={parsed?.roles} loading={loading} />

          {/* POLICY */}
          <div style={styles.sectionBox}>
            <div style={styles.sectionHead}>
              <div>
                <div style={styles.sectionTitle}>Policy & disclaimer</div>
                <div style={styles.sectionHint}>
                  Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
                </div>
              </div>
            </div>

            <div style={styles.chipsWrap}>
              {[
                "Post-match only",
                "No real-time assistance",
                "No automation / scripting",
                "No betting / gambling",
                "No gameplay modification",
                "No competitive advantage",
              ].map((t) => (
                <span key={t} style={styles.chip2}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* TOAST */}
        {toast ? (
          <div
            style={{
              ...styles.toast,
              borderColor:
                toast.type === "ok"
                  ? "rgba(34,197,94,0.35)"
                  : "rgba(239,68,68,0.35)",
              background:
                toast.type === "ok"
                  ? "rgba(34,197,94,0.10)"
                  : "rgba(239,68,68,0.10)",
            }}
          >
            {toast.text}
          </div>
        ) : null}
      </div>
    </main>
  );
}

/* -------------------- STYLES -------------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.22), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(59,130,246,0.16), transparent 55%), #0b1020",
    color: "#e8eefc",
  },
  container: {
    maxWidth: 1040,
    margin: "0 auto",
    padding: "54px 18px 42px",
  },

  hero: {
    marginBottom: 18,
  },
  heroBadgeRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: 900,
  },
  badgeChips: { display: "flex", gap: 10, flexWrap: "wrap" },
  chip: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontSize: 12,
    color: "rgba(232,238,252,0.85)",
  },
  h1: {
    margin: "12px 0 8px",
    fontSize: 44,
    lineHeight: 1.06,
    letterSpacing: -0.4,
  },
  gradText: {
    background:
      "linear-gradient(90deg, rgba(124,58,237,1), rgba(59,130,246,1))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroP: {
    margin: 0,
    color: "rgba(232,238,252,0.78)",
    maxWidth: 820,
    lineHeight: 1.6,
  },

  presetRow: {
    marginTop: 14,
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  presetLabel: { fontSize: 12, color: "rgba(232,238,252,0.75)", fontWeight: 800 },
  presetWrap: { display: "flex", gap: 10, flexWrap: "wrap" },
  presetBtn: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(232,238,252,0.9)",
    fontSize: 12,
    cursor: "pointer",
  },

  card: {
    marginTop: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },

  formRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  field: { flex: "1 1 360px", minWidth: 240 },
  fieldSmall: { flex: "0 0 200px", minWidth: 170 },
  btnCol: { flex: "0 0 160px", minWidth: 150 },
  label: {
    display: "block",
    fontSize: 12,
    color: "rgba(232,238,252,0.75)",
    marginBottom: 6,
    fontWeight: 800,
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
  primaryBtn: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.92), rgba(59,130,246,0.86))",
    color: "#fff",
    fontWeight: 900,
  },
  secondaryBtn: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(232,238,252,0.92)",
    fontWeight: 900,
    cursor: "pointer",
  },

  alertError: {
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.10)",
    color: "#ffd7d7",
  },

  resultHead: {
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    flexWrap: "wrap",
  },
  resultTitle: { fontWeight: 1000, fontSize: 14 },
  resultMeta: { marginTop: 6, color: "rgba(232,238,252,0.75)", fontSize: 12 },
  dot: { margin: "0 8px", opacity: 0.6 },
  copyBtn: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(232,238,252,0.9)",
    fontWeight: 900,
    cursor: "pointer",
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
    minHeight: 110,
  },
  statTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  statTitle: { fontSize: 12, color: "rgba(232,238,252,0.72)", fontWeight: 900 },
  shareBtn: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.85)",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  statValue: { fontSize: 28, fontWeight: 1000, marginTop: 10 },
  statSub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.65)" },

  note: {
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.82)",
    fontSize: 12,
    lineHeight: 1.55,
  },

  sectionBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
  },
  sectionHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  sectionTitle: { fontWeight: 1000, fontSize: 13 },
  sectionHint: { marginTop: 6, color: "rgba(232,238,252,0.65)", fontSize: 12 },

  emptyBox: {
    marginTop: 12,
    padding: "14px 14px",
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.02)",
    color: "rgba(232,238,252,0.78)",
  },

  roleRow: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  roleLeft: {},
  roleName: { fontWeight: 1000 },
  roleMeta: { marginTop: 4, fontSize: 12, color: "rgba(232,238,252,0.65)" },
  roleBarWrap: {},
  roleBarTrack: {
    height: 10,
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  roleBarFill: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(124,58,237,0.95), rgba(34,211,238,0.92), rgba(59,130,246,0.92))",
  },

  champBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.20)",
  },
  champIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  champIconText: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.50), rgba(59,130,246,0.30))",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 1000,
  },
  pillBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    fontWeight: 1000,
    fontSize: 12,
  },
  champGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    marginTop: 12,
  },
  champMini: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.02)",
    padding: 12,
  },
  champMiniLabel: { fontSize: 12, color: "rgba(232,238,252,0.65)", fontWeight: 900 },
  champMiniValue: { marginTop: 6, fontSize: 18, fontWeight: 1000 },

  chipsWrap: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 },
  chip2: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.88)",
    fontSize: 12,
    fontWeight: 900,
  },

  toast: {
    position: "fixed",
    right: 16,
    bottom: 16,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(232,238,252,0.92)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.45)",
  },
};
