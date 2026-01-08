import { useState } from "react";

export default function Demo() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("tr1");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDemo = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `https://lpxlbbcmpxbfprufvf.supabase.co/functions/v1/get-player-insights?name=${encodeURIComponent(
          name
        )}&region=${region}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>Nexio.gg — Demo</h1>
      <p>AI-powered player insights (League of Legends)</p>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Summoner name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        />

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        >
          <option value="tr1">TR</option>
          <option value="euw1">EUW</option>
          <option value="na1">NA</option>
          <option value="kr">KR</option>
        </select>

        <button onClick={runDemo} disabled={loading}>
          {loading ? "Loading..." : "Run Demo"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: 20 }}>
          Error: {error}
        </p>
      )}

      {result && (
        <pre
          style={{
            marginTop: 30,
            padding: 20,
            background: "#f5f5f5",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
