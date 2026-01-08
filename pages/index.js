export default function Home() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: "40px" }}>
      <h1>Nexio.gg</h1>

      <p>
        Nexio.gg is a next-generation esports analytics platform.
      </p>

      <p>
        We help players understand their performance through match statistics,
        role distribution, champion insights and AI-powered analysis.
      </p>

      <h2>Supported Games</h2>
      <ul>
        <li>League of Legends (active)</li>
        <li>More esports titles coming soon</li>
      </ul>

      <h2>Features</h2>
      <ul>
        <li>Player performance analytics</li>
        <li>Match history insights</li>
        <li>KDA trends & role distribution</li>
        <li>AI-driven player insights (coming soon)</li>
      </ul>

      <footer style={{ marginTop: "60px", fontSize: "14px", opacity: 0.7 }}>
        © {new Date().getFullYear()} Nexio.gg
      </footer>
    </main>
  );
}
