import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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

// Lista de módulos (si deseas mantenerla; no influye en la lógica de licencias)
const odooModules = [
  { name: "Calidad" },
  { name: "Contabilidad" },
  { name: "CRM" },
  { name: "Compras" },
  { name: "Documentos" },
  { name: "Email Marketing" },
  { name: "Encuestas" },
  { name: "Empleados" },
  { name: "Eventos" },
  { name: "Facturación" },
  { name: "Field Service" },
  { name: "Flota" },
  { name: "Gestión de Almacenes" },
  { name: "Gestión de Gastos" },
  { name: "Helpdesk" },
  { name: "Inventario" },
  { name: "Manufactura" },
  { name: "Mantenimiento" },
  { name: "Marketing" },
  { name: "Mesa de trabajo" },
  { name: "Proyectos" },
  { name: "Punto de Venta" },
  { name: "Recursos Humanos" },
  { name: "Sitio Web" },
  { name: "Suscripciones" },
  { name: "Ventas" },
];

// Valida correo
function validateEmail(email) {
  // Ajustado el guion para evitar problemas de rangos
  const regex = /^[\\w.\\-]+@([\\w\\-]+\\.)+[\\w\\-]{2,4}$/;
  if (!regex.test(email)) {
    return "Por favor ingresa un correo válido";
  }
  return "";
}

// Valida teléfono (solo dígitos)
function validatePhone(phone) {
  const regex = /^[0-9]+$/; // Solo dígitos
  if (!regex.test(phone)) {
    return "Por favor ingresa un número de teléfono válido (solo dígitos)";
  }
  return "";
}

export default function CotizadorPage() {
  const router = useRouter();

  // Verificar login
  const [authChecked, setAuthChecked] = useState(false);

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

  // Menú de usuario (si se usa en esta página)
  const [anchorEl, setAnchorEl] = useState(null);

  // Resultados
  const [quote, setQuote] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);

  // Costos de licencias
  const [licenseQuote, setLicenseQuote] = useState(0);
  const [licenseQuoteNoDisc, setLicenseQuoteNoDisc] = useState(0);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  // Manejo del archivo de transcripción
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTranscriptionFile(file);
      setFileName(file.name);
    }
  };

  // Lógica de cálculo principal
  useEffect(() => {
    if (!authChecked) return;

    // Manejo seguro de NaN
    const safeNumUsuarios = isNaN(parseInt(numUsuarios))
      ? 0
      : parseInt(numUsuarios);
    const safeUrgencia = isNaN(parseInt(urgenciaDias))
      ? 0
      : parseInt(urgenciaDias);

    // Horas estimadas
    const n_modulos = selectedModules.length;
    let horasBase = 0;

    // Multiplicadores según tipo de implementación
    if (implementationType === "cliente") {
      horasBase = n_modulos * 2;
    } else if (implementationType === "mixta") {
      horasBase = n_modulos * 6;
    } else if (implementationType === "completa") {
      horasBase = n_modulos * 12;
    }

    // Horas extra
    let horasExtra = 0;
    if (nEmpresas > 1) {
      horasExtra += (nEmpresas - 1) * 8;
    }
    if (importacionDatos === "sí") {
      horasExtra += 10;
    }
    if (integraciones === "sí") {
      horasExtra += 15;
    }
    if (personalizaciones === "sí") {
      horasExtra += 15;
    }
    if (reportes === "sí") {
      horasExtra += 8;
    }

    // Factor de urgencia
    const urgenciaFactor = safeUrgencia > 0 && safeUrgencia <= 30 ? 1.2 : 1.0;

    // Cálculo total de horas y costo de implementación
    const horasTotales = Math.ceil((horasBase + horasExtra) * urgenciaFactor);
    const costoTotal = horasTotales * 500;
    setEstimatedHours(horasTotales);
    setQuote(costoTotal.toFixed(2));

    // ------------------------------------------------
    // Costo anual de licencias
    //   - Precio fijo: 4080 MXN por usuario/año
    //   - Descuento 10% el primer año
    // ------------------------------------------------
    const costPerUserYear = 4080;
    const firstYearDiscount = 0.1; // 10%

    const costoLicenciasSinDesc = safeNumUsuarios * costPerUserYear;
    const costoLicenciasPrimerAnio =
      costoLicenciasSinDesc * (1 - firstYearDiscount);

    // Guardamos ambos para mostrarlos
    setLicenseQuoteNoDisc(costoLicenciasSinDesc.toFixed(2));
    setLicenseQuote(costoLicenciasPrimerAnio.toFixed(2));
  }, [
    authChecked,
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
  ]);

  if (!authChecked) return null;

  // Manejo de cambio en módulos
  const handleModuleChange = (moduleName) => {
    setSelectedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((m) => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  // Lógica del menú de usuario (si se usa)
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Cotizador de Proyecto | Tersoft.mx</title>
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
                  <Button variant="outlined" component="label">
                    Seleccionar archivo
                    <input
                      type="file"
                      accept=".txt"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                  {fileName && (
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mt: 1 }}
                    >
                      Archivo seleccionado: {fileName}
                    </Typography>
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
                      <MenuItem value="On-Premise">
                        On-Premise (en servidores propios o de terceros)
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

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
                    ¿Importa información inicial?
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
                variant="body2"
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
