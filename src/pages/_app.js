import "@/styles/globals.css";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  // const [isClient, setIsClient] = useState(false);

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

  // ElevenLabs widget removed

  // ElevenLabs widget removed

  // Contenido de la app, con o sin Layout
  const appContent = noLayoutRoutes.includes(router.pathname) ? (
    <Component {...restPageProps} />
  ) : (
    <Layout onLogout={handleLogout}>
      <Component {...restPageProps} />
    </Layout>
  );

  return <SessionProvider session={session}>{appContent}</SessionProvider>;
}
