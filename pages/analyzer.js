import { useEffect, useMemo, useState } from "react";

/**
 * =========================================================
 * CONFIG
 * =========================================================
 */
const SUPABASE_PROJECT_REF = "lpoxlbbcmpxbfpfrufvf";
const SUPABASE_FN_NAME = "get-player-insights"; // <- function adın farklıysa değiştir
const SUPABASE_FN_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/${SUPABASE_FN_NAME}`;

const regions = [
  { value: "tr1", label: "TR (tr1)" },
  { value: "euw1", label: "EUW (euw1)" },
  { value: "na1", label: "NA (na1)" },
  { value: "kr", label: "KR (kr)" },
];

const quickPresets = [
  { label: "faker • KR", name: "faker", region: "kr" },
  { label: "Doublelift • NA1", name: "Doublelift", region: "na1" },
  { label: "Caps • EUW1", name: "Caps", region: "euw1" },
];

function safeDate(ts) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function buildShareUrl(name, region) {
  const u = new URL(window.location.href);
  u.pathname = "/analyzer";
  u.search = "";
  if (name) u.searchParams.set("name", name);
  if (region) u.searchParams.set("region", region);
  return u.toString();
}

function Icon({ children }) {
  return (
    <span
      aria-hidden
      style={{
        width: 26,
        height: 26,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "rgba(232,238,252,0.92)",
        fontSize: 14,
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ title, value, sub, onShare }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={styles.statTitle}>{title}</div>
        {onShare ? (
          <button onClick={onShare} style={styles.shareMiniBtn} title="Share this card">
            <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <Icon>↗</Icon>
              <span style={{ fontWeight: 800 }}>Share</span>
            </span>
          </button>
        ) : null}
      </div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statSub}>{sub}</div>
    </div>
  );
}

function ProgressRow({ label, count, pct }) {
  const p = Math.max(0, Math.min(100, Number(pct ?? 0)));
  return (
    <div style={styles.roleRow}>
      <div style={styles.roleLeft}>
        <div style={styles.roleName}>{label}</div>
        <div style={styles.roleMeta}>
          {count ?? 0} match • {p}%
        </div>
      </div>
      <div style={styles.roleBar}>
        <div style={{ ...styles.roleFill, width: `${p}%` }} />
      </div>
    </div>
  );
}

export default function Analyzer() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [raw, setRaw] = useState(null);

  // URL -> state (on load)
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const n = u.searchParams.get("name") || "";
      const r = u.searchParams.get("region") || "tr1";
      if (n) setName(n);
      if (r) setRegion(r);
      // Auto-run if name exists
      if (n) {
        setTimeout(() => run(n, r, { updateUrl: false }), 50);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsed = useMemo(() => {
    if (!raw) return null;

    const insights = raw.insights || {};
    const sampleSize = insights.sample_size ?? null;

    const last10 = insights.kda_trend?.last_10 ?? null;
    const best = insights.best_champion ?? null;
    const roles = Array.isArray(insights.role_distribution)
      ? insights.role_distribution
      : [];

    const updatedAt =
      raw.updated_at || raw.updatedAt || raw.ts || raw.timestamp || null;

    return {
      ok: !!raw.ok,
      source: raw.source || "LIVE",
      puuid: raw.puuid || null,
      updatedAt: updatedAt ? safeDate(updatedAt) : null,
      name: raw.debug?.name || raw.name || null,
      region: raw.debug?.region || raw.region || null,

      sampleSize,
      last10,
      best,
      roles,
    };
  }, [raw]);

  const run = async (nOverride, rOverride, opts = { updateUrl: true }) => {
    const n = (nOverride ?? name).trim();
    const r = (rOverride ?? region).trim() || "tr1";

    setError("");
    setRaw(null);

    if (!n) {
      setError("Summoner name gerekli.");
      return;
    }

    setLoading(true);
    try {
      const url = `${SUPABASE_FN_URL}?name=${encodeURIComponent(n)}&region=${encodeURIComponent(
        r
      )}`;

      const res = await fetch(url, { method: "GET" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Request failed");
      }

      setRaw(data);

      // Update URL (shareable)
      if (opts.updateUrl !== false) {
        const u = new URL(window.location.href);
        u.pathname = "/analyzer";
        u.search = "";
        u.searchParams.set("name", n);
        u.searchParams.set("region", r);
        window.history.replaceState({}, "", u.toString());
      }
    } catch (e) {
      setError(e?.message ? `Request failed: ${e.message}` : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setName("");
    setRegion("tr1");
    setError("");
    setRaw(null);
    const u = new URL(window.location.href);
    u.pathname = "/analyzer";
    u.search = "";
    window.history.replaceState({}, "", u.toString());
  };

  const onEnter = (e) => {
    if (e.key === "Enter") run();
  };

  const copyResultLink = async () => {
    const n = name.trim();
    const r = region;
    const link = buildShareUrl(n, r);
    try {
      await navigator.clipboard.writeText(link);
      toast("Copied result link ✅");
    } catch {
      toast("Copy failed (browser blocked) ❌");
    }
  };

  const shareCard = async (cardKey) => {
    const n = name.trim();
    const r = region;
    const base = buildShareUrl(n, r);
    const link = `${base}${base.includes("?") ? "&" : "?"}card=${encodeURIComponent(
      cardKey
    )}`;
    try {
      await navigator.clipboard.writeText(link);
      toast("Copied card link ✅");
    } catch {
      toast("Copy failed ❌");
    }
  };

  const [toastMsg, setToastMsg] = useState("");
  const toast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 1600);
  };

  const updatedLabel = useMemo(() => {
    if (!parsed?.updatedAt) return "—";
    return parsed.updatedAt.toLocaleString();
  }, [parsed?.updatedAt]);

  const sampleLine = useMemo(() => {
    const n = name.trim() || "—";
    const r = region || "—";
    const s = parsed?.sampleSize != null ? parsed.sampleSize : "—";
    return `Summoner: ${n}  •  Region: ${r}  •  Sample: ${s}`;
  }, [name, region, parsed?.sampleSize]);

  const hasBest = !!parsed?.best?.champion_name;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.hero}>
          <div style={styles.kickerRow}>
            <span style={styles.kicker}>ANALYZER</span>
            <span style={styles.kickerDots}>•</span>
            <span style={styles.kickerSub}>Post-match only</span>
            <span style={styles.kickerDots}>•</span>
            <span style={styles.kickerSub}>Policy-aware</span>
          </div>

          <h1 style={styles.h1}>
            Performance insights for{" "}
            <span style={styles.gradText}>esports</span>.
          </h1>
          <p style={styles.sub}>
            Clean summaries based on recently available public match data.
            Shareable links included — built for clarity, designed to be policy-aware.
          </p>
        </header>

        {/* MAIN CARD */}
        <section style={styles.mainCard}>
          {/* Form */}
          <div style={styles.formGrid}>
            <div style={styles.fieldWide}>
              <label style={styles.label}>Summoner name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={onEnter}
                placeholder="e.g. faker"
                autoComplete="off"
                style={styles.input}
              />

              <div style={styles.quickRow}>
                <div style={styles.quickLeft}>
                  <span style={styles.quickIcon}>⚡</span>
                  <span style={styles.quickLabel}>Quick</span>
                </div>
                <div style={styles.quickChips}>
                  {quickPresets.map((p) => (
                    <button
                      key={p.label}
                      style={styles.chipBtn}
                      onClick={() => {
                        setName(p.name);
                        setRegion(p.region);
                        run(p.name, p.region);
                      }}
                      type="button"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.field}>
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

            <div style={styles.fieldBtn}>
              <label style={styles.label}>&nbsp;</label>
              <button
                onClick={() => run()}
                disabled={loading}
                style={{
                  ...styles.runBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Running..." : "Run"}
              </button>
            </div>

            <div style={styles.fieldBtn}>
              <label style={styles.label}>&nbsp;</label>
              <button onClick={reset} style={styles.resetBtn}>
                Reset
              </button>
            </div>
          </div>

          {error ? (
            <div style={styles.alertError}>
              <strong>{error}</strong>
            </div>
          ) : null}

          {/* Result header row */}
          <div style={styles.resultHead}>
            <div>
              <div style={styles.sectionTitle}>Result</div>
              <div style={styles.resultMeta}>
                Last updated: <span style={styles.mono}>{updatedLabel}</span>
                <span style={styles.dot}>•</span>
                Source: <span style={styles.mono}>{parsed?.source || "—"}</span>
              </div>
              <div style={styles.helperSmall}>
                Run an analysis to see results. You can share result links and card links.
              </div>
            </div>

            <div style={styles.resultActions}>
              <button onClick={copyResultLink} style={styles.copyBtn}>
                <span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
                  <Icon>⧉</Icon>
                  <span style={{ fontWeight: 900 }}>Copy result link</span>
                </span>
              </button>
            </div>
          </div>

          {/* What we analyzed */}
          <div style={styles.analyzedCard}>
            <div style={styles.analyzedTop}>
              <div style={styles.analyzedTitleRow}>
                <Icon>ⓘ</Icon>
                <div style={styles.analyzedTitle}>What we analyzed</div>
              </div>
              <div style={styles.analyzedCollapseHint}>
                {/* placeholder for future collapse */}
              </div>
            </div>
            <div style={styles.analyzedLine}>{sampleLine}</div>
            <div style={styles.analyzedHint}>Run to analyze recent matches.</div>
          </div>

          {/* Main stat grid */}
          <div style={styles.statsGrid}>
            <StatCard
              title="Sample size"
              value={parsed?.sampleSize ?? "—"}
              sub="Analyzed matches (recent)"
              onShare={() => shareCard("sample")}
            />
            <StatCard
              title="Recent KDA"
              value={
                parsed?.last10?.kda != null
                  ? Number(parsed.last10.kda).toFixed(2)
                  : "—"
              }
              sub={
                parsed?.last10
                  ? `${parsed.last10.games} game • ${parsed.last10.winrate_pct}% WR`
                  : "Recent performance snapshot"
              }
              onShare={() => shareCard("kda")}
            />
            <StatCard
              title="Player ID"
              value={parsed?.puuid ? "Resolved" : "—"}
              sub={parsed?.puuid ? "PUUID available" : "Identity resolution"}
              onShare={() => shareCard("player")}
            />
          </div>

          <div style={styles.noteBar}>
            <strong>Note:</strong> This is post-match analytics only. Nexio.gg provides no real-time assistance,
            automation, or gameplay modification.
          </div>

          {/* Best champion */}
          <div style={styles.block}>
            <div style={styles.blockHead}>
              <div>
                <div style={styles.sectionTitle}>Best champion breakdown</div>
                <div style={styles.sectionSub}>A compact breakdown from the recent sample.</div>
              </div>
              {hasBest ? <span style={styles.readyPill}>READY</span> : null}
            </div>

            {hasBest ? (
              <div style={styles.bestCard}>
                <div style={styles.bestTop}>
                  <div style={styles.bestLeft}>
                    <div style={styles.bestAvatar}>
                      {parsed.best.champion_name?.slice(0, 1)?.toUpperCase() || "C"}
                    </div>
                    <div>
                      <div style={styles.bestName}>{parsed.best.champion_name}</div>
                      <div style={styles.bestSub}>Best champion (recent)</div>
                    </div>
                  </div>
                </div>

                <div style={styles.bestGrid}>
                  <div style={styles.bestMini}>
                    <div style={styles.bestMiniLabel}>Games</div>
                    <div style={styles.bestMiniValue}>{parsed.best.games ?? "—"}</div>
                  </div>
                  <div style={styles.bestMini}>
                    <div style={styles.bestMiniLabel}>Avg KDA</div>
                    <div style={styles.bestMiniValue}>{parsed.best.avg_kda ?? "—"}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.emptyBox}>
                <div style={styles.emptyTitle}>Not enough data yet</div>
                <div style={styles.emptySub}>
                  Best champion breakdown will appear after more recent matches are available.
                </div>
              </div>
            )}
          </div>

          {/* Roles */}
          <div style={styles.block}>
            <div style={styles.blockHead}>
              <div>
                <div style={styles.sectionTitle}>Role distribution</div>
                <div style={styles.sectionSub}>Based on recent matches — mini bar chart.</div>
              </div>
            </div>

            {parsed?.roles?.length ? (
              <div style={styles.rolesCard}>
                {parsed.roles.map((r) => (
                  <ProgressRow
                    key={r.role}
                    label={r.role}
                    count={r.count}
                    pct={r.pct}
                  />
                ))}
              </div>
            ) : (
              <div style={styles.emptyBox}>
                <div style={styles.emptyTitle}>No role data yet.</div>
                <div style={styles.emptySub}>
                  Run an analysis to see role distribution based on recent matches.
                </div>
              </div>
            )}
          </div>

          {/* Policy */}
          <div style={styles.policyCard}>
            <div style={styles.sectionTitle}>Policy & disclaimer</div>
            <div style={styles.policySub}>
              Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games.
            </div>
            <div style={styles.pills}>
              <span style={styles.pill}>Post-match only</span>
              <span style={styles.pill}>No real-time assistance</span>
              <span style={styles.pill}>No automation / scripting</span>
              <span style={styles.pill}>No betting / gambling</span>
              <span style={styles.pill}>No gameplay modification</span>
              <span style={styles.pill}>No competitive advantage</span>
            </div>
          </div>
        </section>

        {/* Toast */}
        {toastMsg ? <div style={styles.toast}>{toastMsg}</div> : null}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 700px at 15% 10%, rgba(124,58,237,0.28), transparent 58%), radial-gradient(900px 600px at 80% 20%, rgba(59,130,246,0.20), transparent 55%), #070b16",
    color: "#e8eefc",
  },
  container: {
    maxWidth: 1020,
    margin: "0 auto",
    padding: "34px 18px 52px",
  },

  hero: {
    marginBottom: 18,
    padding: "10px 6px 4px",
  },
  kickerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "rgba(232,238,252,0.72)",
    fontSize: 12,
    letterSpacing: 0.6,
  },
  kicker: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: 900,
  },
  kickerDots: { opacity: 0.45 },
  kickerSub: { opacity: 0.85 },

  h1: {
    margin: "12px 0 8px",
    fontSize: 46,
    lineHeight: 1.05,
    letterSpacing: -0.6,
  },
  gradText: {
    background:
      "linear-gradient(90deg, rgba(168,85,247,1), rgba(59,130,246,1))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  sub: {
    margin: 0,
    maxWidth: 820,
    color: "rgba(232,238,252,0.74)",
    lineHeight: 1.6,
  },

  mainCard: {
    marginTop: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 26px 90px rgba(0,0,0,0.45)",
    backdropFilter: "blur(10px)",
  },

  // FORM GRID (fixes your layout problem)
  formGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) 220px 160px 140px",
    gap: 12,
    alignItems: "end",
  },
  fieldWide: { minWidth: 0 },
  field: { minWidth: 0 },
  fieldBtn: { minWidth: 0 },

  label: {
    display: "block",
    fontSize: 12,
    color: "rgba(232,238,252,0.75)",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e8eefc",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e8eefc",
    outline: "none",
  },
  runBtn: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(59,130,246,0.88))",
    color: "#fff",
    fontWeight: 900,
  },
  resetBtn: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    color: "rgba(232,238,252,0.85)",
    fontWeight: 900,
  },

  quickRow: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  quickLeft: { display: "flex", alignItems: "center", gap: 8, opacity: 0.9 },
  quickIcon: { fontSize: 12, opacity: 0.85 },
  quickLabel: { fontSize: 12, color: "rgba(232,238,252,0.72)", fontWeight: 800 },
  quickChips: { display: "flex", gap: 8, flexWrap: "wrap" },
  chipBtn: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(232,238,252,0.9)",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  alertError: {
    marginTop: 12,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.10)",
    color: "#ffd7d7",
  },

  resultHead: {
    marginTop: 16,
    paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  resultMeta: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(232,238,252,0.75)",
  },
  helperSmall: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(232,238,252,0.60)",
  },
  resultActions: { display: "flex", gap: 10, alignItems: "center" },
  copyBtn: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.92)",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  analyzedCard: {
    marginTop: 14,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
  },
  analyzedTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  analyzedTitleRow: { display: "flex", gap: 10, alignItems: "center" },
  analyzedTitle: { fontWeight: 900, fontSize: 13 },
  analyzedCollapseHint: { opacity: 0.6 },
  analyzedLine: {
    marginTop: 10,
    fontSize: 12,
    color: "rgba(232,238,252,0.78)",
  },
  analyzedHint: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(232,238,252,0.55)",
  },

  statsGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },

  statCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
    minHeight: 108,
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  statTitle: {
    fontSize: 12,
    color: "rgba(232,238,252,0.72)",
    fontWeight: 900,
  },
  shareMiniBtn: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    color: "rgba(232,238,252,0.92)",
    cursor: "pointer",
  },
  statValue: { fontSize: 28, fontWeight: 950, marginTop: 12 },
  statSub: { marginTop: 8, fontSize: 12, color: "rgba(232,238,252,0.60)" },

  noteBar: {
    marginTop: 12,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.20)",
    color: "rgba(232,238,252,0.70)",
    fontSize: 12,
  },

  block: { marginTop: 14 },
  blockHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 10,
  },

  sectionTitle: { fontWeight: 950, fontSize: 13 },
  sectionSub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.60)" },

  readyPill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
    fontSize: 12,
    opacity: 0.9,
  },

  emptyBox: {
    borderRadius: 16,
    border: "1px dashed rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.02)",
    padding: 14,
  },
  emptyTitle: { fontWeight: 900 },
  emptySub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.60)" },

  bestCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
  },
  bestTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  bestLeft: { display: "flex", gap: 12, alignItems: "center" },
  bestAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(59,130,246,0.35))",
    border: "1px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 950,
    color: "#fff",
  },
  bestName: { fontWeight: 950, fontSize: 16 },
  bestSub: { marginTop: 4, fontSize: 12, color: "rgba(232,238,252,0.60)" },

  bestGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  bestMini: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 12,
  },
  bestMiniLabel: { fontSize: 12, color: "rgba(232,238,252,0.65)", fontWeight: 900 },
  bestMiniValue: { marginTop: 8, fontSize: 18, fontWeight: 950 },

  rolesCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
  },
  roleRow: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: 14,
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  roleLeft: { minWidth: 0 },
  roleName: { fontWeight: 950 },
  roleMeta: { marginTop: 4, fontSize: 12, color: "rgba(232,238,252,0.60)" },
  roleBar: {
    height: 12,
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  roleFill: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(168,85,247,0.9), rgba(59,130,246,0.9))",
  },

  policyCard: {
    marginTop: 16,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 16,
  },
  policySub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.65)" },
  pills: { marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10 },
  pill: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    fontSize: 12,
    fontWeight: 900,
    color: "rgba(232,238,252,0.85)",
  },

  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  dot: { margin: "0 8px", opacity: 0.45 },

  toast: {
    position: "fixed",
    left: "50%",
    bottom: 22,
    transform: "translateX(-50%)",
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.70)",
    color: "rgba(232,238,252,0.95)",
    fontWeight: 900,
    fontSize: 12,
    boxShadow: "0 16px 60px rgba(0,0,0,0.45)",
    zIndex: 9999,
  },
};

/**
 * =========================================================
 * NOTE: Responsive fallback (pure inline style limitation)
 * =========================================================
 * Inline style ile media query yok. Ama grid zaten çoğu ekranda
 * iyi davranır. Eğer mobilde daha da iyi olsun istersen,
 * bir sonraki adımda components/layout.css gibi global CSS ekleriz.
 */
