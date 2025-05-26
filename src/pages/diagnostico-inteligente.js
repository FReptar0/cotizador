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
import Swal from "sweetalert2";

const theme = createTheme({
  palette: {
    primary: { main: "#337ab7", contrastText: "#ffffff" },
    secondary: { main: "#343b40" },
    background: { default: "#ffffff" },
    text: { primary: "#212528" },
  },
});

// Valida correo
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return "Por favor ingresa un correo válido";
  }
  return "";
}

// Valida teléfono (solo dígitos)
function validatePhone(phone) {
  const regex = /^[0-9]+$/;
  if (!regex.test(phone)) {
    return "Por favor ingresa un número de teléfono válido (solo dígitos)";
  }
  return "";
}

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

  // Datos del cliente
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const handleGenerarDiagnostico = async () => {
    // Validaciones obligatorias
    if (!customerName.trim() || !customerCompany.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setEmailError(validateEmail(customerEmail));
      setPhoneError(validatePhone(customerPhone));
      await Swal.fire({
        icon: "warning",
        title: "Faltan datos del cliente",
        text: "Por favor completa todos los datos obligatorios del cliente antes de continuar.",
      });
      return;
    }
    const emailErr = validateEmail(customerEmail);
    const phoneErr = validatePhone(customerPhone);
    setEmailError(emailErr);
    setPhoneError(phoneErr);
    if (emailErr || phoneErr) {
      await Swal.fire({
        icon: "error",
        title: "Datos inválidos",
        text: "Por favor corrige los errores en el correo o teléfono.",
      });
      return;
    }
    setLoading(true);
    setIsDownloading(true);
    setResultado(null);
    try {
      const payload = {
        customerName,
        customerCompany,
        customerEmail,
        customerPhone,
        sectorIndustria,
        tamanoOrganizacion,
        procesosCriticos,
        herramientasActuales,
        modulosPrioritarios,
        volumenUsuarios,
        preferenciaHosting,
        disponibilidadRendimiento,
        integracionesExternas,
        migracionDatos,
        personalizaciones,
        soporteCapacidad,
      };
      const pdfRes = await fetch("/api/gemini-diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!pdfRes.ok) throw new Error(`Error generando PDF (${pdfRes.status})`);
      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Diagnostico-Odoo.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      await Swal.fire({
        icon: "success",
        title: "¡Diagnóstico generado!",
        text: "El PDF se ha descargado correctamente.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error generando el diagnóstico. Intenta de nuevo.",
      });
      console.error(error);
    } finally {
      setLoading(false);
      setIsDownloading(false);
    }
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
              color="#01a09d"
              sx={{
                color: "#01a09d", // Azul igual que cotizador.js
                fontSize: "2.5rem", // Tamaño grande igual que cotizador.js
              }}
            >
              Diagnóstico inteligente para tu empresa
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
              Responde este breve formulario para que podamos entender mejor tus
              necesidades y recomendarte la mejor solución Odoo.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {/* Datos del cliente */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                Datos del cliente <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                label="Nombre"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <TextField
                label="Empresa"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                required
              />
              <TextField
                label="Correo"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                error={Boolean(emailError)}
                helperText={emailError}
                required
              />
              <TextField
                label="Teléfono"
                variant="outlined"
                type="tel"
                fullWidth
                sx={{ mb: 2 }}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onBlur={(e) => setPhoneError(validatePhone(e.target.value))}
                error={Boolean(phoneError)}
                helperText={phoneError}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                required
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Box>

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
                placeholder="Ejemplo: Manufactura, Retail, Servicios Financieros, Salud, Construcción, etc."
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
                placeholder="Ejemplo: 25, 100, 500, 1200"
              />
            </Box>

            {/* Procesos críticos y retos */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Cuáles son sus procesos más críticos (ventas, compras, inventarios, contabilidad, RR. HH., etc.) y qué desafíos enfrentan en cada uno?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={3}
                value={procesosCriticos}
                onChange={(e) => setProcesosCriticos(e.target.value)}
                placeholder="Ejemplo: Ventas (seguimiento de oportunidades), Inventarios (errores de stock), Contabilidad (conciliación bancaria manual), RRHH (control de asistencia)"
              />
            </Box>

            {/* Herramientas actuales */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué sistemas o aplicaciones utilizan hoy para gestionar esos procesos?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={herramientasActuales}
                onChange={(e) => setHerramientasActuales(e.target.value)}
                placeholder="Ejemplo: Excel, CONTPAQi, Aspel, sistemas propios, Zoho, SAP, Quickbooks, etc."
              />
            </Box>

            {/* Módulos prioritarios */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué módulos de Odoo consideran indispensables en una primera etapa (CRM, Ventas, Compras, Inventarios, Proyectos, Contabilidad, Nómina, e-commerce…)?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={modulosPrioritarios}
                onChange={(e) => setModulosPrioritarios(e.target.value)}
                placeholder="Ejemplo: CRM, Ventas, Compras, Inventarios, Contabilidad, Nómina, Proyectos, e-commerce"
              />
            </Box>

            {/* Volumen de usuarios y roles */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Cuántos usuarios ingresarán al sistema de forma regular y qué perfiles o permisos (administrador, finanzas, ventas, solo lectura…) necesitarán?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={volumenUsuarios}
                onChange={(e) => setVolumenUsuarios(e.target.value)}
                placeholder="Ejemplo: 10 usuarios (2 administradores, 3 ventas, 2 finanzas, 3 solo lectura)"
              />
            </Box>

            {/* Preferencia de hosting */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Prefieren un despliegue en la nube (Odoo.sh, AWS, Google Cloud) o en servidores propios (on-premise)?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={preferenciaHosting}
                onChange={(e) => setPreferenciaHosting(e.target.value)}
                placeholder="Ejemplo: Odoo.sh, AWS, Google Cloud, On-premise"
              />
            </Box>

            {/* Disponibilidad y rendimiento */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Requieren alta disponibilidad y tolerancia a fallos, o estiman un volumen específico de transacciones por hora o tamaño de base de datos?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={disponibilidadRendimiento}
                onChange={(e) => setDisponibilidadRendimiento(e.target.value)}
                placeholder="Ejemplo: 100 transacciones/hora, base de datos de 10GB, alta disponibilidad requerida"
              />
            </Box>

            {/* Integraciones externas */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué sistemas externos desean conectar con Odoo (e-commerce, portal de proveedores, CRM previo, etc.) y con qué frecuencia deben sincronizarse (tiempo real, diario, semanal)?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={integracionesExternas}
                onChange={(e) => setIntegracionesExternas(e.target.value)}
                placeholder="Ejemplo: Tienda en línea (Shopify, sincronización diaria), CRM previo (Zoho, tiempo real), portal de proveedores (semanal)"
              />
            </Box>

            {/* Migración de datos */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Necesitan importar datos históricos (clientes, productos, facturas, stock), y de qué antigüedad?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={migracionDatos}
                onChange={(e) => setMigracionDatos(e.target.value)}
                placeholder="Ejemplo: Clientes y facturas de los últimos 3 años, inventario actual"
              />
            </Box>

            {/* Personalizaciones y flujos */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Qué flujos de trabajo o reportes propios de su operación quisieran automatizar o adaptar mediante desarrollos a medida?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={personalizaciones}
                onChange={(e) => setPersonalizaciones(e.target.value)}
                placeholder="Ejemplo: Reporte de ventas personalizado, flujo de aprobación de compras, automatización de facturación recurrente"
              />
            </Box>

            {/* Soporte y capacidad interna */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                ¿Con qué equipo de TI interno cuentan para la implementación y mantenimiento, y qué nivel de soporte externo esperan tras el lanzamiento?
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                minRows={2}
                value={soporteCapacidad}
                onChange={(e) => setSoporteCapacidad(e.target.value)}
                placeholder="Ejemplo: 1 persona de TI interna, soporte externo nivel 2 durante 6 meses"
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerarDiagnostico}
              disabled={loading || isDownloading}
              sx={{
                fontSize: "1rem",
                padding: "1rem 1.5rem",
                backgroundColor: "#a4478d", // Morado igual que cotizador.js
                color: "#ffffff",
                transition: "transform 0.2s ease-in-out",
                '&:hover': {
                  backgroundColor: "#922c76",
                  transform: "scale(1.05)",
                },
                '&:disabled': {
                  backgroundColor: "#d3d3d3",
                  color: "#8c8c8c",
                },
              }}
            >
              {loading || isDownloading ? "Generando diagnóstico..." : "Generar diagnóstico y descargar PDF"}
            </Button>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
