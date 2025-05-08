import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react"; // ← importa signOut
import { useSession } from "next-auth/react"; // ← importa useSession
import Swal from "sweetalert2";
import {
  Container,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  IconButton,
  Menu,
  TextField,
  RadioGroup,
  Radio,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import Chip from "@mui/material/Chip";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Configuración del tema con la nueva paleta
const theme = createTheme({
  palette: {
    primary: {
      main: "#337ab7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#343b40",
    },
    background: {
      default: "#ffffff", // Fondo claro
    },
    text: {
      primary: "#212528",
    },
    success: {
      main: "#388e3c",
    },
  },
});

// Órdenes/Facturas mensuales
const orderRanges = [
  { label: "0 a 100", value: 100 },
  { label: "101 a 200", value: 200 },
  { label: "201 a 500", value: 500 },
  { label: "Más de 500", value: 600 },
];

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

export default function CotizadorPage() {
  const router = useRouter();
  const inputRef = useRef(null);

  const { data: session, status } = useSession();

  // Drag & Drop handlers
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith(".txt")) {
      setTranscriptionFile(file);
      setFileName(file.name);
    }
  };

  // Manejador selección archivo por clic
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.toLowerCase().endsWith(".txt")) {
      setTranscriptionFile(file);
      setFileName(file.name);
    }
  };

  // verificar si se esta descargando
  const [isDownloading, setIsDownloading] = useState(false);

  // Estados del cotizador
  const [selectedModules, setSelectedModules] = useState([]);
  const [implementationType, setImplementationType] = useState("cliente");
  const [nEmpresas, setNEmpresas] = useState(1);
  const [urgenciaDias, setUrgenciaDias] = useState("");
  const [importacionDatos, setImportacionDatos] = useState("no");
  const [integraciones, setIntegraciones] = useState("no");
  const [personalizaciones, setPersonalizaciones] = useState("no");
  const [reportes, setReportes] = useState("no");

  // Otros campos informativos
  const [orderRange, setOrderRange] = useState(orderRanges[0].value);
  const [multimoneda, setMultimoneda] = useState("no");
  const [hosteo, setHosteo] = useState("Odoo Online");
  const [fechaInicio, setFechaInicio] = useState("Aún no tengo claro");

  // NUEVOS estados para Odoo.sh
  const [gbStorage, setGbStorage] = useState(1);
  const [testEnvironments, setTestEnvironments] = useState(1);

  // Número de usuarios (licencias)
  const [numUsuarios, setNumUsuarios] = useState(0);

  // Archivo de transcripción
  const [transcriptionFile, setTranscriptionFile] = useState(null);
  const [fileName, setFileName] = useState("");

  // Datos del cliente
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // **Nuevo estado** para la pregunta de catálogo de cuentas
  const [tienenCatalogoCuentas, setTienenCatalogoCuentas] = useState("sí");

  // Menú de usuario (si se usa en esta página)
  const [anchorEl, setAnchorEl] = useState(null);

  // Resultados
  const [quote, setQuote] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);

  // Costos de licencias + hosteo
  const [licenseQuote, setLicenseQuote] = useState(0);
  const [licenseQuoteNoDisc, setLicenseQuoteNoDisc] = useState(0);

  // 1.a) Hook de redirección (si no hay sesión)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);
  // Lógica de cálculo principal
  useEffect(() => {
    // Manejo seguro de NaN
    const safeNumUsuarios = isNaN(parseInt(numUsuarios))
      ? 0
      : parseInt(numUsuarios);
    const safeUrgencia = isNaN(parseInt(urgenciaDias))
      ? 0
      : parseInt(urgenciaDias);

    // NUEVOS valores seguros para Odoo.sh
    const safeGbStorage = isNaN(parseInt(gbStorage)) ? 1 : parseInt(gbStorage);
    const safeTestEnvironments = isNaN(parseInt(testEnvironments))
      ? 1
      : parseInt(testEnvironments);

    // Horas estimadas
    const n_modulos = selectedModules.length;
    let horasBase = 0;
    if (implementationType === "cliente") horasBase = n_modulos * 2;
    else if (implementationType === "mixta") horasBase = n_modulos * 6;
    else if (implementationType === "completa") horasBase = n_modulos * 12;

    // Horas extra
    let horasExtra = 0;
    if (nEmpresas > 1) horasExtra += (nEmpresas - 1) * 8;
    if (importacionDatos === "sí") horasExtra += 10;
    if (integraciones === "sí") horasExtra += 15;
    if (personalizaciones === "sí") horasExtra += 15;
    if (reportes === "sí") horasExtra += 8;

    const urgenciaFactor = safeUrgencia > 0 && safeUrgencia <= 30 ? 1.2 : 1.0;
    const horasTotales = Math.ceil((horasBase + horasExtra) * urgenciaFactor);
    setEstimatedHours(horasTotales);

    // **Cálculo del costo de implementación**:
    let costoImplementacion = horasTotales * 500;
    if (tienenCatalogoCuentas === "no") {
      costoImplementacion += 1000;
    }
    setQuote(costoImplementacion.toFixed(2));

    // Costo anual de licencias + hosteo
    const costPerUserYear = 4080;
    const firstYearDiscount = 0.1; // 10%

    const costoLicenciasSinDesc = safeNumUsuarios * costPerUserYear;
    const costoLicenciasPrimerAnio =
      costoLicenciasSinDesc * (1 - firstYearDiscount);

    let hostingCostAnnual = 0;
    if (hosteo === "Odoo.sh") {
      const monthlyHosting =
        safeNumUsuarios * 1152 + safeGbStorage * 4 + safeTestEnvironments * 288;
      hostingCostAnnual = monthlyHosting * 12;
    }

    setLicenseQuoteNoDisc(
      (costoLicenciasSinDesc + hostingCostAnnual).toFixed(2)
    );
    setLicenseQuote((costoLicenciasPrimerAnio + hostingCostAnnual).toFixed(2));
  }, [
    selectedModules,
    implementationType,
    nEmpresas,
    urgenciaDias,
    importacionDatos,
    integraciones,
    personalizaciones,
    reportes,
    hosteo,
    numUsuarios,
    gbStorage,
    testEnvironments,
    tienenCatalogoCuentas, // ¡No olvides añadirlo a las deps!
  ]);

  // Manejo de cambio en módulos
  const handleModuleChange = (moduleName) => {
    setSelectedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((m) => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  // lógica del menú de usuario
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // enviar datos a gemini
  const handleDownloadAndSend = async () => {
    // 1) Validaciones básicas
    if (
      !customerName.trim() ||
      !customerCompany.trim() ||
      !customerEmail.trim() ||
      !customerPhone.trim()
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Faltan datos del cliente",
        text: "Por favor completa todos los datos del cliente antes de continuar.",
      });
      return;
    }
    if (selectedModules.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "No has seleccionado módulos",
        text: "Debes seleccionar al menos un módulo para generar la cotización.",
      });
      return;
    }
    const safeNumUsuarios = isNaN(parseInt(numUsuarios))
      ? 0
      : parseInt(numUsuarios);
    if (safeNumUsuarios < 1) {
      await Swal.fire({
        icon: "warning",
        title: "Licencias insuficientes",
        text: "Debes especificar al menos una licencia para continuar.",
      });
      return;
    }

    setIsDownloading(true);

    try {
      const payload = {
        customerName,
        customerCompany,
        selectedModules,
        implementationType,
        nEmpresas,
        urgenciaDias,
        importacionDatos,
        integraciones,
        personalizaciones,
        reportes,
        orderRange,
        multimoneda,
        hosteo,
        fechaInicio,
        numUsuarios,
        licenseQuote,
        quote,
        estimatedHours,
        gbStorage,
        testEnvironments,
      };

      // 2) Generar y descargar el PDF
      const pdfRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!pdfRes.ok) throw new Error(`Error generando PDF (${pdfRes.status})`);
      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Propuesta.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // 3) Enviar el PDF por correo (uso mismo blob)
      // Convertimos blob a Base64
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const base64 = dataUrl.split(",")[1];

      const mailRes = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail,
          customerName,
          customerCompany,
          pdfBase64: base64,
        }),
      });
      const mailText = await mailRes.text();
      console.log("📤 /api/send-email respondió:", mailRes.status, mailText);
      if (!mailRes.ok) throw new Error(mailText);

      await Swal.fire(
        "¡Listo!",
        "PDF descargado y enviado por correo.",
        "success"
      );
    } catch (error) {
      console.error(error);
      await Swal.fire(
        "Error",
        "Ocurrió un problema descargando o enviando la propuesta.",
        "error"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // 2) AHORA el guard para el loading de NextAuth:
  if (status === "loading") {
    return null; // o un spinner
  }

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Cotizador de Proyecto | Tersoft.mx</title>
        <link rel="icon" href="/Tersoft.webp" />
        <meta name="description" content="Cotizador Odoo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Se asume que el Navbar y el Footer se integran desde el Layout global */}
      <Box sx={{ bgcolor: "background.default" }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Grid container spacing={2}>
            {/* Columna Izquierda (Formulario) */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 2, md: 5 },
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                  width: "100%",
                  maxWidth: "800px", // ancho fijo para el formulario
                  margin: "0 auto",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  color="text.primary"
                >
                  Estimador del proyecto
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ mb: 3 }}>
                  Complete los siguientes campos para obtener la estimación de
                  horas, costo y recomendaciones clave.
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Datos del Cliente */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    Datos del cliente
                  </Typography>
                  <TextField
                    label="Nombre"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <TextField
                    label="Empresa"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
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
                    FormHelperTextProps={{
                      sx: {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      },
                    }}
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
                    FormHelperTextProps={{
                      sx: {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      },
                    }}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                    onKeyPress={(event) => {
                      // Permitir solo dígitos (0-9)
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                </Box>

                {/* Subir transcripción (archivo TXT) */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    Subir transcripción (archivo TXT)
                  </Typography>

                  <Box
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => inputRef.current && inputRef.current.click()}
                    sx={{
                      border: "2px dashed #ccc",
                      borderRadius: 1,
                      p: 3,
                      textAlign: "center",
                      opacity: 0.5,
                      pointerEvents: "none",
                      cursor: "not-allowed",
                      mb: 3,
                    }}
                  >
                    <CloudUploadIcon
                      sx={{ fontSize: 40, color: "#555", mb: 1 }}
                    />
                    <Typography variant="body2" color="text.primary">
                      Arrastra y suelta tu archivo aquí
                      <br />o haz clic para seleccionar (.txt)
                    </Typography>
                  </Box>

                  <input
                    type="file"
                    accept=".txt"
                    hidden
                    ref={inputRef}
                    onChange={handleFileChange}
                  />

                  {fileName && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        p: 1,
                        mt: 1,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <InsertDriveFileIcon sx={{ color: "#555" }} />
                        <Typography variant="body1" color="text.primary">
                          {fileName}
                        </Typography>
                        <Chip
                          label=".txt"
                          size="small"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f0f0f0",
                          }}
                        />
                      </Box>
                      <IconButton
                        aria-label="Eliminar archivo"
                        onClick={() => {
                          setTranscriptionFile(null);
                          setFileName("");
                        }}
                        sx={{ color: "#555" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                {/* Número de usuarios (licencias) */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    Número de usuarios (licencias)
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="number"
                    value={numUsuarios}
                    onChange={(e) => setNumUsuarios(e.target.value)}
                    inputProps={{ min: 1 }}
                  />
                </Box>

                {/* Tipo de hosteo */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    Tipo de hosteo
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="hosteo-label" color="primary">
                      Selecciona un tipo
                    </InputLabel>
                    <Select
                      labelId="hosteo-label"
                      value={hosteo}
                      label="Selecciona un tipo"
                      onChange={(e) => setHosteo(e.target.value)}
                      color="primary"
                      MenuProps={{
                        disableScrollLock: true,
                        PaperProps: { style: { maxHeight: 240 } },
                      }}
                    >
                      <MenuItem value="Odoo Online">
                        Odoo Online (versión estándar, limitada a módulos
                        oficiales)
                      </MenuItem>
                      <MenuItem value="Odoo.sh">
                        Odoo.sh (flexible, personalizable, en la nube)
                      </MenuItem>
                      {/* <MenuItem value="On-Premise">
                        On-Premise (en servidores propios o de terceros)
                      </MenuItem> */}
                    </Select>
                  </FormControl>
                </Box>

                {/* GB y entornos solo para Odoo.sh */}
                {hosteo === "Odoo.sh" && (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ mb: 1 }}
                      >
                        GB de almacenamiento
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        type="number"
                        value={gbStorage}
                        onChange={(e) =>
                          setGbStorage(parseInt(e.target.value) || 1)
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="text.primary"
                        sx={{ mb: 1 }}
                      >
                        Entornos de pruebas
                      </Typography>
                      <TextField
                        fullWidth
                        variant="outlined"
                        type="number"
                        value={testEnvironments}
                        onChange={(e) =>
                          setTestEnvironments(parseInt(e.target.value) || 1)
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Box>
                  </>
                )}

                {/* Órdenes / Facturas mensuales */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    Órdenes / Facturas mensuales
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="orders-range-label" color="primary">
                      Selecciona un rango
                    </InputLabel>
                    <Select
                      labelId="orders-range-label"
                      value={orderRange}
                      onChange={(e) => setOrderRange(parseInt(e.target.value))}
                      label="Selecciona un rango"
                      color="primary"
                      MenuProps={{
                        disableScrollLock: true,
                        PaperProps: { style: { maxHeight: 240 } },
                      }}
                    >
                      {orderRanges.map((range) => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Sección de módulos con diseño separado por grupos */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 2 }}
                  >
                    Selecciona los módulos necesarios
                  </Typography>

                  <Grid container spacing={4}>
                    {[
                      {
                        title: "FINANZAS",
                        color: "#008080",
                        items: [
                          "Contabilidad",
                          "Facturación",
                          "Gastos",
                          "Hoja de cálculo (BI)",
                          "Documentos",
                          "Firma electrónica",
                        ],
                      },
                      {
                        title: "VENTAS",
                        color: "#FF6B6B",
                        items: [
                          "CRM",
                          "Ventas",
                          "PdV para tiendas",
                          "PdV para restaurantes",
                          "Suscripciones",
                          "Alquiler",
                        ],
                      },
                      {
                        title: "SITIOS WEB",
                        color: "#4A90E2",
                        items: [
                          "Creador de sitios web",
                          "Comercio electrónico",
                          "Blog",
                          "Foro",
                          "Chat en vivo",
                          "eLearning",
                        ],
                      },
                      {
                        title: "CADENA DE SUMINISTRO",
                        color: "#7B61FF",
                        items: [
                          "Inventario",
                          "Manufactura",
                          "PLM",
                          "Compras",
                          "Mantenimiento",
                          "Calidad",
                        ],
                      },
                      {
                        title: "RECURSOS HUMANOS",
                        color: "#8E7CC3",
                        items: [
                          "Empleados",
                          "Reclutamiento",
                          "Tiempo personal",
                          "Evaluación",
                          "Referencias",
                          "Flota",
                        ],
                      },
                      {
                        title: "MARKETING",
                        color: "#F2994A",
                        items: [
                          "Marketing social",
                          "Email Marketing",
                          "Marketing por SMS",
                          "Eventos",
                          "Automatización de marketing",
                          "Encuestas",
                        ],
                      },
                      {
                        title: "SERVICIOS",
                        color: "#E67E22",
                        items: [
                          "Proyectos",
                          "Hojas de horas",
                          "Servicio externo",
                          "Soporte al cliente",
                          "Planeación",
                          "Citas",
                        ],
                      },
                      {
                        title: "PRODUCTIVIDAD",
                        color: "#9B59B6",
                        items: [
                          "Conversaciones",
                          "Aprobaciones",
                          "IoT",
                          "VoIP",
                          "Información",
                          "WhatsApp",
                        ],
                      },
                    ].map((group) => (
                      <Grid item xs={12} sm={6} md={4} key={group.title}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{
                            color: group.color,
                            borderBottom: `2px solid ${group.color}`,
                            mb: 1,
                            pb: 0.5,
                          }}
                        >
                          {group.title}
                        </Typography>
                        {group.items.map((moduleName) => (
                          <FormControlLabel
                            key={moduleName}
                            control={
                              <Checkbox
                                onChange={() => handleModuleChange(moduleName)}
                                checked={selectedModules.includes(moduleName)}
                                sx={{
                                  color: group.color,
                                  "&.Mui-checked": { color: group.color },
                                }}
                              />
                            }
                            label={moduleName}
                          />
                        ))}
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Parámetros del proyecto */}
                {/* 1. Personal interno */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    ¿Tienen personal interno que podría implementar el sistema?
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={implementationType}
                      onChange={(e) => setImplementationType(e.target.value)}
                    >
                      <FormControlLabel
                        value="cliente"
                        control={<Radio color="primary" />}
                        label="Sí, contamos con equipo técnico"
                      />
                      <FormControlLabel
                        value="mixta"
                        control={<Radio color="primary" />}
                        label="Parcialmente (necesitaríamos guía)"
                      />
                      <FormControlLabel
                        value="completa"
                        control={<Radio color="primary" />}
                        label="No, requerimos implementación completa"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* 2. Número de empresas */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    Número de empresas/razones sociales
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="number"
                    value={nEmpresas}
                    onChange={(e) => setNEmpresas(parseInt(e.target.value))}
                  />
                </Box>

                {/* 3. Días hasta la entrega */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    Días hasta la entrega
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="number"
                    value={urgenciaDias}
                    onChange={(e) => setUrgenciaDias(e.target.value)}
                    helperText="Si es ≤ 30 se aplica +20%"
                  />
                </Box>

                {/* 4. Importación de datos */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    ¿Se va a crear una empresa nueva y se subirán saldos
                    iniciales?
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={importacionDatos}
                      onChange={(e) => setImportacionDatos(e.target.value)}
                    >
                      <FormControlLabel
                        value="sí"
                        control={<Radio color="primary" />}
                        label="Sí"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio color="primary" />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* 5. Integraciones */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    ¿Requiere integraciones/desarrollos?
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={integraciones}
                      onChange={(e) => setIntegraciones(e.target.value)}
                    >
                      <FormControlLabel
                        value="sí"
                        control={<Radio color="primary" />}
                        label="Sí"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio color="primary" />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* cuentas contables*/}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    ¿Ya tienen el catálogo de cuentas contables que se utilizará
                    en la implementación?
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={tienenCatalogoCuentas}
                      onChange={(e) => setTienenCatalogoCuentas(e.target.value)}
                    >
                      <FormControlLabel
                        value="sí"
                        control={<Radio color="primary" />}
                        label="Sí"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio color="primary" />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* 6. Personalizaciones */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    ¿Requiere personalizaciones?
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={personalizaciones}
                      onChange={(e) => setPersonalizaciones(e.target.value)}
                    >
                      <FormControlLabel
                        value="sí"
                        control={<Radio color="primary" />}
                        label="Sí"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio color="primary" />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* 7. Reportes especializados */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    ¿Requiere reportes especializados o a la medida?
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={reportes}
                      onChange={(e) => setReportes(e.target.value)}
                    >
                      <FormControlLabel
                        value="no"
                        control={<Radio color="primary" />}
                        label="No, los reportes estándar son suficientes"
                      />
                      <FormControlLabel
                        value="sí"
                        control={<Radio color="primary" />}
                        label="Sí"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* 8. Multimoneda */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    ¿La implementación será multimoneda?
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={multimoneda}
                      onChange={(e) => setMultimoneda(e.target.value)}
                    >
                      <FormControlLabel
                        value="sí"
                        control={<Radio color="primary" />}
                        label="Sí"
                      />
                      <FormControlLabel
                        value="no"
                        control={<Radio color="primary" />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* 9. Fecha estimada */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    Fecha estimada de inicio del proyecto
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                    >
                      <FormControlLabel
                        value="Inmediatamente"
                        control={<Radio color="primary" />}
                        label="Inmediatamente"
                      />
                      <FormControlLabel
                        value="En 1-2 meses"
                        control={<Radio color="primary" />}
                        label="En 1-2 meses"
                      />
                      <FormControlLabel
                        value="En 3-6 meses"
                        control={<Radio color="primary" />}
                        label="En 3-6 meses"
                      />
                      <FormControlLabel
                        value="Aún no tengo claro"
                        control={<Radio color="primary" />}
                        label="Aún no tengo claro"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Paper>
            </Grid>

            {/* Columna Derecha (vacía en desktop) */}
            <Grid item xs={0} md={4} />
          </Grid>
        </Container>

        {/* Resumen flotante (solo en escritorio) */}
        <Box
          sx={{
            position: "fixed",
            top: 90,
            left: "calc((100% - 1200px)/2 + 900px)",
            width: 400,
            display: { xs: "none", md: "block" },
            zIndex: 1,
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: "#f8f9fa",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              sx={{ mb: 2 }}
            >
              Resumen
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
              <strong>Módulos seleccionados:</strong> {selectedModules.length}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
              <strong>Horas estimadas:</strong> {estimatedHours} horas
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Costo de implementación */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: "bold", color: "#000000" }}
              >
                Costo de implementación:
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", color: "#000000" }}
              >
                MX$ {quote}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                *Este costo es una aproximación y puede variar según los
                requerimientos, para una cotización más precisa, por favor
                contáctenos.
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Costo anual de licencias */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body3"
                sx={{ mb: 1, fontWeight: "bold", color: "#000000" }}
              >
                Costo anual de licencias:
              </Typography>

              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", color: "#000000" }}
              >
                MX$ {licenseQuote}
              </Typography>

              {/* Precio SIN Descuento */}
              <Typography variant="body2" color="text.primary">
                <strong>Precio regular (sin descuento):</strong> MX${" "}
                {licenseQuoteNoDisc}
              </Typography>

              {/* Precio con Descuento */}
              {/* <Typography variant="body2" color="text.primary">
                <strong>Con 10% de descuento (1er año):</strong> MX${" "}
                {licenseQuote}
              </Typography> */}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                El costo se paga directamente a odoo
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Costo total */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: "bold", color: "#000000" }}
              >
                Costo total:
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", color: "#000000" }}
              >
                MX${" "}
                {(
                  parseFloat(quote || 0) + parseFloat(licenseQuote || 0)
                ).toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}
            >
              {" "}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleDownloadAndSend}
                disabled={isDownloading}
              >
                {isDownloading
                  ? "Procesando…"
                  : "Descargar y enviar por correo"}
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Resumen al final (solo en móviles) */}
        <Box sx={{ display: { xs: "block", md: "none" }, px: 2, pb: 2 }}>
          <Paper
            elevation={1}
            sx={{ p: 3, borderRadius: 2, backgroundColor: "#f8f9fa" }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              color="text.primary"
              sx={{ mb: 2 }}
            >
              Resumen
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
              <strong>Módulos seleccionados:</strong> {selectedModules.length}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
              <strong>Horas estimadas:</strong> {estimatedHours} horas
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Costo de implementación en móvil */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: "bold", color: "#000000" }}
              >
                Costo de implementación:
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", color: "#000000" }}
              >
                MX$ {quote}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Costo anual de licencias en móvil */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: "bold", color: "#000000" }}
              >
                Costo anual de licencias:
              </Typography>

              {/* SIN DESCUENTO */}
              <Typography variant="body2" color="text.primary">
                <strong>Precio regular:</strong> MX$ {licenseQuoteNoDisc}
              </Typography>

              {/* CON DESCUENTO */}
              <Typography variant="body2" color="text.primary">
                <strong>10% desc. 1er año:</strong> MX$ {licenseQuote}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                El costo sin descuento es de 4080 MXN por usuario/año, pero para
                el primer año se aplica un 10% de descuento.
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 3 }}
            >
              <Button variant="contained" color="primary" fullWidth>
                ENVIAR COTIZACIÓN
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
