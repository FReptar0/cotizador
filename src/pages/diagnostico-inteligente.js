import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
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
import Swal from "sweetalert2";

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
  const { data: session, status } = useSession();
  const [authChecked, setAuthChecked] = useState(false);

  // Datos del formulario
  const [nombreCliente, setNombreCliente] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
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

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (status === "authenticated") {
      setAuthChecked(true);
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Función para validar email
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  // Función para validar teléfono (solo dígitos y mínimo 8)
  function validatePhone(phone) {
    return /^\d{8,}$/.test(phone);
  }

  const handleGenerarDiagnostico = () => {
    // Validación de campos obligatorios y formato
    const nuevosErrores = {};
    if (!nombreCliente.trim()) nuevosErrores.nombreCliente = "Campo obligatorio";
    if (!nombreEmpresa.trim()) nuevosErrores.nombreEmpresa = "Campo obligatorio";
    if (!email.trim()) nuevosErrores.email = "Campo obligatorio";
    if (!telefono.trim()) nuevosErrores.telefono = "Campo obligatorio";
    if (email && !validateEmail(email)) nuevosErrores.email = "Correo inválido";
    if (telefono && !validatePhone(telefono)) nuevosErrores.telefono = "Teléfono inválido (mínimo 8 dígitos)";
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      let mensaje = "Por favor corrige los siguientes campos obligatorios:";
      if (nuevosErrores.nombreCliente) mensaje += "\n- Nombre completo";
      if (nuevosErrores.nombreEmpresa) mensaje += "\n- Nombre de la empresa";
      if (nuevosErrores.email) mensaje += `\n- Correo electrónico: ${nuevosErrores.email}`;
      if (nuevosErrores.telefono) mensaje += `\n- Teléfono: ${nuevosErrores.telefono}`;
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos o inválidos",
        text: mensaje,
      });
      return;
    }

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

  // Redirige si no está autenticado
  if (status === "loading") return null;
  if (!session) {
    if (typeof window !== "undefined") router.replace("/login");
    return null;
  }

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
              sx={{ color: "#01a09d", fontSize: "2.5rem" }}
            >
              Diagnóstico inteligente para tu empresa
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mb: 3 }}>
              Responde las siguientes preguntas para definir el alcance ideal de tu implementación Odoo.
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* SECCIÓN 1: DATOS DEL CLIENTE */}
            <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
              Datos del cliente
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Nombre completo"
                variant="outlined"
                fullWidth
                required
                value={nombreCliente}
                onChange={e => setNombreCliente(e.target.value)}
                error={!!errores.nombreCliente}
                helperText={errores.nombreCliente || "Ejemplo: Juan Pérez"}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Nombre de la empresa"
                variant="outlined"
                fullWidth
                required
                value={nombreEmpresa}
                onChange={e => setNombreEmpresa(e.target.value)}
                error={!!errores.nombreEmpresa}
                helperText={errores.nombreEmpresa || "Ejemplo: Soluciones XYZ S.A. de C.V."}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Correo electrónico"
                variant="outlined"
                fullWidth
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={!!errores.email}
                helperText={errores.email || "Ejemplo: juan.perez@empresa.com"}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Número de teléfono"
                variant="outlined"
                fullWidth
                required
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                error={!!errores.telefono}
                helperText={errores.telefono || "Ejemplo: 5551234567"}
                sx={{ mb: 2 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* SECCIÓN 2: PREGUNTAS DE DIAGNÓSTICO */}
            <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
              Preguntas de diagnóstico
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿A qué sector o industria pertenece su empresa?
              </Typography>
              <TextField
                fullWidth
                value={giro}
                onChange={e => setGiro(e.target.value)}
                placeholder="Ejemplo: Manufactura, Retail, Salud, etc."
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Cuántos empleados tiene actualmente su empresa?
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={empleados}
                onChange={e => setEmpleados(e.target.value)}
                placeholder="Ejemplo: 50 empleados"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Cuáles son sus procesos más críticos (ventas, compras, inventarios, contabilidad, RR. HH., etc.) y qué desafíos enfrentan en cada uno?
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={procesos}
                onChange={e => setProcesos(e.target.value)}
                placeholder="Ejemplo: Ventas (seguimiento de oportunidades), Inventarios (control de stock), etc."
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué sistemas o aplicaciones utilizan hoy para gestionar esos procesos?
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={problemas}
                onChange={e => setProblemas(e.target.value)}
                placeholder="Ejemplo: Excel, SAP, sistemas propios, Quickbooks, etc."
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué módulos de Odoo consideran indispensables en una primera etapa?
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={objetivos}
                onChange={e => setObjetivos(e.target.value)}
                placeholder="Ejemplo: CRM, Ventas, Compras, Inventarios, Proyectos, Contabilidad, Nómina, e-commerce, etc."
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Cuántos usuarios ingresarán al sistema de forma regular y qué perfiles o permisos necesitarán?
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={clientes}
                onChange={e => setClientes(e.target.value)}
                placeholder="Ejemplo: 10 usuarios, 2 administradores, 3 ventas, 5 solo lectura."
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Prefieren un despliegue en la nube (Odoo.sh, AWS, Google Cloud) o en servidores propios (on-premise)?
              </Typography>
              <TextField
                fullWidth
                value={productos}
                onChange={e => setProductos(e.target.value)}
                placeholder="Ejemplo: Odoo.sh, AWS, Google Cloud, on-premise, etc."
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Requieren alta disponibilidad y tolerancia a fallos, o estiman un volumen específico de transacciones por hora o tamaño de base de datos?
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={ventas}
                onChange={e => setVentas(e.target.value)}
                placeholder="Ejemplo: Alta disponibilidad, 100 transacciones/hora, base de datos de 10GB, etc."
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué sistemas externos desean conectar con Odoo y con qué frecuencia deben sincronizarse?
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={logistica}
                onChange={e => setLogistica(e.target.value)}
                placeholder="Ejemplo: Integración con tienda en línea, portal de proveedores, sincronización diaria con CRM previo, etc."
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Necesitan importar datos históricos (clientes, productos, facturas, stock), y de qué antigüedad?
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={equipoTI}
                onChange={e => setEquipoTI(e.target.value)}
                placeholder="Ejemplo: Importar clientes y facturas de los últimos 3 años."
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué flujos de trabajo o reportes propios de su operación quisieran automatizar o adaptar mediante desarrollos a medida?
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={resultado}
                onChange={e => setResultado(e.target.value)}
                placeholder="Ejemplo: Automatizar aprobación de compras, reporte de ventas personalizado, etc."
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Con qué equipo de TI interno cuentan para la implementación y mantenimiento, y qué nivel de soporte externo esperan tras el lanzamiento?
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={loading}
                onChange={e => setLoading(e.target.value)}
                placeholder="Ejemplo: 1 persona de TI interna, soporte externo esperado 24/7 durante el primer año."
              />
            </Box>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerarDiagnostico}
              disabled={loading}
              sx={{
                fontSize: "1rem",
                padding: "1rem 1.5rem",
                backgroundColor: "#a4478d",
                color: "#ffffff",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#922c76",
                  transform: "scale(1.05)",
                },
                "&:disabled": {
                  backgroundColor: "#d3d3d3",
                  color: "#8c8c8c",
                },
              }}
            >
              {loading ? "Procesando…" : "Generar diagnóstico"}
            </Button>

            {resultado && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  Resultado generado automáticamente:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ whiteSpace: "pre-wrap", mb: 2 }}
                  color="text.primary"
                >
                  {Object.entries(resultado).map(
                    ([key, val]) => `**${key.toUpperCase()}**\n${val}\n\n`
                  )}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={generarPDF}
                  sx={{
                    fontSize: "1rem",
                    padding: "1rem 1.5rem",
                    backgroundColor: "#a4478d",
                    color: "#ffffff",
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#922c76",
                      transform: "scale(1.05)",
                    },
                    "&:disabled": {
                      backgroundColor: "#d3d3d3",
                      color: "#8c8c8c",
                    },
                  }}
                >
                  Descargar y enviar por correo
                </Button>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
