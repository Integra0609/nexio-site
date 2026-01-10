// pages/_app.js
import SiteHeader from "../components/SiteHeader";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const hideGlobalFooterOn = ["/analyzer"]; // analyzer sayfasında footer zaten var

  return (
    <>
      {/* Global CSS (globals.css yoksa burası yeter) */}
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          background: #070b18;
        }
        * {
          box-sizing: border-box;
        }

        /* Header responsive: desktop nav vs burger */
        @media (max-width: 860px) {
          nav[aria-label="Primary"] {
            display: none !important;
          }
          header button[aria-label="Open menu"],
          header button[aria-label="Close menu"] {
            display: inline-flex !important;
          }
        }
      `}</style>

      <div style={layout.wrap}>
        <SiteHeader />
        <main style={layout.main}>
          <Component {...pageProps} />
        </main>

        {!hideGlobalFooterOn.includes(router.pathname) ? (
          <footer style={layout.footer}>
            <div style={layout.footerLeft}>©️ 2026 Nexio.gg</div>
            <div style={layout.footerRight}>
              <a href="/terms" style={layout.footerLink}>
                Terms
              </a>
              <span style={layout.dot}>•</span>
              <a href="/privacy" style={layout.footerLink}>
                Privacy
              </a>
            </div>
          </footer>
        ) : null}
      </div>
    </>
  );
}

const layout = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background:
      "radial-gradient(1200px 600px at 15% 12%, rgba(124,58,237,0.22), transparent 60%), radial-gradient(900px 500px at 85% 18%, rgba(59,130,246,0.18), transparent 55%), #070b18",
    color: "#e8eefc",
  },
  main: {
    flex: "1 0 auto",
  },
  footer: {
    marginTop: "auto",
    maxWidth: 1120,
    width: "100%",
    alignSelf: "center",
    padding: "18px 16px 26px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    color: "rgba(232,238,252,0.60)",
    fontSize: 12,
  },
  footerLeft: { opacity: 0.9 },
  footerRight: { display: "flex", alignItems: "center", gap: 10 },
  footerLink: { color: "rgba(232,238,252,0.78)", textDecoration: "none" },
  dot: { opacity: 0.5 },
};
