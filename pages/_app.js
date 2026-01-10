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
          height: 100%;
        }
        body {
          margin: 0;
          overflow-x: hidden;
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
