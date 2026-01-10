// components/SiteFooter.js
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer style={styles.wrap}>
      <div style={styles.inner}>
        <div style={styles.left}>© {new Date().getFullYear()} Nexio.gg</div>

        <div style={styles.right}>
          <Link href="/terms" style={styles.link}>
            Terms
          </Link>
          <span style={styles.dot}>•</span>
          <Link href="/privacy" style={styles.link}>
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  wrap: {
    marginTop: 26,
    padding: "22px 0 28px",
    borderTop: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(232,238,252,0.65)",
    background: "transparent",
  },
  inner: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  left: { fontSize: 12 },
  right: { display: "flex", alignItems: "center", gap: 10, fontSize: 12 },
  link: {
    color: "rgba(232,238,252,0.78)",
    textDecoration: "none",
    fontWeight: 800,
  },
  dot: { opacity: 0.5 },
};
