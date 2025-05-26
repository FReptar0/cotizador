import "@/styles/globals.css";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Extraemos `session` si viene en pageProps
  const { session, ...restPageProps } = pageProps;

  // Rutas que no deben usar el Layout (por ejemplo, login)
  const noLayoutRoutes = ["/login"];

  // Función para manejar logout centralmente (si lo necesites)
  const handleLogout = () => {
    // Si aún tienes lógica basada en localStorage, puedes conservarla aquí
    // localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  // ElevenLabs: solo en /cotizador y /diagnostico-inteligente
  useEffect(() => {
    if (["/cotizador", "/diagnostico-inteligente"].includes(router.pathname)) {
      if (!document.getElementById("elevenlabs-widget-script")) {
        const script = document.createElement("script");
        script.id = "elevenlabs-widget-script";
        script.src = "https://elevenlabs.io/convai-widget/index.js";
        script.async = true;
        script.type = "text/javascript";
        document.head.appendChild(script);
      }
    }
  }, [router.pathname]);

  // Renderiza el widget solo en las rutas indicadas
  const elevenLabsWidget =
    typeof window !== "undefined" &&
    ["/cotizador", "/diagnostico-inteligente"].includes(router.pathname)
      ? createPortal(
          <elevenlabs-convai agent-id="agent_01jw1xmts8em4rgb4gwsjr35an"></elevenlabs-convai>,
          document.body
        )
      : null;

  // Contenido de la app, con o sin Layout
  const appContent = noLayoutRoutes.includes(router.pathname) ? (
    <Component {...restPageProps} />
  ) : (
    <Layout onLogout={handleLogout}>
      <Component {...restPageProps} />
    </Layout>
  );

  return (
    <SessionProvider session={session}>
      {appContent}
      {elevenLabsWidget}
    </SessionProvider>
  );
}
