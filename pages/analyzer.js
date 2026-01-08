import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

const SUPABASE_PROJECT_REF = "lpoxlbbcmpxbfpfrufvf";
const SUPABASE_FN_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/get-player-insights`;

const regions = [
  { value: "tr1", label: "TR (tr1)" },
  { value: "euw1", label: "EUW (euw1)" },
  { value: "na1", label: "NA (na1)" },
  { value: "kr", label: "KR (kr)" },
];

function isPlausibleDate(d) {
  if (!(d instanceof Date)) return false;
  if (Number.isNaN(d.getTime())) return false;
  // epoch/garip tarihler görünmesin
  return d.getFullYear() >= 2010 && d.getFullYear() <= 2100;
}

function formatDateLabel(value) {
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (!isPlausibleDate(d)) return null;
    return d.toLocaleString();
  } catch {
    return null;
  }
}

function buildShareUrl({ name, region, card }) {
  const base = `${window.location.origin}/analyzer?name=${encodeURIComponent(
    name
  )}&region=${encodeURIComponent(region)}`;
  return card ? `${base}#${card}` : base;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function ShareIcon() {
  return <span style={styles.shareIcon} aria-hidden="true">↗</span>;
}

function SectionTitle({ title, sub, right }) {
  return (
    <div style={styles.sectionHead}>
      <div>
        <div style={styles.sectionTitle}>{title}</div>
        {sub ? <div style={styles.sectionSub}>{sub}</div> : null}
      </div>
      {right ? <div style={styles.sectionRight}>{right}</div> : null}
    </div>
  );
}

function StatCard({ id, title, value, sub, onShare, badge }) {
  return (
    <div id={id} style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={styles.statTitle}>{title}</div>

        <div style={styles.statTopRight}>
          {badge ? <span style={styles.smallBadge}>{badge}</span> : null}
          {onShare ? (
            <button
              type="button"
              onClick={onShare}
              style={styles.shareBtn}
              title="Copy link to this card"
            >
              <ShareIcon /> Share
            </button>
          ) : null}
        </div>
      </div>

      <div style={styles.statValue}>{value}</div>
      {sub ? <div style={styles.statSub}>{sub}</div> : null}
    </div>
  );
}

function RoleBars({ roles }) {
  // roles: [{role, count, pct}]
  const normalized = (roles || [])
    .map((r) => ({
      role: String(r.role || "").toUpperCase(),
      count: Number(r.count ?? 0),
      pct: Number(r.pct ?? 0),
    }))
    .sort((a, b) => b.pct - a.pct);

  if (!normalized.length) {
    return <div style={styles.emptyBox}>No role data yet.</div>;
  }

  return (
    <div style={styles.roleWrap}>
      {normalized.map((r) => (
        <div key={r.role} style={styles.roleRow}>
          <div style={styles.roleLeft}>
            <div style={styles.roleName}>{r.role}</div>
            <div style={styles.roleMeta}>
              {r.count} match • {clamp(r.pct, 0, 100)}%
            </div>
          </div>

          <div style={styles.roleBarOuter}>
            <div
              style={{
                ...styles.roleBarInner,
                width: `${clamp(r.pct, 0, 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChampionBreakdown({ champ }) {
  // champ: { champion_name, games, avg_kda } or null
  if (!champ) {
    return (
      <div style={styles.emptyBox}>
        <div style={styles.emptyTitle}>Not enough data yet</div>
        <div style={styles.emptySub}>
          Best champion breakdown will appear after more recent matches are available.
        </div>
      </div>
    );
  }

  const name = champ.champion_name || "-";
  const games = champ.games ?? "-";
  const avgKda = champ.avg_kda ?? "-";

  return (
    <div style={styles.champBox}>
      <div style={styles.champTop}>
        <div style={styles.champAvatar}>
          <span style={styles.champLetter}>
            {String(name).trim().charAt(0).toUpperCase() || "C"}
          </span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={styles.champName}>{name}</div>
          <div style={styles.champSub}>Best champion (recent)</div>
        </div>
        <div style={styles.champRight}>
          <span style={styles.readyPill}>READY</span>
        </div>
      </div>

      <div style={styles.champGrid}>
        <div style={styles.champStat}>
          <div style={styles.champStatLabel}>Games</div>
          <div style={styles.champStatValue}>{games}</div>
        </div>
        <div style={styles.champStat}>
          <div style={styles.champStatLabel}>Avg KDA</div>
          <div style={styles.champStatValue}>{avgKda}</div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }) {
  return <span style={styles.chip}>{children}</span>;
}

export default function Analyzer() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState(null);

  const [toast, setToast] = useState("");
  const [highlightId, setHighlightId] = useState(null);

  const didAutoRunRef = useRef(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1400);
  };

  const parsed = useMemo(() => {
    if (!raw) return null;

    const insights = raw.insights || null;

    const lastSynced =
      raw?.player?.last_synced_at ||
      raw?.player?.lastSyncedAt ||
      raw?.last_synced_at ||
      null;

    return {
      ok: !!raw.ok,
      source: raw.source || "beta",
      puuid: raw.puuid || raw?.player?.puuid || null,

      sampleSize: insights?.sample_size ?? null,
      last10: insights?.kda_trend?.last_10 ?? null,
      roles: insights?.role_distribution || [],
      bestChamp: insights?.best_champion || null,

      lastSyncedAt: lastSynced,
      receivedAt: new Date(),
    };
  }, [raw]);

  const lastUpdatedLabel = useMemo(() => {
    if (!parsed) return null;
    const s = formatDateLabel(parsed.lastSyncedAt);
    if (s) return s;
    const r = formatDateLabel(parsed.receivedAt);
    return r ? `${r} (just now)` : "Just now";
  }, [parsed]);

  const normalizeUrl = (finalName, finalRegion) => {
    router.replace(
      { pathname: "/analyzer", query: { name: finalName, region: finalRegion } },
      undefined,
      { shallow: true }
    );
  };

  const scrollToHashIfAny = () => {
    if (typeof window === "undefined") return;
    const hash = (window.location.hash || "").replace("#", "").trim();
    if (!hash) return;

    const el = document.getElementById(hash);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(hash);
    setTimeout(() => setHighlightId(null), 1600);
  };

  const run = async (overrideName, overrideRegion, opts = {}) => {
    const finalName = (overrideName ?? name).trim();
    const finalRegion = overrideRegion ?? region;

    if (!finalName) {
      setError("Please enter a summoner name.");
      return;
    }

    setLoading(true);
    setError(null);
    setRaw(null);

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
      if (!opts.skipUrlUpdate) normalizeUrl(finalName, finalRegion);
      else normalizeUrl(finalName, finalRegion);

      setTimeout(() => scrollToHashIfAny(), 80);
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

  const copyResultLink = async () => {
    if (!name.trim()) return;
    const url = buildShareUrl({ name: name.trim(), region, card: "" });
    await navigator.clipboard.writeText(url);
    showToast("Link copied");
  };

  const copyCardLink = async (cardId) => {
    if (!name.trim()) return;
    const url = buildShareUrl({ name: name.trim(), region, card: cardId });
    await navigator.clipboard.writeText(url);
    showToast("Card link copied");
  };

  const reset = () => {
    setName("");
    setRegion("tr1");
    setError(null);
    setRaw(null);
    if (typeof window !== "undefined") window.location.hash = "";
    router.replace({ pathname: "/analyzer" }, undefined, { shallow: true });
  };

  // auto-fill + auto-run from URL once
  useEffect(() => {
    if (!router.isReady) return;
    if (didAutoRunRef.current) return;

    const qName = router.query.name;
    const qRegion = router.query.region;

    const n = typeof qName === "string" ? qName : "";
    const r = typeof qRegion === "string" ? qRegion : "tr1";

    if (n) setName(n);
    if (r) setRegion(r);

    if (n && r) {
      didAutoRunRef.current = true;
      run(n, r, { skipUrlUpdate: true });
    } else {
      didAutoRunRef.current = true;
      setTimeout(() => scrollToHashIfAny(), 120);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // hashchange scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => scrollToHashIfAny();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kdaValue =
    parsed?.last10?.kda != null ? parsed.last10.kda : "-";
  const kdaSub =
    parsed?.last10
      ? `${parsed.last10.games} game • ${parsed.last10.winrate_pct}% WR`
      : "No data yet";

  const sampleValue = parsed?.sampleSize ?? "-";

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Hero */}
        <header style={styles.hero}>
          <div style={styles.heroBadgeRow}>
            <span style={styles.heroBadge}>ANALYZER</span>
            <span style={styles.heroMini}>
              Post-match only • Policy-aware
            </span>
          </div>

          <h1 style={styles.heroH1}>
            Performance insights for <span style={styles.gradText}>esports</span>.
          </h1>
          <p style={styles.heroP}>
            Clean summaries based on recently available public match data.
            Shareable links included — built for clarity, designed to be policy-aware.
          </p>
        </header>

        {/* Main card */}
        <section style={styles.panel}>
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
                  ...styles.primaryBtn,
                  opacity: loading ? 0.8 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Analyzing..." : "Run"}
              </button>
            </div>

            <div style={styles.fieldTiny}>
              <label style={styles.label}>&nbsp;</label>
              <button
                onClick={reset}
                disabled={loading}
                style={{
                  ...styles.secondaryBtn,
                  opacity: loading ? 0.65 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {toast ? <div style={styles.toast}>{toast}</div> : null}

          {error ? (
            <div style={styles.alertError}>
              <strong>Request failed:</strong> {error}
              <div style={styles.alertHint}>
                Tip: Try another region or retry if rate-limited.
              </div>
            </div>
          ) : null}

          {/* Result header */}
          <div style={styles.resultBlock}>
            <SectionTitle
              title="Result"
              sub={
                parsed
                  ? `Last updated: ${lastUpdatedLabel} • Source: ${String(
                      parsed.source
                    ).toUpperCase()}`
                  : "Run an analysis to see results. You can share result links and card links."
              }
              right={
                <button
                  onClick={copyResultLink}
                  disabled={!name.trim()}
                  style={{
                    ...styles.copyBtn,
                    opacity: name.trim() ? 1 : 0.55,
                    cursor: name.trim() ? "pointer" : "not-allowed",
                  }}
                  title="Copy result link"
                >
                  Copy result link
                </button>
              }
            />

            {/* Highlights */}
            <div style={styles.grid}>
              <div style={highlightId === "sample" ? styles.highlightWrap : null}>
                <StatCard
                  id="sample"
                  title="Sample size"
                  value={parsed ? sampleValue : "—"}
                  sub="Analyzed matches (recent)"
                  onShare={parsed ? () => copyCardLink("sample") : null}
                  badge={parsed ? (parsed.ok ? "OK" : "CHECK") : null}
                />
              </div>

              <div style={highlightId === "kda" ? styles.highlightWrap : null}>
                <StatCard
                  id="kda"
                  title="Recent KDA"
                  value={parsed ? kdaValue : "—"}
                  sub={parsed ? kdaSub : "Recent performance snapshot"}
                  onShare={parsed ? () => copyCardLink("kda") : null}
                />
              </div>

              <div style={highlightId === "player" ? styles.highlightWrap : null}>
                <StatCard
                  id="player"
                  title="Player ID"
                  value={parsed ? (parsed.puuid ? "Resolved" : "—") : "—"}
                  sub={parsed ? (parsed.puuid ? "PUUID available" : "Not provided") : "Identity resolution"}
                  onShare={parsed ? () => copyCardLink("player") : null}
                />
              </div>
            </div>

            {/* Best champion */}
            <div
              id="champion"
              style={highlightId === "champion" ? styles.highlightWrap : null}
            >
              <SectionTitle
                title="Best champion breakdown"
                sub="A compact breakdown from the recent sample."
                right={
                  parsed ? (
                    <button
                      onClick={() => copyCardLink("champion")}
                      style={styles.smallShare}
                      title="Copy link to this section"
                    >
                      <ShareIcon /> Share section
                    </button>
                  ) : null
                }
              />
              <ChampionBreakdown champ={parsed?.bestChamp || null} />
            </div>

            {/* Roles */}
            <div
              id="roles"
              style={highlightId === "roles" ? styles.highlightWrap : null}
            >
              <SectionTitle
                title="Role distribution"
                sub="Based on recent matches — mini bar chart."
                right={
                  parsed ? (
                    <button
                      onClick={() => copyCardLink("roles")}
                      style={styles.smallShare}
                      title="Copy link to this section"
                    >
                      <ShareIcon /> Share section
                    </button>
                  ) : null
                }
              />
              <RoleBars roles={parsed?.roles || []} />
            </div>

            {/* Policy / disclaimer */}
            <div style={styles.policy}>
              <SectionTitle
                title="Policy & disclaimer"
                sub="Nexio.gg is not affiliated with, endorsed, sponsored, or approved by Riot Games."
              />
              <div style={styles.chips}>
                <Chip>Post-match only</Chip>
                <Chip>No real-time assistance</Chip>
                <Chip>No automation / scripting</Chip>
                <Chip>No betting / gambling</Chip>
                <Chip>No gameplay modification</Chip>
                <Chip>No competitive advantage</Chip>
              </div>
            </div>
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
      "radial-gradient(1200px 700px at 18% 12%, rgba(124,58,237,0.28), transparent 60%), radial-gradient(900px 520px at 82% 22%, rgba(59,130,246,0.20), transparent 55%), #0b1020",
    color: "#e8eefc",
  },
  container: { maxWidth: 1060, margin: "0 auto", padding: "44px 20px 28px" },

  hero: {
    marginBottom: 14,
    padding: "6px 2px 14px",
  },
  heroBadgeRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  heroBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: 950,
  },
  heroMini: { color: "rgba(232,238,252,0.68)", fontSize: 12, fontWeight: 800 },
  heroH1: { margin: "14px 0 10px", fontSize: 44, lineHeight: 1.06, letterSpacing: -0.5 },
  gradText: {
    background: "linear-gradient(90deg, rgba(124,58,237,1), rgba(59,130,246,1))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  heroP: {
    margin: 0,
    color: "rgba(232,238,252,0.75)",
    maxWidth: 840,
    lineHeight: 1.6,
    fontSize: 14,
  },

  panel: {
    marginTop: 6,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 22px 90px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },

  formRow: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" },
  field: { flex: "1 1 340px", minWidth: 260 },
  fieldSmall: { flex: "0 0 200px", minWidth: 170 },
  fieldTiny: { flex: "0 0 120px", minWidth: 120 },
  label: { display: "block", fontSize: 12, color: "rgba(232,238,252,0.75)", marginBottom: 6 },

  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e8eefc",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e8eefc",
    outline: "none",
  },
  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.92), rgba(59,130,246,0.85))",
    color: "#fff",
    fontWeight: 950,
  },
  secondaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.92)",
    fontWeight: 950,
  },

  toast: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(34,197,94,0.30)",
    background: "rgba(34,197,94,0.10)",
    color: "rgba(220,252,231,0.95)",
    fontWeight: 950,
    fontSize: 13,
  },

  alertError: {
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.10)",
    color: "#ffd7d7",
  },
  alertHint: { marginTop: 8, color: "rgba(255,215,215,0.9)" },

  resultBlock: {
    marginTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    paddingTop: 18,
  },

  sectionHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  sectionTitle: { fontWeight: 950, fontSize: 14 },
  sectionSub: { marginTop: 6, color: "rgba(232,238,252,0.70)", fontSize: 12, lineHeight: 1.5 },
  sectionRight: { display: "flex", alignItems: "center", gap: 10 },

  copyBtn: {
    padding: "9px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.92)",
    fontWeight: 950,
  },
  smallShare: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(232,238,252,0.88)",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },

  highlightWrap: {
    borderRadius: 18,
    boxShadow: "0 0 0 2px rgba(59,130,246,0.55), 0 20px 70px rgba(59,130,246,0.12)",
    transition: "box-shadow 250ms ease",
  },

  statCard: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 16,
    minHeight: 118,
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  statTopRight: { display: "flex", alignItems: "center", gap: 8 },
  statTitle: { fontSize: 12, color: "rgba(232,238,252,0.72)", fontWeight: 900 },
  statValue: { fontSize: 26, fontWeight: 950, marginTop: 10 },
  statSub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.65)" },

  smallBadge: {
    padding: "5px 9px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: 0.6,
    color: "rgba(232,238,252,0.9)",
  },

  shareBtn: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(232,238,252,0.88)",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  shareIcon: {
    display: "inline-block",
    width: 18,
    height: 18,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    lineHeight: "18px",
    textAlign: "center",
    fontSize: 12,
    opacity: 0.95,
  },

  emptyBox: {
    borderRadius: 18,
    border: "1px dashed rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.02)",
    padding: 16,
    color: "rgba(232,238,252,0.75)",
  },
  emptyTitle: { fontWeight: 950, marginBottom: 6 },
  emptySub: { fontSize: 12, color: "rgba(232,238,252,0.65)", lineHeight: 1.5 },

  champBox: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 16,
    marginBottom: 16,
  },
  champTop: { display: "flex", alignItems: "center", gap: 12 },
  champAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.20))",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  champLetter: { fontWeight: 950, fontSize: 16, color: "rgba(232,238,252,0.95)" },
  champName: { fontWeight: 950, fontSize: 16 },
  champSub: { fontSize: 12, color: "rgba(232,238,252,0.68)", marginTop: 3 },
  champRight: { marginLeft: "auto" },
  readyPill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontWeight: 950,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  champGrid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  champStat: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 12,
  },
  champStatLabel: { fontSize: 12, color: "rgba(232,238,252,0.70)", fontWeight: 900 },
  champStatValue: { marginTop: 8, fontSize: 18, fontWeight: 950 },

  roleWrap: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 16,
    marginBottom: 16,
  },
  roleRow: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: 14,
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  roleLeft: { minWidth: 0 },
  roleName: { fontWeight: 950, fontSize: 12, letterSpacing: 0.6 },
  roleMeta: { marginTop: 4, fontSize: 12, color: "rgba(232,238,252,0.65)" },
  roleBarOuter: {
    height: 12,
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  roleBarInner: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(124,58,237,0.95), rgba(59,130,246,0.95))",
    boxShadow: "0 10px 30px rgba(59,130,246,0.18)",
  },

  policy: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.16)",
    padding: 16,
    marginTop: 10,
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 },
  chip: {
    padding: "9px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(232,238,252,0.88)",
    fontSize: 12,
    fontWeight: 900,
  },

  footer: {
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    color: "rgba(232,238,252,0.60)",
    fontSize: 12,
  },
  footerSmall: { opacity: 0.9 },
  footerLinks: { display: "flex", alignItems: "center", gap: 10 },
  link: { color: "rgba(232,238,252,0.82)", textDecoration: "none", fontWeight: 850 },
  dot: { opacity: 0.6 },
};
