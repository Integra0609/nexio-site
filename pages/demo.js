import { useMemo, useState } from "react";

/* ================================
   SUPABASE CONFIG (NET VE TAM)
================================ */
const SUPABASE_PROJECT_REF = "lpxlbbcmpxbfprfuvf"; 
const SUPABASE_FN_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/get-player-insights`;

/* ================================
   UI HELPERS
================================ */
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

/* ================================
   PAGE
================================ */
export default function Demo() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [raw, setRaw] = useState(null);

  const parsed = useMemo(() => {
    if (!raw?.insights) return null;

    return {
      sampleSize: raw.insights.sample_size,
      last10: raw.insights.kda_trend?.last_10,
      bestChamp: raw.insights.best_champion,
      roles: raw.insights.role_distribution || [],
      puuid: raw.puuid,
      ok: raw.ok,
    };
  }, [raw]);

  /* ================================
     CORE FETCH (ASIL ÖNEMLİ YER)
  ================================ */
  const run = async () => {
    setError(null);
    setRaw(null);

    if (!name.trim()) {
      setError("Summoner name gerekli.");
      return;
    }

    setLoading(true);
    try {
      const url = `${SUPABASE_FN_URL}?name=${encodeURIComponent(
        name.trim()
      )}&region=${encodeURIComponent(region)}`;

      console.log("FETCH URL:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setRaw(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "Fetch error");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     UI
  ================================ */
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1>Nexio.gg Demo</h1>
        <p>AI-powered esports analytics (League of Legends)</p>

        <div style={styles.formRow}>
          <input
            placeholder="Summoner name (örn: faker)"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

          <button onClick={run} disabled={loading} style={styles.button}>
            {loading ? "Loading..." : "Run"}
          </button>
        </div>

        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {parsed && (
          <>
            <StatCard title="Sample size" value={parsed.sampleSize} />
            <StatCard
              title="Last 10 KDA"
              value={parsed.last10?.kda || "-"}
            />
          </>
        )}

        {raw && (
          <pre style={styles.pre}>
            {JSON.stringify(raw, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}

/* ================================
   STYLES (BASİT)
================================ */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1020",
    color: "#e8eefc",
    padding: 40,
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: 800,
    margin: "0 auto",
  },
  formRow: {
    display: "flex",
    gap: 10,
    margin: "20px 0",
  },
  input: {
    padding: 10,
    flex: 1,
  },
  select: {
    padding: 10,
  },
  button: {
    padding: "10px 16px",
    cursor: "pointer",
  },
  statCard: {
    background: "#11172f",
    padding: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statSub: {
    fontSize: 12,
    opacity: 0.6,
  },
  pre: {
    marginTop: 20,
    background: "#000",
    padding: 16,
    overflowX: "auto",
    fontSize: 12,
  },
};
