export default function Privacy() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: 900 }}>
      <h1>Privacy Policy</h1>
      <p><strong>Effective date:</strong> {new Date().toISOString().slice(0, 10)}</p>

      <p>
        This Privacy Policy explains how Nexio.gg (“Nexio”, “we”, “our”, “us”) collects, uses, and protects
        information when you use our website and services (the “Service”).
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Public gameplay data:</strong> We may display and process publicly available game-related data (e.g., match and performance stats) obtained via third-party APIs.</li>
        <li><strong>Usage data:</strong> Basic technical data such as browser type, pages visited, and approximate region may be collected for security and performance.</li>
        <li><strong>Contact data:</strong> If you contact us, we receive the information you provide (e.g., email, message contents).</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <ul>
        <li>To provide esports analytics and insights.</li>
        <li>To improve reliability, performance, and user experience.</li>
        <li>To prevent abuse, fraud, or security issues.</li>
        <li>To respond to support requests.</li>
      </ul>

      <h2>3. Cookies</h2>
      <p>
        We may use cookies or similar technologies for essential functionality and basic analytics. You can control cookies
        through your browser settings.
      </p>

      <h2>4. Sharing of Information</h2>
      <p>
        We do not sell your personal information. We may share limited information with service providers that help operate
        the Service (e.g., hosting, analytics), strictly for providing the Service.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We retain information only as long as needed for the purposes described in this policy, unless a longer retention
        period is required by law.
      </p>

      <h2>6. Security</h2>
      <p>
        We use reasonable safeguards designed to protect information. However, no method of transmission or storage is 100% secure.
      </p>

      <h2>7. Children</h2>
      <p>
        The Service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The “Effective date” above indicates when the latest changes took effect.
      </p>

      <h2>9. Contact</h2>
      <p>
        If you have questions, contact: <a href="mailto:support@nexio.gg">support@nexio.gg</a>
      </p>

      <p style={{ marginTop: "24px", fontSize: "12px", color: "#666" }}>
        Nexio.gg is not affiliated with, endorsed, sponsored, or specifically approved by Riot Games, Inc.
      </p>
    </main>
  );
}
