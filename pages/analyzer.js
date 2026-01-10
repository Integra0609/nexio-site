// pages/analyzer.js
import { useEffect, useMemo, useState } from "react";

/* =========================
   ENV
========================= */
const SUPABASE_FN_URL =
  process.env.NEXT_PUBLIC_SUPABASE_FN_URL ||
  "https://YOUR_PROJECT.supabase.co/functions/v1/get-player-insights";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/* =========================
   CONSTANTS
========================= */
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

/* =========================
   HELPERS
========================= */
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
    return "—";
  }
}

function clampPct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

/* =========================
   UI COMPONENTS
========================= */
function StatCard({ title, value, sub, onShare }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={styles.statTitle}>{title}</div>
        {onShare && (
          <button onClick={onShare} style={styles.shareBtn}>
            ↗ Share
          </button>
        )}
      </div>
      <div style={styles.statValue}>{value}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );
}

function RoleBars({ roles }) {
  if (!roles || !roles.length) {
    return (
      <div style={styles.emptyBox}>
        <strong>No role data yet</strong>
        <div>Run analysis to see role distribution.</div>
      </div>
    );
  }

  return (
    <div style={styles.rolesWrap}>
      {roles
        .slice()
        .sort((a, b) => (b.pct || 0) - (a.pct || 0))
        .map((r) => {
          const pct = clampPct(r.pct);
          return (
            <div key={r.role} style={styles.roleRow}>
              <div>
                <div style={styles.roleName}>{r.role}</div>
                <div style={styles.roleMeta}>
                  {r.count} match • {pct}%
                </div>
              </div>
              <div style={styles.roleBarOuter}>
                <div
                  style={{ ...styles.roleBarInner, width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
    </div>
  );
}

/* =========================
   PAGE
========================= */
export default function Analyzer() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [raw, setRaw] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  /* -------- URL sync -------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URL(window.location.href);
    const n = u.searchParams.get("name");
    const r = u.searchParams.get("region");
    if (n) setName(n);
    if (r) setRegion(r);
    if (n) setTimeout(() => run(n, r || "tr1"), 100);
    // eslint-disable-next-line
  }, []);

  const parsed = useMemo(() => {
    if (!raw) return null;
    const i = raw.insights || {};
    return {
      sampleSize: i.sample_size ?? "—",
      kda: i.kda_trend?.last_10?.kda ?? "—",
      kdaSub: i.kda_trend
        ? `${i.kda_trend.last_10.games} game • ${i.kda_trend.last_10.winrate_pct}% WR`
        : "Recent performance snapshot",
      puuid: raw.puuid,
      best: i.best_champion,
      roles: i.role_distribution || [],
      source: raw.source || "LIVE",
    };
  }, [raw]);

  const run = async (nArg, rArg) => {
    const n = (nArg ?? name).trim();
    const r = rArg ?? region;

    if (!n) {
      setError("Summoner name required.");
      return;
    }

    setLoading(true);
    setError("");
    setRaw(null);

    try {
      const res = await fetch(
        `${SUPABASE_FN_URL}?name=${encodeURIComponent(
          n
        )}&region=${encodeURIComponent(r)}`,
        {
          headers: {
            authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setRaw(data);
      setUpdatedAt(new Date());

      const u = new URL(window.location.href);
      u.pathname = "/analyzer";
      u.searchParams.set("name", n);
      u.searchParams.set("region", r);
      window.history.replaceState({}, "", u.toString());
    } catch (e) {
      setError(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setName("");
    setRegion("tr1");
    setRaw(null);
    setError("");
    setUpdatedAt(null);
    window.history.replaceState({}, "", "/analyzer");
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert("Copy failed");
    }
  };

  const resultLink =
    typeof window !== "undefined" ? window.location.href : "";

  /* =========================
     RENDER
  ========================= */
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>
          Performance insights for{" "}
          <span style={styles.gradWord}>esports</span>.
        </h1>

        <section style={styles.card}>
          {/* FORM */}
          <div style={styles.formRow}>
            <div style={styles.fieldGrow}>
              <label style={styles.label}>Summoner name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. faker"
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
              <button
                onClick={() => run()}
                disabled={loading}
                style={styles.runBtn}
              >
                {loading ? "Running..." : "Run"}
              </button>
            </div>

            <div style={styles.btnFixed}>
              <button onClick={reset} style={styles.resetBtn}>
                Reset
              </button>
            </div>
          </div>

          {/* QUICK */}
          <div style={styles.quickRowFull}>
            <strong>⚡ Quick</strong>
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
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={styles.alertError}>{error}</div>}

          {/* RESULT */}
          <div style={styles.resultHeader}>
            <div>
              <strong>Result</strong>
              <div style={styles.metaRow}>
                Last updated: {updatedAt ? fmtDate(updatedAt) : "—"} • Source:{" "}
                {parsed?.source || "—"}
              </div>
            </div>

            <button
              style={styles.copyBtn}
              onClick={() => copy(resultLink)}
            >
              ⧉ Copy result link
            </button>
          </div>

          <div style={styles.grid}>
            <StatCard
              title="Sample size"
              value={parsed?.sampleSize || "—"}
              sub="Analyzed matches (recent)"
            />
            <StatCard
              title="Recent KDA"
              value={parsed?.kda || "—"}
              sub={parsed?.kdaSub}
            />
            <StatCard
              title="Player ID"
              value={parsed?.puuid ? "Resolved" : "—"}
              sub="Identity resolution"
            />
          </div>

          <div style={styles.section}>
            <strong>Best champion breakdown</strong>
            {parsed?.best ? (
              <div style={styles.bestBox}>
                {parsed.best.champion_name}
              </div>
            ) : (
              <div style={styles.emptyBox}>Not enough data yet</div>
            )}
          </div>

          <div style={styles.section}>
            <strong>Role distribution</strong>
            <RoleBars roles={parsed?.roles} />
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================
   STYLES
========================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#070b18",
    color: "#e8eefc",
  },
  container: { maxWidth: 1040, margin: "0 auto", padding: 32 },
  h1: { fontSize: 40, marginBottom: 18 },
  gradWord: {
    background: "linear-gradient(90deg,#7c3aed,#3b82f6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 18,
  },

  formRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  fieldGrow: { flex: "1 1 420px", minWidth: 260 },
  fieldFixed: { flex: "0 0 220px" },
  btnFixed: { flex: "0 0 160px" },

  label: { fontSize: 12, marginBottom: 6, display: "block" },
  input: { width: "100%", padding: 12, borderRadius: 12 },
  select: { width: "100%", padding: 12, borderRadius: 12 },

  runBtn: { width: "100%", padding: 12, fontWeight: 800 },
  resetBtn: { width: "100%", padding: 12 },

  quickRowFull: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  quickChips: { display: "flex", gap: 8, flexWrap: "wrap" },
  chipBtn: { padding: "6px 12px", borderRadius: 999 },

  alertError: {
    marginTop: 12,
    padding: 12,
    background: "rgba(239,68,68,0.15)",
    borderRadius: 12,
  },

  resultHeader: {
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  metaRow: { fontSize: 12, opacity: 0.7 },

  copyBtn: { padding: "8px 14px", borderRadius: 999 },

  grid: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 12,
  },
  statCard: {
    padding: 14,
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
  },
  statTop: { display: "flex", justifyContent: "space-between" },
  statTitle: { fontSize: 12, opacity: 0.7 },
  statValue: { fontSize: 24, fontWeight: 900 },
  statSub: { fontSize: 12, opacity: 0.7 },
  shareBtn: { fontSize: 12 },

  section: { marginTop: 18 },
  emptyBox: {
    marginTop: 8,
    padding: 12,
    border: "1px dashed rgba(255,255,255,0.2)",
    borderRadius: 12,
  },

  rolesWrap: { marginTop: 10, display: "grid", gap: 10 },
  roleRow: { display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 },
  roleName: { fontWeight: 800 },
  roleMeta: { fontSize: 12, opacity: 0.7 },
  roleBarOuter: { height: 10, background: "#111", borderRadius: 999 },
  roleBarInner: {
    height: "100%",
    background: "linear-gradient(90deg,#7c3aed,#22d3ee)",
    borderRadius: 999,
  },
};
