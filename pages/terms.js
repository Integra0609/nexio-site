export default function Terms() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: 900 }}>
      <h1>Terms of Service</h1>
      <p><strong>Effective date:</strong> {new Date().toISOString().slice(0, 10)}</p>

      <p>
        These Terms of Service (“Terms”) govern your access to and use of the Nexio.gg website and services
        (the “Service”). By accessing or using the Service, you agree to these Terms.
      </p>

      <h2>1. The Service</h2>
      <p>
        Nexio.gg provides esports analytics and insights derived from publicly available and/or officially
        provided game data sources and statistical methods. The Service may change over time.
      </p>

      <h2>2. No Affiliation</h2>
      <p>
        Nexio.gg is not affiliated with, endorsed by, sponsored by, or specifically approved by Riot Games, Inc.
        Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
      </p>

      <h2>3. User Responsibilities</h2>
      <ul>
        <li>You agree not to misuse the Service or attempt to disrupt its operation.</li>
        <li>You agree not to use the Service for cheating, automation, betting, or gameplay modification.</li>
        <li>You agree not to scrape, reverse engineer, or abuse the Service in a way that violates any third-party terms.</li>
      </ul>

      <h2>4. Intellectual Property</h2>
      <p>
        The Service, including its content, design, and underlying software (excluding third-party content),
        is owned by Nexio.gg and protected by applicable laws. Third-party names and logos belong to their
        respective owners.
      </p>

      <h2>5. Third-Party Services and Data</h2>
      <p>
        The Service may display data or links from third-party services (including official game APIs).
        Nexio.gg is not responsible for third-party services, and your use of them may be subject to their
        own terms and policies.
      </p>

      <h2>6. Disclaimer</h2>
      <p>
        The Service is provided on an “AS IS” and “AS AVAILABLE” basis. We make no warranties of any kind,
        including that the Service will be error-free or uninterrupted, or that analytics/insights will be
        accurate for every match or player.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Nexio.gg will not be liable for any indirect, incidental,
        special, consequential, or punitive damages, or any loss of data, profits, or revenues arising from
        your use of the Service.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or terminate access to the Service at any time if we reasonably believe you have
        violated these Terms or if necessary to protect the Service.
      </p>

      <h2>9. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. The “Effective date” above indicates when the latest
        changes took effect. Your continued use of the Service means you accept the updated Terms.
      </p>

      <h2>10. Contact</h2>
      <p>
        If you have questions about these Terms, you can contact us via our website.
      </p>
    </main>
  );
}
