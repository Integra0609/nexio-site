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

function safeDateLabel(isoOrDate) {
  try {
    const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return null;
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

function ShareIcon() {
  return (
    <span style={styles.shareIcon} aria-hidden="true">
      ↗
    </span>
  );
}

function StatCard({ id, title, value, sub, onShare }) {
  return (
    <div id={id} style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={styles.statTitle}>{title}</div>

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

      <div style={styles.statValue}>{value}</div>
      {sub ? <div style={styles.statSub}>{sub}</div> : null}
    </div>
  );
}

export default function Demo() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState(null);

  const [copiedMsg, setCopiedMsg] = useState("");
  const [highlightId, setHighlightId] = useState(null);

  const didAutoRunRef = useRef(false);

  const flashCopied = (msg) => {
    setCopiedMsg(msg);
    setTimeout(() => setCopiedMsg(""), 1400);
  };

  const parsed = useMemo(() => {
    if (!raw?.insights) return null;

    const lastSynced =
      raw?.player?.last_synced_at ||
      raw?.player?.lastSyncedAt ||
      raw?.last_synced_at ||
      null;

    return {
      ok: !!raw.ok,
      source: raw.source || "beta",
      puuid: raw.puuid || raw?.player?.puuid || null,
      sampleSize: raw.insights.sample_size ?? null,
      last10: raw.insights.kda_trend?.last_10 ?? null,
      roles: raw.insights.role_distribution || [],
      lastSyncedAt: lastSynced,
      receivedAt: new Date(),
    };
  }, [raw]);

  const lastUpdatedLabel = useMemo(() => {
    if (!parsed) return null;
    const fromCache = safeDateLabel(parsed.lastSyncedAt);
    if (fromCache) return fromCache;
    const received = safeDateLabel(parsed.receivedAt);
    return received ? `${received} (just now)` : "Just now";
  }, [parsed]);

  const normalizeUrl = (finalName, finalRegion) => {
    router.replace(
      { pathname: "/analyzer", query: { name: finalName, region: finalRegion } },
      undefined,
      { shallow: true }
    );
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

      // after successful fetch, we can scroll to hash if present
      setTimeout(() => {
        scrollToHashIfAny();
      }, 60);
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

  // ✅ scroll + highlight when link has #cardId
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

  // Auto-fill + auto-run from URL once
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
      // even without auto-run, if user visits /analyzer#kda, still try scroll after render
      setTimeout(() => scrollToHashIfAny(), 80);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // If hash changes while on page, scroll to it
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => scrollToHashIfAny();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyResultLink = async () => {
    if (!name.trim()) return;
    const url = buildShareUrl({ name: name.trim(), region, card: "" });
    await navigator.clipboard.writeText(url);
    flashCopied("Link copied");
  };

  const copyCardLink = async (cardId) => {
    if (!name.trim()) return;
    const url = buildShareUrl({ name: name.trim(), region, card: cardId });
    await navigator.clipboard.writeText(url);
    flashCopied("Card link copied");
  };

  const clear = () => {
    setName("");
    setRegion("tr1");
    setError(null);
    setRaw(null);
    if (typeof window !== "undefined") window.location.hash = "";
    router.replace({ pathname: "/analyzer" }, undefined, { shallow: true });
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.badge}>ANALYZER</div>
          <h1 style={styles.h1}>Insights (Beta)</h1>
          <p style={styles.p}>
            Post-match insights based on a recent sample. Shareable links included.
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

          {copiedMsg ? <div style={styles.toast}>{copiedMsg}</div> : null}

          {error ? (
            <div style={styles.alertError}>
              <strong>Request failed:</strong> {error}
              <div style={styles.alertHint}>
                Tip: Try another region or retry if rate-limited.
              </div>
            </div>
          ) : null}

          {parsed ? (
            <>
              <div style={styles.resultHeader}>
                <div>
                  <div style={styles.resultTitle}>Result</div>
                  <div style={styles.resultMeta}>
                    <span style={styles.metaKey}>Last updated:</span>{" "}
                    <span style={styles.metaVal}>{lastUpdatedLabel}</span>
                    <span style={styles.metaSep}>•</span>
                    <span style={styles.metaKey}>Source:</span>{" "}
                    <span style={styles.metaVal}>{String(parsed.source).toUpperCase()}</span>
                  </div>
                </div>

                <div style={styles.resultActions}>
                  <button onClick={copyResultLink} style={styles.copyBtn} title="Copy result link">
                    Copy result link
                  </button>
                </div>
              </div>

              <div style={styles.grid}>
                <div style={highlightId === "sample" ? styles.highlightWrap : null}>
                  <StatCard
                    id="sample"
                    title="Sample size"
                    value={parsed.sampleSize ?? "-"}
                    sub="Analyzed matches (recent)"
                    onShare={() => copyCardLink("sample")}
                  />
                </div>

                <div style={highlightId === "kda" ? styles.highlightWrap : null}>
                  <StatCard
                    id="kda"
                    title="Recent KDA"
                    value={parsed.last10?.kda != null ? parsed.last10.kda : "-"}
                    sub={
                      parsed.last10
                        ? `${parsed.last10.games} game • ${parsed.last10.winrate_pct}% WR`
                        : "No data"
                    }
                    onShare={() => copyCardLink("kda")}
                  />
                </div>

                <div style={highlightId === "player" ? styles.highlightWrap : null}>
                  <StatCard
                    id="player"
                    title="Player ID"
                    value={parsed.puuid ? "Resolved" : "-"}
                    sub={parsed.puuid ? "PUUID available" : "Not provided"}
                    onShare={() => copyCardLink("player")}
                  />
                </div>
              </div>

              <div style={styles.note}>
                <strong>Note:</strong> This is post-match analytics only. Nexio.gg provides no
                real-time assistance, automation, or gameplay modification.
              </div>
            </>
          ) : (
            <div style={styles.helper}>
              <div style={styles.helperTitle}>Quick start</div>
              <div style={styles.helperText}>
                Enter a summoner name → select region → <strong>Run</strong>. Then share the result
                link or a specific card link (Share button).
              </div>
            </div>
          )}
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
  container: { maxWidth: 980, margin: "0 auto", padding: "40px 20px 28px" },

  header: { marginBottom: 14 },
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
  h1: { margin: "10px 0 6px", fontSize: 40, lineHeight: 1.1 },
  p: { margin: 0, color: "rgba(232,238,252,0.75)", maxWidth: 760, lineHeight: 1.6 },

  card: {
    marginTop: 14,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 20px 80px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },

  formRow: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" },
  field: { flex: "1 1 320px", minWidth: 240 },
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

  toast: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(34,197,94,0.30)",
    background: "rgba(34,197,94,0.10)",
    color: "rgba(220,252,231,0.95)",
    fontWeight: 900,
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

  helper: {
    marginTop: 16,
    padding: "14px 14px",
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.03)",
  },
  helperTitle: { fontWeight: 950, marginBottom: 6 },
  helperText: { color: "rgba(232,238,252,0.78)" },

  resultHeader: {
    marginTop: 18,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 14,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    flexWrap: "wrap",
  },
  resultTitle: { fontWeight: 950, fontSize: 14 },
  resultMeta: { marginTop: 6, color: "rgba(232,238,252,0.75)", fontSize: 12 },
  metaKey: { color: "rgba(232,238,252,0.62)" },
  metaVal: { color: "rgba(232,238,252,0.92)", fontWeight: 800 },
  metaSep: { margin: "0 8px", opacity: 0.5 },

  resultActions: { display: "flex", gap: 10, alignItems: "center" },
  copyBtn: {
    padding: "9px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.92)",
    fontWeight: 950,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
    marginTop: 14,
  },

  // Highlight wrapper when opened via #hash link
  highlightWrap: {
    borderRadius: 18,
    boxShadow: "0 0 0 2px rgba(59,130,246,0.55), 0 20px 70px rgba(59,130,246,0.12)",
    transition: "box-shadow 250ms ease",
  },

  statCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 14,
  },
  statTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  statTitle: { fontSize: 12, color: "rgba(232,238,252,0.72)", fontWeight: 900 },
  statValue: { fontSize: 24, fontWeight: 950, marginTop: 10 },
  statSub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.65)" },

  shareBtn: {
    padding: "6px 10px",
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

  note: {
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(232,238,252,0.78)",
    fontSize: 12,
    lineHeight: 1.6,
  },
};
