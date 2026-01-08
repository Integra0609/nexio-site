export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "60px 40px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f7f7f7",
        color: "#222",
      }}
    >
      <h1 style={{ fontSize: "42px", marginBottom: "20px" }}>
        Nexio.gg
      </h1>

      <p style={{ fontSize: "18px", maxWidth: "640px", lineHeight: "1.6" }}>
        AI-powered esports analytics platform.
      </p>

      <p style={{ fontSize: "18px", maxWidth: "640px", lineHeight: "1.6" }}>
        Currently supporting League of Legends. More games coming soon.
      </p>

      <p
        style={{
          marginTop: "40px",
          fontSize: "14px",
          color: "#666",
          maxWidth: "640px",
        }}
      >
        Nexio.gg is not affiliated with Riot Games.
      </p>

      <p
        style={{
          marginTop: "10px",
          fontSize: "13px",
          color: "#666",
        }}
      >
        <a href="/terms" style={{ color: "#666", textDecoration: "underline" }}>
          Terms
        </a>{" "}
        ·{" "}
        <a href="/privacy" style={{ color: "#666", textDecoration: "underline" }}>
          Privacy
        </a>
      </p>
    </main>
  );
}
