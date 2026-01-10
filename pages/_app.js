// pages/_app.js

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #070b18;
          color: #e8eefc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
        }

        /* =========================
           HEADER RESPONSIVE RULES
           ========================= */

        /* ✅ DESKTOP / WEB: navbar kesin görünsün */
        @media (min-width: 861px) {
          nav[aria-label="Primary"] {
            display: flex !important;
          }

          header button[aria-label="Open menu"],
          header button[aria-label="Close menu"] {
            display: none !important;
          }
        }

        /* ✅ MOBILE: navbar gizli, hamburger açık */
        @media (max-width: 860px) {
          nav[aria-label="Primary"] {
            display: none !important;
          }

          header button[aria-label="Open menu"],
          header button[aria-label="Close menu"] {
            display: inline-flex !important;
          }

          header {
            max-width: 100vw;
            overflow-x: hidden;
          }
        }

        /* =========================
           FORM ELEMENT POLISH
           ========================= */
        input,
        select,
        button {
          font-family: inherit;
        }

        select {
          background-color: rgba(0, 0, 0, 0.35);
          color: #e8eefc;
        }

        select option {
          background: #0b1020;
          color: #e8eefc;
        }

        /* iOS zoom bug fix */
        @media (max-width: 860px) {
          input,
          select,
          textarea {
            font-size: 16px;
          }
        }
      `}</style>

      <Component {...pageProps} />
    </>
  );
}
