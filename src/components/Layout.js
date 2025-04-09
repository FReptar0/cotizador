import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children, onLogout }) => {
  return (
    <>
      <Navbar onLogout={onLogout} />
      {/*
        Usamos un contenedor que inicia debajo de la navbar.
        marginTop = la altura aproximada de la toolbar (64px es lo estándar en MUI).
      */}
      <div
        style={{
          marginTop: "64px", // Ajusta si tu navbar es más alta o más baja
          minHeight: "100vh", // Para que ocupe toda la pantalla
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* main flex:1 para que el contenido crezca y empuje el footer hacia el final */}
        <main style={{ flex: 1 }}>{children}</main>

        {/* Footer siempre al final de la columna */}
        <Footer />
      </div>
    </>
  );
};

export default Layout;
