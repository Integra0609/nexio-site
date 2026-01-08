export default function Terms() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: 900 }}>
      <h1>Terms of Service</h1>
      <p><strong>Effective date:</strong> {new Date().toISOString().slice(0, 10)}</p>

      <p>
        Welcome to Nexio.gg (“Nexio”, “we”, “our”, “us”). By accessing or using our website and services
        (the “Service”), you agree to these Terms of Service (“Terms”).
      </p>

      <h2>1. The Service</h2>
      <p>
        Nexio.gg provides esports analytics and insights, including statistics, match history summaries,
        and AI-assisted performance insights. The Service may change over time.
      </p>

      <h2>2. No Affiliation</h2>
      <p>
        Nexio.gg is not affiliated with, endorsed, sponsored, or specifically approved by Riot Games, Inc.
        Riot Games and any associated properties are trademarks or registered trademarks of Riot Games, Inc.
      </p>

      <h2>3. Accounts</h2>
      <p>
        If we offer accounts in the future, you are responsible for maintaining the confidentiality of your
        credentials and for activity that occurs under your account.
      </p>

      <h2>4. Acceptable Use</h2>
      <ul>
        <li>Do not misuse the Service, attempt to disrupt it, or access it using automated scraping beyond reasonable use.</li>
        <li>Do not use the Service for unlawful activities.</li>
        <li>Do not attempt to reverse engineer or exploit security vulnerabilities.</li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        The Service and its content (excluding third-party data and trademarks) are owned by Nexio.gg and protected
        by applicable intellectual property laws.
      </p>

      <h2>6. Third-Party Data</h2>
      <p>
        Some data displayed in the Service may be provided via third-party APIs. We do not guarantee the accuracy,
        completeness, or availability of third-party data.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        The Service is provided “as is” and “as available” without warranties of any kind. We do not warrant that the
        Service will be uninterrupted or error-free.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Nexio.gg shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages arising from your use of the Service.
      </p>

      <h2>9. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Your continued use of the Service after changes become effective
        constitutes acceptance of the updated Terms.
      </p>

      <h2>10. Contact</h2>
      <p>
        Contact: <a href="mailto:support@nexio.gg">support@nexio.gg</a>
      </p>
    </main>
  );
}
