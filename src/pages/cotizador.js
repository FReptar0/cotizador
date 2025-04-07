import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  AppBar,
  Toolbar,
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

// Lista de módulos
const odooModules = [
  { name: "Calidad" },
  { name: "Contabilidad" },
  { name: "CRM" },
  { name: "Compras" },
  { name: "Documentos" },
  { name: "Email Marketing" },
  { name: "Encuestas" },
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

// Precios por usuario según el tipo de hosteo
const hostingUserCosts = {
  "Odoo Online": { current: 225, old: 285 },
  "Odoo.sh": { current: 342, old: 425 },
  "On-Premise": { current: 0, old: 0 },
};

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

  // Nuevo campo: Número de usuarios (licencias)
  const [numUsuarios, setNumUsuarios] = useState(1);

  // Datos del cliente
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Menú de usuario
  const [anchorEl, setAnchorEl] = useState(null);

  // Resultados
  const [quote, setQuote] = useState(0);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [licenseQuote, setLicenseQuote] = useState(0);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  // Lógica de cálculo
  useEffect(() => {
    if (!authChecked) return;
    const n_modulos = selectedModules.length;
    let horasBase = 0;
    if (implementationType === "cliente") {
      horasBase = n_modulos * 2;
    } else if (implementationType === "mixta") {
      horasBase = n_modulos * 6;
    } else if (implementationType === "completa") {
      horasBase = n_modulos * 12;
    }

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

    const urgencia = parseInt(urgenciaDias);
    const urgenciaFactor = urgencia && urgencia <= 30 ? 1.2 : 1.0;
    // Redondeo al siguiente entero
    const horasTotales = Math.ceil((horasBase + horasExtra) * urgenciaFactor);
    const costoTotal = horasTotales * 500;
    setEstimatedHours(horasTotales);
    setQuote(costoTotal.toFixed(2));

    // Calcular el costo mensual de licencias
    const hostingCost = hostingUserCosts[hosteo]?.current || 0;
    const costoLicencias = numUsuarios * hostingCost;
    setLicenseQuote(costoLicencias.toFixed(2));
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

  // Menú del usuario
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

      {/* Navbar */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ bgcolor: "primary.main" }}>
          <img
            src="/Tersoft.webp"
            alt="Tersoft Logo"
            style={{ height: 40, marginRight: 16 }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#ffffff" }}>
            Cotizador para proyectos Odoo | Tersoft
          </Typography>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Contenedor principal */}
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
                  />
                  <TextField
                    label="Teléfono"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    onBlur={(e) => setPhoneError(validatePhone(e.target.value))}
                    error={Boolean(phoneError)}
                    helperText={phoneError}
                  />
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
                    onChange={(e) => setNumUsuarios(parseInt(e.target.value))}
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
                    >
                      {orderRanges.map((range) => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                    sx={{ mb: 1 }}
                  >
                    Selecciona los módulos necesarios
                  </Typography>
                  <Box
                    component="table"
                    sx={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: "16px 8px",
                    }}
                  >
                    <tbody>
                      {chunkArray(
                        [...odooModules].sort((a, b) =>
                          a.name.localeCompare(b.name)
                        ),
                        3
                      ).map((row, rowIndex) => (
                        <Box component="tr" key={rowIndex}>
                          {row.map((module) => (
                            <Box
                              component="td"
                              key={module.name}
                              sx={{
                                width: { xs: "100%", md: "33%" },
                                verticalAlign: "middle",
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    onChange={() =>
                                      handleModuleChange(module.name)
                                    }
                                    checked={selectedModules.includes(
                                      module.name
                                    )}
                                    color="primary"
                                  />
                                }
                                label={module.name}
                                sx={{
                                  "& .MuiFormControlLabel-label": {
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  },
                                }}
                              />
                            </Box>
                          ))}
                          {row.length < 3 &&
                            [...Array(3 - row.length)].map((_, i) => (
                              <Box
                                component="td"
                                key={`empty-${i}`}
                                sx={{
                                  width: { xs: "100%", md: "33%" },
                                }}
                              />
                            ))}
                        </Box>
                      ))}
                    </tbody>
                  </Box>
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

            {/* Columna Derecha "vacía" en desktop */}
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
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: "bold", color: "#000000" }}
              >
                Costo de implementación:
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "#000000" }}
              >
                MX$ {quote}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
              <strong>Costo mensual de licencias:</strong> MX$ {licenseQuote}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              *El costo de implementación es único y el de licencias es mensual.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                mt: 3,
              }}
            >
              <Button variant="contained" color="primary" fullWidth>
                ENVIAR COTIZACIÓN
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Resumen al final (solo en móviles) */}
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            px: 2,
            pb: 2,
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
            <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
              <strong>Costo de implementación:</strong> MX$ {quote}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
              <strong>Costo mensual de licencias:</strong> MX$ {licenseQuote}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              *El costo de implementación es único y el de licencias es mensual.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                mt: 3,
              }}
            >
              <Button variant="contained" color="primary" fullWidth>
                ENVIAR COTIZACIÓN
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Footer en negro */}
        <Box
          sx={{
            bgcolor: "#000000",
            color: "#ffffff",
            textAlign: "center",
            py: 2,
          }}
        >
          <Typography variant="body2">TESRFOT 2025</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

/** Helpers */
function chunkArray(array, size) {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
}

function validateEmail(email) {
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!regex.test(email)) {
    return "Por favor ingresa un correo válido";
  }
  return "";
}

function validatePhone(phone) {
  const regex = /^\+?\d{7,15}$/;
  if (!regex.test(phone)) {
    return "Por favor ingresa un número de teléfono válido";
  }
  return "";
}
