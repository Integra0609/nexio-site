export default function Home() {
  return (
    <main style={{
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "80px 24px",
      maxWidth: "720px",
      margin: "0 auto",
      color: "#111"
    }}>
      <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>
        Nexio.gg
      </h1>

      <p style={{ fontSize: "18px", marginBottom: "32px", color: "#444" }}>
        AI-powered esports analytics platform.
      </p>

      <p style={{ fontSize: "16px", marginBottom: "24px" }}>
        Nexio.gg analyzes competitive player performance using official game data
        and advanced statistical models. Currently supporting League of Legends.
        More competitive games coming soon.
      </p>

      <h2 style={{ fontSize: "22px", marginTop: "40px" }}>
        What Nexio does
      </h2>

      <ul style={{ marginTop: "16px", lineHeight: "1.8" }}>
        <li>Player performance insights</li>
        <li>KDA and performance trends</li>
        <li>Champion and role analysis</li>
        <li>Match history breakdown</li>
        <li>AI-powered insights (coming soon)</li>
      </ul>

      <hr style={{ margin: "48px 0" }} />

      <p style={{ fontSize: "13px", color: "#666" }}>
        Nexio.gg uses official Riot Games APIs to retrieve game data.
        <br />
        Nexio.gg is not endorsed by or affiliated with Riot Games.
      </p>
    </main>
  );
}
