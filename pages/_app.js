// pages/_app.js

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* ===============================
          GLOBAL STYLES (MOBILE FIXES)
          =============================== */}
      <style jsx global>{`
        /* Genel reset / güvenli varsayılanlar */
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #070b18;
          color: #e8eefc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Helvetica, Arial, sans-serif;
        }

        /* -------------------------------
           MOBILE HEADER OVERFLOW FIX
           ------------------------------- */
        @media (max-width: 860px) {
          /* Desktop navbar'ı gizle */
          nav[aria-label="Primary"] {
            display: none !important;
          }

          /* Hamburger butonlar görünür */
          header button[aria-label="Open menu"],
          header button[aria-label="Close menu"] {
            display: inline-flex !important;
          }

          /* Header taşmasını engelle */
          header {
            max-width: 100vw;
            overflow-x: hidden;
          }
        }

        /* -------------------------------
           FORM ELEMENTS MOBILE POLISH
           ------------------------------- */
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

      {/* APP */}
      <Component {...pageProps} />
    </>
  );
}
