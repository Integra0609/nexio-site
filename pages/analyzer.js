// pages/analyzer.js
import { useEffect, useMemo, useState } from "react";

const SUPABASE_FN_URL =
  process.env.NEXT_PUBLIC_SUPABASE_FN_URL ||
  "https://lpoxlbbcmpxbfpfrufvf.supabase.co/functions/v1/get-player-insights";

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

function clampPct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

function fmtDate(d) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

function StatCard({ title, value, sub, onShare }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={styles.statTitle}>{title}</div>
        {onShare ? (
          <button type="button" onClick={onShare} style={styles.shareBtn}>
            ↗️ <span style={{ marginLeft: 6 }}>Share</span>
          </button>
        ) : null}
      </div>
      <div style={styles.statValue}>{value}</div>
      {sub ? <div style={styles.statSub}>{sub}</div> : null}
    </div>
  );
}

function RoleBars({ roles }) {
  if (!roles?.length) {
    return (
      <div style={styles.emptyBox}>
        <div style={{ fontWeight: 900, marginBottom: 6 }}>No role data yet</div>
        Run analysis to see role distribution.
      </div>
    );
  }

  const sorted = [...roles].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  return (
    <div style={styles.rolesWrap}>
      {sorted.map((r) => {
        const pct = clampPct(r.pct);
        return (
          <div key={r.role} style={styles.roleRow}>
            <div style={styles.roleLeft}>
              <div style={styles.roleName}>{r.role}</div>
              <div style={styles.roleMeta}>
                {r.count ?? 0} match • {pct}%
              </div>
            </div>
            <div style={styles.roleBarOuter}>
              <div style={{ ...styles.roleBarInner, width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AIRecapCard({ raw, onCopyLink }) {
  // Expected shape:
  // raw.ai_recap = { recap: { summary, strengths[], improvements[], key_factors[] }, meta: {...} }
  const r = raw?.ai_recap?.recap || null;
  const meta = raw?.ai_recap?.meta || null;

  return (
    <div style={styles.aiCard}>
      <div style={styles.aiHeader}>
        <div>
          <div style={styles.aiTitle}>
            AI Recap <span style={styles.beta}>BETA</span>
          </div>
          <div style={styles.aiSub}>Post-match analysis • Read-only • Shareable</div>
        </div>

        <button type="button" style={styles.copyBtnSmall} onClick={onCopyLink}>
          ⧉ Copy link
        </button>
      </div>

      {!raw ? (
        <div style={styles.aiLoading}>Run an analysis to generate an AI recap.</div>
      ) : r ? (
        <div style={styles.aiBody}>
          <div style={styles.aiMetaLine}>
            <span style={styles.metaItem}>
              Source: <span style={styles.mono}>{meta?.source || "ai"}</span>
            </span>
            <span style={styles.dot}>•</span>
            <span style={styles.metaItem}>
              Model: <span style={styles.mono}>{meta?.model || "—"}</span>
            </span>
          </div>

          <p style={styles.aiSummary}>{r.summary}</p>

          <div style={styles.aiGrid}>
            <div style={styles.aiPanel}>
              <div style={styles.aiLabel}>Strengths</div>
              <ul style={styles.aiList}>
                {(r.strengths || []).slice(0, 2).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>

            <div style={styles.aiPanel}>
              <div style={styles.aiLabel}>Improvement areas</div>
              <ul style={styles.aiList}>
                {(r.improvements || []).slice(0, 2).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={styles.aiLabel}>Key factors</div>
            <ul style={styles.aiListInline}>
              {(r.key_factors || []).slice(0, 2).map((k, i) => (
                <li key={i}>{k}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div style={styles.aiLoading}>
          Generating recap… (If this stays here, your function still returns mock/no AI yet.)
        </div>
      )}
    </div>
  );
}

export default function Analyzer() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [raw, setRaw] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  // URL -> state (shareable)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    const n = u.searchParams.get("name");
    const r = u.searchParams.get("region");
    if (n) setName(n);
    if (r) setRegion(r);

    // auto-run for share links
    if (n) setTimeout(() => run(n, r || "tr1", { syncUrl: false }), 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsed = useMemo(() => {
    if (!raw) return null;
    const insights = raw.insights || {};
    return {
      ok: raw.ok ?? true,
      source: raw.source ?? "LIVE",
      puuid: raw.puuid ?? null,
      sampleSize: insights.sample_size ?? null,
      last10: insights.kda_trend?.last_10 ?? null,
      best: insights.best_champion ?? null,
      roles: Array.isArray(insights.role_distribution)
        ? insights.role_distribution
        : [],
    };
  }, [raw]);

  const syncUrl = (n, r) => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    u.pathname = "/analyzer";
    u.searchParams.set("name", n);
    u.searchParams.set("region", r);
    u.searchParams.delete("focus");
    window.history.replaceState({}, "", u.toString());
  };

  const buildResultLink = (n = name, r = region) => {
    const u = new URL(window.location.href);
    u.pathname = "/analyzer";
    u.searchParams.set("name", (n || "").trim());
    u.searchParams.set("region", r || "tr1");
    u.searchParams.delete("focus");
    return u.toString();
  };

  const buildCardLink = (focusKey) => {
    const u = new URL(buildResultLink());
    u.searchParams.set("focus", focusKey);
    return u.toString();
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch {
        return false;
      }
    }
  };

  const run = async (nArg, rArg, opts = { syncUrl: true }) => {
    const n = (nArg ?? name).trim();
    const r = (rArg ?? region) || "tr1";

    setError("");
    setRaw(null);

    if (!n) {
      setError("Summoner name required.");
      return;
    }

    setLoading(true);
    try {
      const url = `${SUPABASE_FN_URL}?name=${encodeURIComponent(
        n
      )}&region=${encodeURIComponent(r)}`;

      // NOTE: For now we do plain fetch (public function).
      // Later we will add a server-side proxy or secret/JWT for production security.
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error || data?.message || `Request failed (${res.status})`
        );
      }

      setRaw(data);
      setUpdatedAt(new Date());
      if (opts.syncUrl !== false) syncUrl(n, r);
    } catch (e) {
      setError(e?.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError("");
    setRaw(null);
    setUpdatedAt(null);
    setName("");
    setRegion("tr1");

    if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      u.pathname = "/analyzer";
      u.search = "";
      window.history.replaceState({}, "", u.toString());
    }
  };

  const onEnter = (e) => {
    if (e.key === "Enter") run();
  };

  const focus = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const u = new URL(window.location.href);
      return u.searchParams.get("focus");
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, updatedAt]);

  const glow = (key) =>
    focus === key
      ? {
          boxShadow:
            "0 0 0 2px rgba(124,58,237,0.35), 0 26px 90px rgba(0,0,0,0.35)",
          borderRadius: 16,
        }
      : null;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.hero}>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>ANALYZER</span>
            <span style={styles.badgeSoft}>Post-match only</span>
            <span style={styles.badgeSoft}>Policy-aware</span>
          </div>

          <h1 style={styles.h1}>
            Performance insights for{" "}
            <span style={styles.gradWord}>esports</span>.
          </h1>

          <p style={styles.lead}>
            Clean summaries based on recently available public match data.
            Shareable links included — built for clarity, designed to be
            policy-aware.
          </p>
        </header>

        <section style={styles.card}>
          {/* ✅ FORM: Overlap kesin yok (flex-wrap) */}
          <div style={styles.formRow}>
            <div style={styles.fieldGrow}>
              <label style={styles.label}>Summoner name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={onEnter}
                placeholder="e.g. faker"
                autoComplete="off"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldFixed}>
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

            <div style={styles.btnFixed}>
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

            <div style={styles.btnFixed}>
              <label style={styles.label}>&nbsp;</label>
              <button onClick={reset} style={styles.resetBtn}>
                Reset
              </button>
            </div>
          </div>

          {/* QUICK: full width */}
          <div style={styles.quickRowFull}>
            <div style={styles.quickLeft}>
              <span style={styles.quickIcon}>⚡</span>
              <span style={styles.quickLabel}>Quick</span>
            </div>
            <div style={styles.quickChips}>
              {quickPresets.map((p) => (
                <button
                  key={p.label}
                  style={styles.chipBtn}
                  type="button"
                  onClick={() => {
                    setName(p.name);
                    setRegion(p.region);
                    run(p.name, p.region);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div style={styles.alertError}>
              <strong>Request failed:</strong> {error}
            </div>
          ) : null}

          <div style={styles.resultHeader}>
            <div>
              <div style={styles.sectionTitle}>Result</div>
              <div style={styles.sectionSub}>
                Run an analysis to see results. Copy/share links are included.
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaItem}>
                  Last updated:{" "}
                  <span style={styles.mono}>
                    {updatedAt ? fmtDate(updatedAt) : "—"}
                  </span>
                </span>
                <span style={styles.dot}>•</span>
                <span style={styles.metaItem}>
                  Source:{" "}
                  <span style={styles.mono}>{parsed?.source || "—"}</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              style={{
                ...styles.copyBtn,
                opacity: name.trim() ? 1 : 0.6,
                cursor: name.trim() ? "pointer" : "not-allowed",
              }}
              disabled={!name.trim()}
              onClick={async () => {
                const ok = await copy(buildResultLink());
                if (!ok) alert("Copy failed.");
              }}
            >
              ⧉ Copy result link
            </button>
          </div>

          <div style={styles.grid}>
            <div style={glow("sample")}>
              <StatCard
                title="Sample size"
                value={parsed?.sampleSize ?? "—"}
                sub="Analyzed matches (recent)"
                onShare={
                  name.trim()
                    ? async () => {
                        const ok = await copy(buildCardLink("sample"));
                        if (!ok) alert("Copy failed.");
                      }
                    : null
                }
              />
            </div>

            <div style={glow("kda")}>
              <StatCard
                title="Recent KDA"
                value={parsed?.last10?.kda != null ? parsed.last10.kda : "—"}
                sub={
                  parsed?.last10
                    ? `${parsed.last10.games} game • ${parsed.last10.winrate_pct}% WR`
                    : "Recent performance snapshot"
                }
                onShare={
                  name.trim()
                    ? async () => {
                        const ok = await copy(buildCardLink("kda"));
                        if (!ok) alert("Copy failed.");
                      }
                    : null
                }
              />
            </div>

            <div style={glow("id")}>
              <StatCard
                title="Player ID"
                value={parsed?.puuid ? "Resolved" : "—"}
                sub={parsed?.puuid ? "PUUID available" : "Identity resolution"}
                onShare={
                  name.trim()
                    ? async () => {
                        const ok = await copy(buildCardLink("id"));
                        if (!ok) alert("Copy failed.");
                      }
                    : null
                }
              />
            </div>
          </div>

          {/* ✅ AI Recap v1 (UI) */}
          <div style={{ marginTop: 16 }}>
            <AIRecapCard
              raw={raw}
              onCopyLink={async () => {
                const ok = await copy(buildCardLink("ai"));
                if (!ok) alert("Copy failed.");
              }}
            />
          </div>

          <div style={styles.noteBox}>
            <strong>Note:</strong> Post-match analytics only. Nexio.gg provides no
            real-time assistance, automation, scripting, or gameplay
            modification.
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={styles.sectionTitle}>Best champion breakdown</div>
            <div style={styles.sectionSub}>
              Compact breakdown from the recent sample.
            </div>

            {parsed?.best ? (
              <div style={styles.bestBox}>
                <div style={styles.bestTop}>
                  <div style={styles.bestIcon}>
                    {String(parsed.best.champion_name || "C")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.bestName}>
                      {parsed.best.champion_name}
                    </div>
                    <div style={styles.bestSub}>Best champion (recent)</div>
                  </div>
                  <div style={styles.readyPill}>READY</div>
                </div>

                <div style={styles.bestGrid}>
                  <div style={styles.bestStat}>
                    <div style={styles.bestLabel}>Games</div>
                    <div style={styles.bestValue}>
                      {parsed.best.games ?? "—"}
                    </div>
                  </div>
                  <div style={styles.bestStat}>
                    <div style={styles.bestLabel}>Avg KDA</div>
                    <div style={styles.bestValue}>
                      {parsed.best.avg_kda ?? "—"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.emptyBox}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>
                  Not enough data yet
                </div>
                Best champion breakdown will appear after more recent matches are
                available.
              </div>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={styles.sectionTitle}>Role distribution</div>
            <div style={styles.sectionSub}>
              Based on recent matches — mini bar chart.
            </div>
            <div style={{ marginTop: 10 }}>
              <RoleBars roles={parsed?.roles} />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={styles.policyBox}>
              <div style={styles.sectionTitle}>Policy & disclaimer</div>
              <div style={styles.sectionSub}>
                Nexio.gg is not affiliated with, endorsed, sponsored, or
                approved by Riot Games.
              </div>
              <div style={styles.policyChips}>
                {[
                  "Post-match only",
                  "No real-time assistance",
                  "No automation / scripting",
                  "No betting / gambling",
                  "No gameplay modification",
                  "No competitive advantage",
                ].map((t) => (
                  <span key={t} style={styles.policyChip}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          <div style={styles.footerSmall}>©️ 2026 Nexio.gg</div>
          <div style={styles.footerLinks}>
            <a href="/" style={styles.footerLink}>
              Home
            </a>
            <span style={styles.dot}>•</span>
            <a href="/terms" style={styles.footerLink}>
              Terms
            </a>
            <span style={styles.dot}>•</span>
            <a href="/privacy" style={styles.footerLink}>
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
      "radial-gradient(1200px 600px at 15% 12%, rgba(124,58,237,0.22), transparent 60%), radial-gradient(900px 500px at 85% 18%, rgba(59,130,246,0.18), transparent 55%), #070b18",
    color: "#e8eefc",
  },
  container: { maxWidth: 1040, margin: "0 auto", padding: "42px 20px 26px" },

  hero: { marginBottom: 16 },
  badgeRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: 800,
  },
  badgeSoft: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontSize: 12,
    color: "rgba(232,238,252,0.75)",
  },
  h1: {
    margin: "14px 0 10px",
    fontSize: 44,
    lineHeight: 1.08,
    letterSpacing: -0.6,
    fontFamily: "ui-serif, Georgia, serif",
  },
  gradWord: {
    background:
      "linear-gradient(90deg, rgba(124,58,237,1), rgba(59,130,246,1))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  lead: {
    margin: 0,
    maxWidth: 820,
    color: "rgba(232,238,252,0.72)",
    lineHeight: 1.6,
  },

  card: {
    marginTop: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 26px 90px rgba(0,0,0,0.40)",
    backdropFilter: "blur(10px)",
  },

  // ✅ Overlap kesin yok: flex + wrap
  formRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "flex-end",
  },
  fieldGrow: { flex: "1 1 520px", minWidth: 320 },
  fieldFixed: { flex: "0 0 260px", minWidth: 220 },
  btnFixed: { flex: "0 0 180px", minWidth: 160 },

  label: {
    display: "block",
    fontSize: 12,
    color: "rgba(232,238,252,0.75)",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e8eefc",
    outline: "none",
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e8eefc",
    outline: "none",
  },
  runBtn: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.92), rgba(59,130,246,0.88))",
    color: "#fff",
    fontWeight: 900,
  },
  resetBtn: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(232,238,252,0.86)",
    fontWeight: 800,
    cursor: "pointer",
  },

  quickRowFull: {
    width: "100%",
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  quickLeft: { display: "flex", alignItems: "center", gap: 8 },
  quickIcon: { opacity: 0.9 },
  quickLabel: {
    fontSize: 12,
    fontWeight: 900,
    color: "rgba(232,238,252,0.75)",
  },
  quickChips: { display: "flex", gap: 10, flexWrap: "wrap" },
  chipBtn: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(232,238,252,0.9)",
    borderRadius: 999,
    padding: "8px 12px",
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
  sectionTitle: { fontWeight: 900, fontSize: 13 },
  sectionSub: {
    marginTop: 6,
    color: "rgba(232,238,252,0.70)",
    fontSize: 12,
  },
  metaRow: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    color: "rgba(232,238,252,0.62)",
    fontSize: 12,
  },
  metaItem: { display: "inline-flex", gap: 6, alignItems: "center" },
  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  dot: { opacity: 0.5 },

  copyBtn: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.92)",
    fontWeight: 900,
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
  statTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  statTitle: {
    fontSize: 12,
    color: "rgba(232,238,252,0.72)",
    fontWeight: 900,
  },
  statValue: { fontSize: 26, fontWeight: 900, marginTop: 8 },
  statSub: { marginTop: 6, fontSize: 12, color: "rgba(232,238,252,0.65)" },
  shareBtn: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(232,238,252,0.85)",
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },

  // ✅ AI Recap card (premium + safe)
  aiCard: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
  },
  aiHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },
  aiTitle: { fontWeight: 900, fontSize: 13 },
  beta: {
    marginLeft: 6,
    fontSize: 11,
    padding: "2px 6px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    opacity: 0.9,
  },
  aiSub: { marginTop: 4, fontSize: 12, color: "rgba(232,238,252,0.65)" },
  copyBtnSmall: {
    padding: "9px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.22)",
    color: "rgba(232,238,252,0.92)",
    fontWeight: 900,
    cursor: "pointer",
  },
  aiBody: { marginTop: 10 },
  aiMetaLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    color: "rgba(232,238,252,0.62)",
    fontSize: 12,
    marginBottom: 10,
  },
  aiSummary: {
    margin: 0,
    lineHeight: 1.7,
    color: "rgba(232,238,252,0.90)",
  },
  aiGrid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  aiPanel: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 12,
  },
  aiLabel: { fontWeight: 900, fontSize: 12, marginBottom: 6 },
  aiList: { paddingLeft: 18, margin: 0, color: "rgba(232,238,252,0.85)" },
  aiListInline: {
    paddingLeft: 18,
    margin: 0,
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    color: "rgba(232,238,252,0.85)",
  },
  aiLoading: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(232,238,252,0.78)",
    fontSize: 12,
    lineHeight: 1.6,
  },

  noteBox: {
    marginTop: 12,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(232,238,252,0.78)",
    fontSize: 12,
    lineHeight: 1.6,
  },

  emptyBox: {
    marginTop: 10,
    padding: "14px 14px",
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(232,238,252,0.78)",
    fontSize: 12,
    lineHeight: 1.6,
  },

  bestBox: {
    marginTop: 10,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    overflow: "hidden",
  },
  bestTop: {
    padding: 14,
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  bestIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.14)",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.85))",
  },
  bestName: { fontWeight: 900, fontSize: 16 },
  bestSub: { marginTop: 2, fontSize: 12, color: "rgba(232,238,252,0.65)" },
  readyPill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 900,
  },
  bestGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    padding: 14,
  },
  bestStat: {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 12,
  },
  bestLabel: { fontSize: 12, color: "rgba(232,238,252,0.65)" },
  bestValue: { marginTop: 6, fontWeight: 900, fontSize: 18 },

  rolesWrap: { display: "grid", gap: 12 },
  roleRow: {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: 14,
    alignItems: "center",
  },
  roleLeft: { display: "grid", gap: 4 },
  roleName: { fontWeight: 900, fontSize: 13 },
  roleMeta: { fontSize: 12, color: "rgba(232,238,252,0.65)" },
  roleBarOuter: {
    height: 12,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  roleBarInner: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, rgba(124,58,237,0.95), rgba(34,211,238,0.85))",
  },

  policyBox: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
  },
  policyChips: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 },
  policyChip: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(232,238,252,0.88)",
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
    paddingBottom: 10,
  },
  footerSmall: { opacity: 0.9 },
  footerLinks: { display: "flex", alignItems: "center", gap: 10 },
  footerLink: { color: "rgba(232,238,252,0.78)", textDecoration: "none" },
};
