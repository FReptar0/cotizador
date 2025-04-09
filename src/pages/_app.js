import "@/styles/globals.css";
import { useRouter } from "next/router";
import Layout from "../components/layout";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Rutas que no deben usar el Layout (por ejemplo, login)
  const noLayoutRoutes = ["/login"];

  // Función para manejar logout centralmente (puedes personalizarla)
  const handleLogout = () => {
    // Ejemplo:
    // localStorage.removeItem("isLoggedIn");
    // router.push("/login");
  };

  if (noLayoutRoutes.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout onLogout={handleLogout}>
      <Component {...pageProps} />
    </Layout>
  );
}
