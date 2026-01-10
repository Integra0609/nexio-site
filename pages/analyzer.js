// pages/analyzer.js
import { useEffect, useMemo, useState } from "react";

const SUPABASE_FN_URL =
  process.env.NEXT_PUBLIC_SUPABASE_FN_URL ||
  "https://lpoxlbbcmpxbfpfrufvf.supabase.co/functions/v1/get-player-insights";

// (Opsiyonel) AI recap endpoint'in olursa buraya koyarsın (yoksa UI “Coming soon” gösterir)
const AI_RECAP_URL = process.env.NEXT_PUBLIC_AI_RECAP_URL || "";

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
    return d?.toISOString?.() || "";
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

// Basit local rate limit (MVP)
// Günlük X kere recap üretmeye izin ver (guest için).
function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function readDailyCount(key) {
  try {
    const raw = localStorage.getItem(key);
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}
function writeDailyCount(key, n) {
  try {
    localStorage.setItem(key, String(n));
  } catch {}
}

export default function Analyzer() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [raw, setRaw] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  // AI recap UI state
  const [recapLoading, setRecapLoading] = useState(false);
  const [recapError, setRecapError] = useState("");
  const [recapText, setRecapText] = useState("");

  // URL -> state (shareable)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    const n = u.searchParams.get("name");
    const r = u.searchParams.get("region");
    if (n) setName(n);
    if (r) setRegion(r);

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
    setRecapError("");
    setRecapText("");

    if (!n) {
      setError("Summoner name required.");
      return;
    }

    setLoading(true);
    try {
      const url = `${SUPABASE_FN_URL}?name=${encodeURIComponent(
        n
      )}&region=${encodeURIComponent(r)}`;

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
    setRecapError("");
    setRecapText("");

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
  }, [raw, updatedAt, error, loading, name, region]);

  const glow = (key) =>
    focus === key
      ? {
          boxShadow:
            "0 0 0 2px rgba(124,58,237,0.35), 0 26px 90px rgba(0,0,0,0.35)",
          borderRadius: 16,
        }
      : null;

  // AI recap (read-only UI)
  const DAILY_LIMIT_GUEST = 3;
  const canGenerateRecap = () => {
    if (typeof window === "undefined") return false;
    const k = `nexio:recap:${getTodayKey()}`;
    const used = readDailyCount(k);
    return used < DAILY_LIMIT_GUEST;
  };
  const incRecapCount = () => {
    if (typeof window === "undefined") return;
    const k = `nexio:recap:${getTodayKey()}`;
    const used = readDailyCount(k);
    writeDailyCount(k, used + 1);
  };

  const buildRecapLink = () => {
    const u = new URL(buildResultLink());
    u.searchParams.set("focus", "recap");
    return u.toString();
  };

  const generateRecap = async () => {
    setRecapError("");
    setRecapText("");

    const n = name.trim();
    if (!n) {
      setRecapError("Enter a summoner name first.");
      return;
    }
    if (!parsed) {
      setRecapError("Run analysis first.");
      return;
    }

    // MVP rate limit (guest)
    if (!canGenerateRecap()) {
      setRecapError(
        `Daily limit reached (guest). Login gating will come with Auth.`
      );
      return;
    }

    // Backend yoksa şimdilik “coming soon”
    if (!AI_RECAP_URL) {
      incRecapCount();
      setRecapText(
        "AI recap is wired in the UI. Next step is the recap endpoint + Auth gating (logged-in only)."
      );
      return;
    }

    setRecapLoading(true);
    try {
      const url = `${AI_RECAP_URL}?name=${encodeURIComponent(
        n
      )}&region=${encodeURIComponent(region)}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || data?.message || "Recap failed");
      incRecapCount();
      setRecapText(String(data?.recap || data?.text || "").trim() || "—");
    } catch (e) {
      setRecapError(e?.message || "Recap failed");
    } finally {
      setRecapLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      {/* Native select dropdown tonlarını iyileştirmek için global CSS */}
      <style jsx global>{`
        :root {
          color-scheme: dark;
        }
        select {
          color-scheme: dark;
        }
        /* Bazı tarayıcılarda option list’e yansır, bazılarında yansımaz */
        select option {
          background: #0a0f22;
          color: #e8eefc;
        }
      `}</style>

      <div style={styles.container}>
        <header style={styles.hero}>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>ANALYZER</span>
            <span style={styles.badgeSoft}>Post-match only</span>
            <span style={styles.badgeSoft}>Policy-aware</span>
          </div>

          <h1 style={styles.h1}>
            Performance insights for <span style={styles.gradWord}>esports</span>.
          </h1>

          <p style={styles.lead}>
            Clean summaries based on recently available public match data.
            Shareable links included — built for clarity, designed to be policy-aware.
          </p>
        </header>

        <section style={styles.card}>
          {/* ✅ FORM: Summoner field daraltıldı + overlap yok */}
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
              <div style={styles.selectWrap}>
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
                <span style={styles.selectCaret}>▾</span>
              </div>
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

          {/* QUICK */}
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

          {/* ✅ AI Insight / Recap (read-only MVP UI) */}
          <div style={{ marginTop: 14 }} />
          <div style={glow("recap")}>
            <div style={styles.aiCard}>
              <div style={styles.aiTop}>
                <div>
                  <div style={styles.aiTitleRow}>
                    <span style={styles.sectionTitle}>AI Recap</span>
                    <span style={styles.aiBeta}>BETA</span>
                  </div>
                  <div style={styles.sectionSub}>
                    Read-only. Shareable. (MVP: local rate limit, Product: login only)
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    style={{
                      ...styles.copyBtn,
                      opacity: name.trim() ? 1 : 0.6,
                      cursor: name.trim() ? "pointer" : "not-allowed",
                    }}
                    disabled={!name.trim()}
                    onClick={async () => {
                      const ok = await copy(buildRecapLink());
                      if (!ok) alert("Copy failed.");
                    }}
                  >
                    ⧉ Copy link
                  </button>

                  <button
                    type="button"
                    onClick={generateRecap}
                    disabled={recapLoading}
                    style={{
                      ...styles.runBtnSmall,
                      opacity: recapLoading ? 0.7 : 1,
                      cursor: recapLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {recapLoading ? "Generating..." : "Generate AI recap"}
                  </button>
                </div>
              </div>

              {recapError ? (
                <div style={styles.alertError}>
                  <strong>AI recap:</strong> {recapError}
                </div>
              ) : null}

              {recapText ? (
                <div style={styles.aiBody}>{recapText}</div>
              ) : (
                <div style={styles.aiEmpty}>
                  Run an analysis to generate an AI recap.
                </div>
              )}
            </div>
          </div>

          <div style={styles.noteBox}>
            <strong>Note:</strong> Post-match analytics only. Nexio.gg provides no
            real-time assistance, automation, scripting, or gameplay modification.
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
                Nexio.gg is not affiliated with, endorsed, sponsored, or approved by
                Riot Games.
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
    // ✅ Tarayıcıya dark UI sinyali (native controls)
    colorScheme: "dark",
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
    background: "linear-gradient(90deg, rgba(124,58,237,1), rgba(59,130,246,1))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  lead: { margin: 0, maxWidth: 820, color: "rgba(232,238,252,0.72)", lineHeight: 1.6 },

  card: {
    marginTop: 18,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 20,
    padding: 18,
    boxShadow: "0 26px 90px rgba(0,0,0,0.40)",
    backdropFilter: "blur(10px)",
  },

  // ✅ Summoner daha dar (önce çok genişti)
  formRow: { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" },
  fieldGrow: { flex: "1 1 420px", minWidth: 280 }, // <-- daralttık
  fieldFixed: { flex: "0 0 250px", minWidth: 220 },
  btnFixed: { flex: "0 0 170px", minWidth: 150 },

  label: { display: "block", fontSize: 12, color: "rgba(232,238,252,0.75)", marginBottom: 6 },
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

  // ✅ Select wrapper + caret
  selectWrap: { position: "relative" },
  selectCaret: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-10%)",
    pointerEvents: "none",
    opacity: 0.7,
    fontWeight: 900,
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 38px 12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e8eefc",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    // ✅ native dropdown tonlarını koyulaştırma
    colorScheme: "dark",
  },

  runBtn: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.92), rgba(59,130,246,0.88))",
    color: "#fff",
    fontWeight: 900,
  },
  runBtnSmall: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, rgba(124,58,237,0.92), rgba(59,130,246,0.88))",
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
  quickLabel: { fontSize: 12, fontWeight: 900, color: "rgba(232,238,252,0.75)" },
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
  sectionSub: { marginTop: 6, color: "rgba(232,238,252,0.70)", fontSize: 12 },
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
  statTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  statTitle: { fontSize: 12, color: "rgba(232,238,252,0.72)", fontWeight: 900 },
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

  // AI Recap card
  aiCard: {
    marginTop: 14,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
  },
  aiTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  aiTitleRow: { display: "flex", alignItems: "center", gap: 10 },
  aiBeta: {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 11,
    fontWeight: 900,
    color: "rgba(232,238,252,0.88)",
  },
  aiEmpty: {
    marginTop: 10,
    padding: "14px 14px",
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(232,238,252,0.78)",
    fontSize: 12,
    lineHeight: 1.6,
  },
  aiBody: {
    marginTop: 10,
    padding: "14px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(232,238,252,0.86)",
    fontSize: 13,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
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
    background: "linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.85))",
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
  bestGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, padding: 14 },
  bestStat: { borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", padding: 12 },
  bestLabel: { fontSize: 12, color: "rgba(232,238,252,0.65)" },
  bestValue: { marginTop: 6, fontWeight: 900, fontSize: 18 },

  rolesWrap: { display: "grid", gap: 12 },
  roleRow: { display: "grid", gridTemplateColumns: "160px 1fr", gap: 14, alignItems: "center" },
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
    background: "linear-gradient(90deg, rgba(124,58,237,0.95), rgba(34,211,238,0.85))",
  },

  policyBox: { borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)", padding: 14 },
  policyChips: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 },
  policyChip: { padding: "8px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 800, color: "rgba(232,238,252,0.88)" },

  footer: { marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", color: "rgba(232,238,252,0.60)", fontSize: 12, paddingBottom: 10 },
  footerSmall: { opacity: 0.9 },
  footerLinks: { display: "flex", alignItems: "center", gap: 10 },
  footerLink: { color: "rgba(232,238,252,0.78)", textDecoration: "none" },
};
