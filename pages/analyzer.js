import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

/**
 * Analyzer (Premium Product UI)
 * ✅ Form hizası fix
 * ✅ Loading skeleton
 * ✅ Empty-state + hızlı örnekler
 * ✅ Copy toast (result link + card link)
 * ✅ Last updated (1970 bug yok)
 * ✅ Shareable URL (query + hash)
 * ✅ Best champ + role mini bar chart + policy chips
 * ✅ NEW: "What we analyzed" row
 * ✅ NEW: Confidence / sample quality chip
 */

const regions = [
  { value: "tr1", label: "TR (tr1)" },
  { value: "euw1", label: "EUW (euw1)" },
  { value: "na1", label: "NA (na1)" },
  { value: "kr", label: "KR (kr)" },
];

// Eğer env yoksa fallback (kendinle değiştir)
const FALLBACK_FN_URL =
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-player-insights";

const INSIGHTS_FN_URL =
  process.env.NEXT_PUBLIC_INSIGHTS_FN_URL || FALLBACK_FN_URL;

const QUICK_SAMPLES = [
  { name: "faker", region: "kr" },
  { name: "Doublelift", region: "na1" },
  { name: "Caps", region: "euw1" },
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function pct(n) {
  if (n == null || Number.isNaN(Number(n))) return 0;
  return clamp(Math.round(Number(n)), 0, 100);
}
function formatDateTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "-";
  }
}
function buildResultUrl(origin, name, region) {
  const n = encodeURIComponent((name || "").trim());
  const r = encodeURIComponent(region || "tr1");
  return `${origin}/analyzer?name=${n}&region=${r}`;
}
function niceRegionLabel(value) {
  const found = regions.find((r) => r.value === value);
  return found ? found.label : value || "-";
}
function normalizeName(n) {
  return (n || "").trim();
}
function computeQuality(sampleSize) {
  const s = Number(sampleSize || 0);
  if (!s) return { level: "empty", label: "No sample", desc: "Run to analyze recent matches." };
  if (s >= 12) return { level: "high", label: "High confidence", desc: "Good recent sample size." };
  if (s >= 6) return { level: "med", label: "Medium confidence", desc: "Decent recent sample." };
  return { level: "low", label: "Low confidence", desc: "Small recent sample." };
}

function Icon({ kind }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" };
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (kind === "size") {
    return (
      <svg {...common}>
        <path {...stroke} d="M4 7h16M7 4v6M17 4v6M6 20h12M9 17v6M15 17v6" />
      </svg>
    );
  }
  if (kind === "kda") {
    return (
      <svg {...common}>
        <path {...stroke} d="M4 19V5" />
        <path {...stroke} d="M4 19h16" />
        <path {...stroke} d="M8 15l3-4 3 2 4-6" />
      </svg>
    );
  }
  if (kind === "id") {
    return (
      <svg {...common}>
        <path
          {...stroke}
          d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3z"
        />
        <path {...stroke} d="M2 19c1.5-3 4-5 7-5" />
        <path
          {...stroke}
          d="M16 14c-2.5 0-4.5 1.5-5.5 5H22c-.5-3.5-3-5-6-5z"
        />
      </svg>
    );
  }
  if (kind === "share") {
    return (
      <svg {...common}>
        <path {...stroke} d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
        <path {...stroke} d="M16 6l-4-4-4 4" />
        <path {...stroke} d="M12 2v14" />
      </svg>
    );
  }
  if (kind === "copy") {
    return (
      <svg {...common}>
        <path {...stroke} d="M9 9h10v10H9z" />
        <path
          {...stroke}
          d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        />
      </svg>
    );
  }
  if (kind === "bolt") {
    return (
      <svg {...common}>
        <path {...stroke} d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    );
  }
  if (kind === "info") {
    return (
      <svg {...common}>
        <path {...stroke} d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" />
        <path {...stroke} d="M12 16v-5" />
        <path {...stroke} d="M12 8h.01" />
      </svg>
    );
  }
  return null;
}

function SkeletonCard({ title, icon }) {
  return (
    <div className="nx-card nx-stat">
      <div className="nx-stat-top">
        <div className="nx-stat-title">
          <span className="nx-icon">{icon}</span>
          {title}
        </div>
        <div className="nx-skel-pill" />
      </div>
      <div className="nx-skel-value" />
      <div className="nx-skel-sub" />
    </div>
  );
}

function StatCard({ id, title, icon, value, sub, onShare }) {
  return (
    <div id={id} className="nx-card nx-stat">
      <div className="nx-stat-top">
        <div className="nx-stat-title">
          <span className="nx-icon">{icon}</span>
          {title}
        </div>

        {onShare ? (
          <button onClick={onShare} className="nx-chip-btn" type="button">
            <Icon kind="share" /> <span>Share</span>
          </button>
        ) : (
          <span className="nx-chip-muted">—</span>
        )}
      </div>

      <div className="nx-stat-value">{value}</div>
      {sub ? <div className="nx-stat-sub">{sub}</div> : null}
    </div>
  );
}

function RoleBars({ roles }) {
  if (!roles?.length) {
    return (
      <div className="nx-card nx-empty">
        <div className="nx-empty-title">No role data yet.</div>
        <div className="nx-empty-sub">
          Run an analysis to see role distribution based on recent matches.
        </div>
      </div>
    );
  }

  const sorted = [...roles].sort((a, b) => (b?.pct ?? 0) - (a?.pct ?? 0));

  return (
    <div className="nx-card nx-role">
      {sorted.map((r, idx) => {
        const p = pct(r.pct);
        const count = r.count ?? 0;

        return (
          <div
            key={r.role}
            className={`nx-role-row ${idx === sorted.length - 1 ? "nx-role-last" : ""}`}
          >
            <div className="nx-role-left">
              <div className="nx-role-name">{r.role}</div>
              <div className="nx-role-meta">
                {count} match{count === 1 ? "" : "es"} • {p}%
              </div>
            </div>

            <div className="nx-role-track">
              <div className="nx-role-fill" style={{ width: `${p}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChampionBreakdown({ bestChamp }) {
  if (!bestChamp?.champion_name) {
    return (
      <div className="nx-card nx-empty">
        <div className="nx-empty-title">Not enough data yet</div>
        <div className="nx-empty-sub">
          Best champion breakdown will appear after more recent matches are available.
        </div>
      </div>
    );
  }

  const games = bestChamp.games ?? "-";
  const kda = bestChamp.avg_kda ?? "-";
  const initial = (bestChamp.champion_name || "?").slice(0, 1).toUpperCase();

  return (
    <div className="nx-card nx-champ">
      <div className="nx-champ-top">
        <div className="nx-champ-left">
          <div className="nx-champ-avatar">{initial}</div>
          <div>
            <div className="nx-champ-name">{bestChamp.champion_name}</div>
            <div className="nx-champ-sub">Best champion (recent)</div>
          </div>
        </div>
        <div className="nx-chip">READY</div>
      </div>

      <div className="nx-champ-grid">
        <div className="nx-mini">
          <div className="nx-mini-label">Games</div>
          <div className="nx-mini-value">{games}</div>
        </div>
        <div className="nx-mini">
          <div className="nx-mini-label">Avg KDA</div>
          <div className="nx-mini-value">{kda}</div>
        </div>
      </div>
    </div>
  );
}

export default function Analyzer() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [raw, setRaw] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [toast, setToast] = useState(null); // {text, ts}

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const normalizedName = useMemo(() => normalizeName(name), [name]);

  const resultLink = useMemo(() => {
    if (!origin) return "";
    return buildResultUrl(origin, name, region);
  }, [origin, name, region]);

  // query ile gelirse formu doldur
  useEffect(() => {
    if (!router.isReady) return;
    const qName = typeof router.query.name === "string" ? router.query.name : "";
    const qRegion =
      typeof router.query.region === "string" ? router.query.region : "";

    if (qName) setName(qName);
    if (qRegion) setRegion(qRegion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const parsed = useMemo(() => {
    if (!raw?.insights) return null;

    const s = raw.insights.sample_size ?? null;
    const last10 = raw.insights.kda_trend?.last_10 ?? null;
    const bestChamp = raw.insights.best_champion ?? null;
    const roles = raw.insights.role_distribution ?? [];

    return {
      ok: !!raw.ok,
      source: raw.source || raw.meta?.source || "DEMO",
      sampleSize: s,
      last10,
      bestChamp,
      roles,
      puuid: raw.puuid || raw.player?.puuid || null,
    };
  }, [raw]);

  const quality = useMemo(() => computeQuality(parsed?.sampleSize), [parsed]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (text) => setToast({ text, ts: Date.now() });

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const copyResultLink = async () => {
    if (!resultLink) return;
    const ok = await copyToClipboard(resultLink);
    ok ? showToast("Result link copied") : alert("Copy failed:\n" + resultLink);
  };

  const shareCard = async (cardKey) => {
    if (!origin) return;
    const url = `${resultLink}#${encodeURIComponent(cardKey)}`;
    const ok = await copyToClipboard(url);
    ok ? showToast("Card link copied") : alert("Copy failed:\n" + url);
  };

  const run = async (overrideName, overrideRegion) => {
    setError(null);

    const n = (overrideName ?? name).trim();
    const r = overrideRegion ?? region;

    if (!n) {
      setError("Summoner name is required.");
      return;
    }

    setLoading(true);
    setRaw(null);
    try {
      const url = `${INSIGHTS_FN_URL}?name=${encodeURIComponent(
        n
      )}&region=${encodeURIComponent(r)}`;

      const res = await fetch(url);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Request failed");
      }

      setRaw(data);
      setLastUpdated(Date.now()); // ✅ 1970 bug yok

      // shareable query url yaz
      const nextUrl = `/analyzer?name=${encodeURIComponent(
        n
      )}&region=${encodeURIComponent(r)}`;
      router.replace(nextUrl, undefined, { shallow: true });
    } catch (e) {
      setRaw(null);
      setLastUpdated(null);
      setError(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setName("");
    setRegion("tr1");
    setRaw(null);
    setLastUpdated(null);
    setError(null);
    router.replace("/analyzer", undefined, { shallow: true });
  };

  const onEnter = (e) => {
    if (e.key === "Enter") run();
  };

  const applySample = (s) => {
    setName(s.name);
    setRegion(s.region);
    run(s.name, s.region);
  };

  return (
    <main className="nx-page">
      <div className="nx-container">
        {/* Hero */}
        <header className="nx-hero">
          <div className="nx-hero-row">
            <span className="nx-badge">ANALYZER</span>
            <span className="nx-hero-meta">
              Post-match only • Policy-aware • Shareable links
            </span>
          </div>

          <h1 className="nx-h1">
            Performance insights for <span className="nx-grad">esports</span>.
          </h1>
          <p className="nx-p">
            Clean summaries based on recently available public match data. Built
            for clarity — designed to be policy-aware.
          </p>
        </header>

        {/* Main card */}
        <section className="nx-card nx-panel">
          {/* Form */}
          <div className="nx-form">
            <div className="nx-field">
              <label className="nx-label">Summoner name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={onEnter}
                placeholder="e.g. faker"
                className="nx-input"
                autoComplete="off"
              />

              {/* Quick samples */}
              <div className="nx-samples">
                <span className="nx-samples-label">
                  <Icon kind="bolt" /> Quick:
                </span>
                {QUICK_SAMPLES.map((s) => (
                  <button
                    key={`${s.name}-${s.region}`}
                    className="nx-chip-btn"
                    type="button"
                    onClick={() => applySample(s)}
                    disabled={loading}
                    title="Run sample"
                  >
                    {s.name} • {s.region.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="nx-field">
              <label className="nx-label">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="nx-select"
              >
                {regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="nx-actions">
              <label className="nx-label">&nbsp;</label>
              <div className="nx-actions-row">
                <button
                  className="nx-btn"
                  onClick={() => run()}
                  disabled={loading}
                  type="button"
                >
                  {loading ? "Running..." : "Run"}
                </button>
                <button className="nx-btn-ghost" onClick={reset} type="button">
                  Reset
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="nx-alert">
              <strong>Request failed:</strong> {error}
            </div>
          ) : null}

          {/* Result header */}
          <div className="nx-result-head">
            <div>
              <div className="nx-section-title">Result</div>
              <div className="nx-result-meta">
                {parsed ? (
                  <>
                    Last updated:{" "}
                    <span className="nx-mono">
                      {lastUpdated ? formatDateTime(lastUpdated) : "-"}
                    </span>
                    <span className="nx-dot">•</span>
                    Source: <span className="nx-mono">{parsed.source}</span>
                  </>
                ) : (
                  "Run an analysis to see results. You can share result links and card links."
                )}
              </div>
            </div>

            <div className="nx-result-right">
              <button className="nx-copy" onClick={copyResultLink} type="button">
                <Icon kind="copy" /> <span>Copy result link</span>
              </button>
              {parsed ? (
                <div className="nx-pills">
                  <span className="nx-pill">BETA</span>
                  <span className={`nx-pill nx-pill-${quality.level}`}>
                    {quality.label}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* ✅ NEW: What we analyzed row */}
          <div className="nx-overview">
            <div className="nx-overview-left">
              <div className="nx-overview-title">
                <Icon kind="info" /> What we analyzed
              </div>

              <div className="nx-overview-items">
                <span className="nx-ov-item">
                  Summoner:{" "}
                  <span className="nx-mono">
                    {normalizedName || "—"}
                  </span>
                </span>
                <span className="nx-dot">•</span>
                <span className="nx-ov-item">
                  Region:{" "}
                  <span className="nx-mono">{niceRegionLabel(region)}</span>
                </span>
                <span className="nx-dot">•</span>
                <span className="nx-ov-item">
                  Sample:{" "}
                  <span className="nx-mono">
                    {parsed?.sampleSize ?? "—"}
                  </span>
                </span>
              </div>

              <div className="nx-overview-sub">{quality.desc}</div>
            </div>

            {parsed ? (
              <button
                className="nx-chip-btn"
                type="button"
                onClick={() => shareCard("result")}
                title="Copy link to this section"
              >
                <Icon kind="share" /> Result section link
              </button>
            ) : (
              <span className="nx-chip-muted">—</span>
            )}
          </div>

          {/* Stats */}
          <div className="nx-grid" id="result">
            {loading ? (
              <>
                <SkeletonCard title="Sample size" icon={<Icon kind="size" />} />
                <SkeletonCard title="Recent KDA" icon={<Icon kind="kda" />} />
                <SkeletonCard title="Player ID" icon={<Icon kind="id" />} />
              </>
            ) : (
              <>
                <StatCard
                  id="sample-size"
                  title="Sample size"
                  icon={<Icon kind="size" />}
                  value={parsed?.sampleSize ?? "—"}
                  sub="Analyzed matches (recent)"
                  onShare={parsed ? () => shareCard("sample-size") : null}
                />

                <StatCard
                  id="recent-kda"
                  title="Recent KDA"
                  icon={<Icon kind="kda" />}
                  value={
                    parsed?.last10?.kda != null ? String(parsed.last10.kda) : "—"
                  }
                  sub={
                    parsed?.last10
                      ? `${parsed.last10.games} game • ${parsed.last10.winrate_pct}% WR`
                      : "Recent performance snapshot"
                  }
                  onShare={parsed ? () => shareCard("recent-kda") : null}
                />

                <StatCard
                  id="player-id"
                  title="Player ID"
                  icon={<Icon kind="id" />}
                  value={parsed?.puuid ? "Resolved" : "—"}
                  sub={parsed?.puuid ? "PUUID available" : "Identity resolution"}
                  onShare={parsed ? () => shareCard("player-id") : null}
                />
              </>
            )}
          </div>

          {/* Note */}
          <div className="nx-note">
            <strong>Note:</strong> Post-match analytics only. No real-time
            assistance, automation, scripting, or gameplay modification.
          </div>

          {/* Best champ */}
          <div className="nx-section" id="best-champion">
            <div className="nx-section-title">Best champion breakdown</div>
            <div className="nx-section-sub">
              A compact breakdown from the recent sample.
            </div>
            <div style={{ marginTop: 10 }}>
              {loading ? (
                <div className="nx-card nx-empty">
                  <div className="nx-skel-value" />
                  <div className="nx-skel-sub" />
                </div>
              ) : (
                <ChampionBreakdown bestChamp={parsed?.bestChamp} />
              )}
            </div>
          </div>

          {/* Roles */}
          <div className="nx-section" id="roles">
            <div className="nx-section-title">Role distribution</div>
            <div className="nx-section-sub">
              Based on recent matches — mini bar chart.
            </div>
            <div style={{ marginTop: 10 }}>
              {loading ? (
                <div className="nx-card nx-empty">
                  <div className="nx-skel-sub" />
                  <div className="nx-skel-sub" />
                  <div className="nx-skel-sub" />
                </div>
              ) : (
                <RoleBars roles={parsed?.roles || []} />
              )}
            </div>
          </div>

          {/* Policy */}
          <div className="nx-section" id="policy">
            <div className="nx-card nx-policy">
              <div className="nx-section-title">Policy & disclaimer</div>
              <div className="nx-policy-text">
                Nexio.gg is not affiliated with, endorsed, sponsored, or approved
                by Riot Games.
              </div>
              <div className="nx-chips">
                <span className="nx-chip">Post-match only</span>
                <span className="nx-chip">No real-time assistance</span>
                <span className="nx-chip">No automation / scripting</span>
                <span className="nx-chip">No betting / gambling</span>
                <span className="nx-chip">No gameplay modification</span>
                <span className="nx-chip">No competitive advantage</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="nx-footer">
          <div className="nx-footer-small">© {new Date().getFullYear()} Nexio.gg</div>
          <div className="nx-footer-links">
            <a href="/" className="nx-link">
              Home
            </a>
            <span className="nx-dot">•</span>
            <a href="/terms" className="nx-link">
              Terms
            </a>
            <span className="nx-dot">•</span>
            <a href="/privacy" className="nx-link">
              Privacy
            </a>
          </div>
        </footer>
      </div>

      {/* Toast */}
      {toast ? (
        <div className="nx-toast" key={toast.ts}>
          {toast.text}
        </div>
      ) : null}

      {/* Styles */}
      <style jsx>{`
        .nx-page {
          min-height: 100vh;
          background:
            radial-gradient(1200px 600px at 20% 10%, rgba(124,58,237,0.22), transparent 60%),
            radial-gradient(900px 500px at 80% 20%, rgba(59,130,246,0.18), transparent 55%),
            #0b1020;
          color: #e8eefc;
        }
        .nx-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 42px 20px 28px;
        }

        .nx-hero { margin-bottom: 18px; }
        .nx-hero-row { display: flex; align-items: center; gap: 12px; }
        .nx-badge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 12px;
          letter-spacing: 1px;
          font-weight: 900;
        }
        .nx-hero-meta { color: rgba(232,238,252,0.7); font-size: 12px; }

        .nx-h1 { margin: 12px 0 8px; font-size: 44px; line-height: 1.06; }
        .nx-grad {
          background: linear-gradient(90deg, rgba(124,58,237,1), rgba(59,130,246,1), rgba(34,211,238,1));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nx-p { margin: 0; color: rgba(232,238,252,0.78); max-width: 760px; }

        .nx-card {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          box-shadow: 0 20px 80px rgba(0,0,0,0.35);
          backdrop-filter: blur(10px);
        }
        .nx-panel { padding: 20px; }

        .nx-form {
          display: grid;
          grid-template-columns: 1fr 220px 260px;
          gap: 12px;
          align-items: end;
        }
        .nx-field { min-width: 240px; }
        .nx-actions { min-width: 220px; }
        .nx-label {
          display: block;
          font-size: 12px;
          color: rgba(232,238,252,0.75);
          margin-bottom: 6px;
        }
        .nx-input, .nx-select {
          width: 100%;
          box-sizing: border-box;
          height: 44px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(0,0,0,0.25);
          color: #e8eefc;
          outline: none;
        }

        .nx-actions-row {
          display: grid;
          grid-template-columns: 1fr 110px;
          gap: 10px;
        }
        .nx-btn {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.18);
          background: linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.85));
          color: #fff;
          font-weight: 950;
          cursor: pointer;
        }
        .nx-btn:disabled { opacity: 0.75; cursor: not-allowed; }
        .nx-btn-ghost {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(0,0,0,0.20);
          color: rgba(232,238,252,0.86);
          font-weight: 900;
          cursor: pointer;
        }

        .nx-samples {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          margin-top: 10px;
        }
        .nx-samples-label {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          color: rgba(232,238,252,0.72);
          font-size: 12px;
          font-weight: 800;
        }

        .nx-alert {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(239,68,68,0.35);
          background: rgba(239,68,68,0.10);
          color: #ffd7d7;
        }

        .nx-result-head {
          margin-top: 18px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.10);
          flex-wrap: wrap;
        }
        .nx-section-title { font-weight: 950; font-size: 13px; }
        .nx-section-sub { margin-top: 6px; color: rgba(232,238,252,0.65); font-size: 12px; }
        .nx-result-meta { margin-top: 8px; color: rgba(232,238,252,0.70); font-size: 12px; }
        .nx-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        .nx-dot { margin: 0 8px; opacity: 0.6; }

        .nx-result-right { display: flex; align-items: center; gap: 10px; }
        .nx-copy {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(0,0,0,0.25);
          color: #e8eefc;
          font-weight: 950;
          cursor: pointer;
        }
        .nx-pills { display: flex; gap: 8px; align-items: center; }
        .nx-pill {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          font-size: 12px;
          font-weight: 950;
        }
        .nx-pill-low { border-color: rgba(245,158,11,0.35); background: rgba(245,158,11,0.10); }
        .nx-pill-med { border-color: rgba(59,130,246,0.35); background: rgba(59,130,246,0.10); }
        .nx-pill-high { border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.10); }
        .nx-pill-empty { opacity: 0.8; }

        /* ✅ NEW overview */
        .nx-overview {
          margin-top: 12px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.18);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .nx-overview-title {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 950;
          font-size: 12px;
          color: rgba(232,238,252,0.86);
        }
        .nx-overview-items {
          margin-top: 6px;
          color: rgba(232,238,252,0.72);
          font-size: 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }
        .nx-ov-item { white-space: nowrap; }
        .nx-overview-sub {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(232,238,252,0.62);
        }

        .nx-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .nx-stat {
          padding: 14px;
          min-height: 120px;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
        }
        .nx-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 90px rgba(0,0,0,0.45);
          border-color: rgba(255,255,255,0.16);
        }
        .nx-stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .nx-stat-title {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: rgba(232,238,252,0.72);
          font-weight: 900;
        }
        .nx-icon { opacity: 0.9; }

        .nx-chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(0,0,0,0.22);
          color: rgba(232,238,252,0.9);
          font-weight: 900;
          cursor: pointer;
          line-height: 1;
          font-size: 12px;
        }
        .nx-chip-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .nx-chip-muted {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.05);
          color: rgba(232,238,252,0.55);
          font-weight: 900;
          font-size: 12px;
        }

        .nx-stat-value { font-size: 26px; font-weight: 950; margin-top: 10px; }
        .nx-stat-sub { margin-top: 8px; font-size: 12px; color: rgba(232,238,252,0.62); }

        .nx-note {
          margin-top: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.18);
          color: rgba(232,238,252,0.75);
          font-size: 12px;
        }

        .nx-empty {
          padding: 14px;
          border: 1px dashed rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.02);
        }
        .nx-empty-title { font-weight: 950; margin-bottom: 6px; }
        .nx-empty-sub { color: rgba(232,238,252,0.65); font-size: 12px; }

        .nx-champ { padding: 14px; }
        .nx-champ-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .nx-champ-left { display: flex; align-items: center; gap: 12px; }
        .nx-champ-avatar {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 950;
          background: linear-gradient(135deg, rgba(124,58,237,0.9), rgba(59,130,246,0.85));
          border: 1px solid rgba(255,255,255,0.14);
        }
        .nx-champ-name { font-weight: 950; font-size: 16px; }
        .nx-champ-sub { font-size: 12px; color: rgba(232,238,252,0.65); margin-top: 4px; }

        .nx-chip {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: rgba(232,238,252,0.86);
          font-size: 12px;
          font-weight: 900;
        }
        .nx-champ-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 12px;
        }
        .nx-mini {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.18);
          padding: 12px;
        }
        .nx-mini-label { font-size: 12px; color: rgba(232,238,252,0.65); }
        .nx-mini-value { margin-top: 8px; font-weight: 950; font-size: 18px; }

        .nx-role { padding: 14px; }
        .nx-role-row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 12px;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nx-role-last { border-bottom: none; }
        .nx-role-name { font-weight: 950; font-size: 12px; letter-spacing: 0.4px; }
        .nx-role-meta { margin-top: 6px; font-size: 12px; color: rgba(232,238,252,0.65); }
        .nx-role-track {
          height: 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
        }
        .nx-role-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(124,58,237,0.95), rgba(59,130,246,0.9), rgba(34,211,238,0.85));
        }

        .nx-policy { padding: 16px; background: rgba(0,0,0,0.20); }
        .nx-policy-text { margin-top: 8px; color: rgba(232,238,252,0.72); font-size: 12px; line-height: 1.55; }
        .nx-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }

        .nx-section { margin-top: 18px; }

        .nx-footer {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          color: rgba(232,238,252,0.65);
          font-size: 12px;
        }
        .nx-footer-small { opacity: 0.9; }
        .nx-footer-links { display: flex; align-items: center; gap: 10px; }
        .nx-link { color: rgba(232,238,252,0.80); text-decoration: none; }

        .nx-skel-value {
          margin-top: 12px;
          height: 28px;
          width: 56%;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          animation: nxPulse 1.2s ease-in-out infinite;
        }
        .nx-skel-sub {
          margin-top: 10px;
          height: 12px;
          width: 72%;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          animation: nxPulse 1.2s ease-in-out infinite;
        }
        .nx-skel-pill {
          height: 28px;
          width: 88px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          animation: nxPulse 1.2s ease-in-out infinite;
        }
        @keyframes nxPulse {
          0% { opacity: 0.55; }
          50% { opacity: 1; }
          100% { opacity: 0.55; }
        }

        .nx-toast {
          position: fixed;
          right: 18px;
          bottom: 18px;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(0,0,0,0.55);
          color: rgba(232,238,252,0.92);
          font-weight: 900;
          box-shadow: 0 20px 70px rgba(0,0,0,0.45);
          backdrop-filter: blur(10px);
          z-index: 9999;
        }

        @media (max-width: 900px) {
          .nx-form { grid-template-columns: 1fr; }
          .nx-actions-row { grid-template-columns: 1fr; }
          .nx-role-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
