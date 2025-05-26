import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  Button,
  Link,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import jsPDF from "jspdf";

const theme = createTheme({
  palette: {
    primary: { main: "#337ab7", contrastText: "#ffffff" },
    secondary: { main: "#343b40" },
    background: { default: "#ffffff" },
    text: { primary: "#212528" },
  },
});

export default function DiagnosticoInteligentePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  const [empresa, setEmpresa] = useState("");
  const [giro, setGiro] = useState("");
  const [empleados, setEmpleados] = useState("");
  const [procesos, setProcesos] = useState("");
  const [problemas, setProblemas] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [clientes, setClientes] = useState("");
  const [productos, setProductos] = useState("");
  const [ventas, setVentas] = useState("");
  const [logistica, setLogistica] = useState("");
  const [equipoTI, setEquipoTI] = useState("");

  // Estados para el formulario de diagnóstico inteligente
  const [sectorIndustria, setSectorIndustria] = useState("");
  const [tamanoOrganizacion, setTamanoOrganizacion] = useState("");
  const [procesosCriticos, setProcesosCriticos] = useState("");
  const [herramientasActuales, setHerramientasActuales] = useState("");
  const [modulosPrioritarios, setModulosPrioritarios] = useState("");
  const [volumenUsuarios, setVolumenUsuarios] = useState("");
  const [preferenciaHosting, setPreferenciaHosting] = useState("");
  const [disponibilidadRendimiento, setDisponibilidadRendimiento] =
    useState("");
  const [integracionesExternas, setIntegracionesExternas] = useState("");
  const [migracionDatos, setMigracionDatos] = useState("");
  const [personalizaciones, setPersonalizaciones] = useState("");
  const [soporteCapacidad, setSoporteCapacidad] = useState("");

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const handleGenerarDiagnostico = () => {
    setLoading(true);
    setResultado(null);

    setTimeout(() => {
      const propuesta = {
        procesos,
        objetivos,
        alcance: `Basado en la información proporcionada por ${empresa}, se identifican necesidades en áreas como ventas, contabilidad, logística, atención a clientes y digitalización de procesos. Se recomienda implementar módulos como CRM, Ventas, Facturación, Inventario, y Recursos Humanos.`,
        fueraAlcance: `Se excluyen módulos no requeridos como Manufactura, Punto de Venta y Sitio Web.`,
        entregables: `Documentación, configuración de módulos, capacitaciones, manuales y soporte inicial.`,
        metodo: `1. Análisis de Requisitos\n2. Planificación del Proyecto\n3. Configuración y Personalización\n4. Capacitación de Usuarios\n5. Pruebas y Ajustes\n6. Puesta en Marcha\n7. Soporte y Evaluación`,
        condiciones: `Costo: $X USD + IVA\nEntrega: 90 días hábiles\nPago: 50% inicio / 50% entrega\nPagos: Consultoría a TERSOFT / Licencias a Odoo`,
      };

      setResultado(propuesta);
      setLoading(false);
    }, 1500);
  };

  const generarPDF = () => {
    if (!resultado) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("PROPUESTA DE IMPLEMENTACIÓN DE ODOO", 20, 20);

    const addSection = (title, content, yPos) => {
      doc.setFontSize(12);
      doc.text(title, 20, yPos);
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(content, 170);
      doc.text(lines, 20, yPos + 6);
      return yPos + 6 + lines.length * 6;
    };

    let y = 30;
    y = addSection(
      "1. Procesos Actuales Identificados",
      resultado.procesos || "No especificado",
      y
    );
    y = addSection(
      "2. Objetivos del Proyecto",
      resultado.objetivos || "No especificado",
      y
    );
    y = addSection(
      "3. Alcance del Proyecto",
      resultado.alcance || "No especificado",
      y
    );
    y = addSection(
      "4. Fuera del Alcance",
      resultado.fueraAlcance || "No especificado",
      y
    );
    y = addSection(
      "5. Entregables del Proyecto",
      resultado.entregables || "No especificado",
      y
    );
    y = addSection(
      "6. Método de Implementación",
      resultado.metodo || "No especificado",
      y
    );
    y = addSection(
      "7. Condiciones Comerciales",
      resultado.condiciones || "No especificado",
      y
    );

    doc.setFontSize(10);
    const footerText =
      "Esta propuesta es un borrador preliminar. Para una definición precisa, agende una reunión en: https://calendly.com/tersoft/primera-sesion-para-conocer-necesidades-de-su-empresa";
    const footerLines = doc.splitTextToSize(footerText, 170);
    doc.text(footerLines, 20, y + 10);
    doc.save("propuesta_odoo.pdf");
  };

  if (!authChecked) return null;

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Diagnóstico Inteligente | Tersoft.mx</title>
        <meta name="description" content="Diagnóstico asistido por IA" />
      </Head>
      <Box sx={{ bgcolor: "background.default", py: 4 }}>
        <Container maxWidth="md">
          <Paper elevation={1} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="text.primary"
            >
              Diagnóstico inteligente para tu empresa
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
              Responde este breve formulario para que podamos entender mejor tus
              necesidades y recomendarte la mejor solución Odoo.
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Sector e industria */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿A qué sector o industria pertenece su empresa?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={sectorIndustria}
                onChange={(e) => setSectorIndustria(e.target.value)}
              />
            </Box>

            {/* Tamaño de la organización */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Cuántos empleados tiene actualmente su empresa?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                type="number"
                value={tamanoOrganizacion}
                onChange={(e) => setTamanoOrganizacion(e.target.value)}
              />
            </Box>

            {/* Procesos críticos y retos */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Cuáles son sus procesos más críticos (ventas, compras,
                inventarios, contabilidad, RR. HH., etc.) y qué desafíos
                enfrentan en cada uno?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={3}
                value={procesosCriticos}
                onChange={(e) => setProcesosCriticos(e.target.value)}
              />
            </Box>

            {/* Herramientas actuales */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué sistemas o aplicaciones utilizan hoy para gestionar esos
                procesos?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={herramientasActuales}
                onChange={(e) => setHerramientasActuales(e.target.value)}
              />
            </Box>

            {/* Módulos prioritarios */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué módulos de Odoo consideran indispensables en una primera
                etapa (CRM, Ventas, Compras, Inventarios, Proyectos,
                Contabilidad, Nómina, e-commerce…)?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={modulosPrioritarios}
                onChange={(e) => setModulosPrioritarios(e.target.value)}
              />
            </Box>

            {/* Volumen de usuarios y roles */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Cuántos usuarios ingresarán al sistema de forma regular y qué
                perfiles o permisos (administrador, finanzas, ventas, solo
                lectura…) necesitarán?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={volumenUsuarios}
                onChange={(e) => setVolumenUsuarios(e.target.value)}
              />
            </Box>

            {/* Preferencia de hosting */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Prefieren un despliegue en la nube (Odoo.sh, AWS, Google Cloud)
                o en servidores propios (on-premise)?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={preferenciaHosting}
                onChange={(e) => setPreferenciaHosting(e.target.value)}
              />
            </Box>

            {/* Disponibilidad y rendimiento */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Requieren alta disponibilidad y tolerancia a fallos, o estiman
                un volumen específico de transacciones por hora o tamaño de base
                de datos?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={disponibilidadRendimiento}
                onChange={(e) => setDisponibilidadRendimiento(e.target.value)}
              />
            </Box>

            {/* Integraciones externas */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué sistemas externos desean conectar con Odoo (e-commerce,
                portal de proveedores, CRM previo, etc.) y con qué frecuencia
                deben sincronizarse (tiempo real, diario, semanal)?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={integracionesExternas}
                onChange={(e) => setIntegracionesExternas(e.target.value)}
              />
            </Box>

            {/* Migración de datos */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Necesitan importar datos históricos (clientes, productos,
                facturas, stock), y de qué antigüedad?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={migracionDatos}
                onChange={(e) => setMigracionDatos(e.target.value)}
              />
            </Box>

            {/* Personalizaciones y flujos */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué flujos de trabajo o reportes propios de su operación
                quisieran automatizar o adaptar mediante desarrollos a medida?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={personalizaciones}
                onChange={(e) => setPersonalizaciones(e.target.value)}
              />
            </Box>

            {/* Soporte y capacidad interna */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Con qué equipo de TI interno cuentan para la implementación y
                mantenimiento, y qué nivel de soporte externo esperan tras el
                lanzamiento?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={soporteCapacidad}
                onChange={(e) => setSoporteCapacidad(e.target.value)}
              />
            </Box>

            <Button variant="contained" color="primary" fullWidth disabled>
              Enviar diagnóstico (próximamente)
            </Button>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
