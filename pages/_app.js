// pages/_app.js
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function App({ Component, pageProps }) {
  return (
    <>
      <div className="appShell">
        <SiteHeader />
        <main className="appMain">
          <Component {...pageProps} />
        </main>
        <SiteFooter />
      </div>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          height: 100%;
        }

        body {
          overflow-x: hidden;
          background: radial-gradient(
              1200px 600px at 15% 12%,
              rgba(124, 58, 237, 0.22),
              transparent 60%
            ),
            radial-gradient(
              900px 500px at 85% 18%,
              rgba(59, 130, 246, 0.18),
              transparent 55%
            ),
            #070b18;
          color: #e8eefc;
        }

        .appShell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .appMain {
          flex: 1;
          min-height: 0;
        }
      `}</style>
    </>
  );
}
