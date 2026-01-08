import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

const SUPABASE_PROJECT_REF = "lpoxlbbcmpxbfpfrufvf";
const SUPABASE_FN_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/get-player-insights`;

const regions = [
  { value: "tr1", label: "TR (tr1)" },
  { value: "euw1", label: "EUW (euw1)" },
  { value: "na1", label: "NA (na1)" },
  { value: "kr", label: "KR (kr)" },
];

function StatCard({ title, value, sub }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
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
  const [copied, setCopied] = useState(false);

  // 🔹 URL'den otomatik doldurma + çalıştırma
  useEffect(() => {
    if (!router.isReady) return;

    const qName = router.query.name;
    const qRegion = router.query.region;

    if (typeof qName === "string") setName(qName);
    if (typeof qRegion === "string") setRegion(qRegion);

    if (qName && qRegion) {
      run(qName, qRegion);
    }
  }, [router.isReady]);

  const parsed = useMemo(() => {
    if (!raw?.insights) return null;

    return {
      sampleSize: raw.insights.sample_size,
      last10: raw.insights.kda_trend?.last_10,
      roles: raw.insights.role_distribution || [],
      ok: raw.ok,
      puuid: raw.puuid,
    };
  }, [raw]);

  const run = async (overrideName, overrideRegion) => {
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

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Request failed");

      setRaw(data);

      // 🔹 URL güncelle (share için)
      router.replace(
        {
          pathname: "/analyzer",
          query: { name: finalName, region: finalRegion },
        },
        undefined,
        { shallow: true }
      );
    } catch (e) {
      setError(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/analyzer?name=${encodeURIComponent(
      name
    )}&region=${encodeURIComponent(region)}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>Analyzer</h1>
        <p style={styles.sub}>
          Post-match insights based on recent games.
        </p>

        {/* Search */}
        <div style={styles.card}>
          <div style={styles.formRow}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Summoner name"
              style={styles.input}
            />

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

            <button
              onClick={() => run()}
              disabled={loading}
              style={styles.button}
            >
              {loading ? "Running…" : "Run"}
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          {parsed && (
            <>
              <div style={styles.resultHeader}>
                <div>
                  <strong>Result</strong>
                  <div style={styles.meta}>
                    Limited recent sample
                  </div>
                </div>

                <button onClick={copyLink} style={styles.copyBtn}>
                  {copied ? "✓ Link copied" : "Copy link"}
                </button>
              </div>

              <div style={styles.grid}>
                <StatCard
                  title="Sample size"
                  value={parsed.sampleSize ?? "-"}
                />
                <StatCard
                  title="Recent KDA"
                  value={parsed.last10?.kda ?? "-"}
                  sub={
                    parsed.last10
                      ? `${parsed.last10.games} games • ${parsed.last10.winrate_pct}% WR`
                      : null
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1020",
    color: "#e8eefc",
  },
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "40px 20px",
  },
  h1: { fontSize: 36, fontWeight: 900 },
  sub: { color: "rgba(232,238,252,0.7)", marginBottom: 20 },

  card: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 20,
  },
  formRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    background: "#000",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.14)",
  },
  select: {
    padding: 10,
    borderRadius: 12,
    background: "#000",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.14)",
  },
  button: {
    padding: "10px 14px",
    borderRadius: 12,
    background:
      "linear-gradient(135deg, #7C3AED, #3B82F6)",
    color: "#fff",
    fontWeight: 800,
    border: "none",
  },
  error: {
    marginTop: 10,
    color: "#fca5a5",
  },

  resultHeader: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: {
    fontSize: 12,
    color: "rgba(232,238,252,0.6)",
  },
  copyBtn: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
  },
  grid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },
  statCard: {
    padding: 14,
    borderRadius: 14,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  statTitle: { fontSize: 12, opacity: 0.7 },
  statValue: { fontSize: 22, fontWeight: 900 },
  statSub: { fontSize: 12, opacity: 0.6 },
};
