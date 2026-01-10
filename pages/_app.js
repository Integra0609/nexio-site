// pages/_app.js
import SiteHeader from "../components/SiteHeader";

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Global styles (projede globals.css olmadığı için burada) */}
      <style jsx global>{`
        :root {
          color-scheme: dark;
        }
        html,
        body {
          padding: 0;
          margin: 0;
          background: #070b18;
          color: #e8eefc;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
            Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        }
        * {
          box-sizing: border-box;
        }
        a {
          color: inherit;
        }

        /* Mobile header responsive */
        @media (max-width: 860px) {
          nav[aria-label="Primary"] {
            display: none !important;
          }
          header button[data-burger="1"] {
            display: inline-flex !important;
          }
        }
      `}</style>

      <SiteHeader />
      <Component {...pageProps} />
    </>
  );
}
