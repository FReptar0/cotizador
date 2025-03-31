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
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// ======== Tema con la misma paleta que usas en tu proyecto ========
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
      default: "#ffffff",
    },
    text: {
      primary: "#212528",
    },
    success: {
      main: "#388e3c",
    },
  },
});

// Lista de módulos (ordenados y con agregados)
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
  { name: "Gestión de Almacenes" },
  { name: "Gestión de Gastos" },
  { name: "Helpdesk" },
  { name: "Inventario" },
  { name: "Manufactura" },
  { name: "Mantenimiento" },
  { name: "Marketing" },
  { name: "Mesa de trabajo" },
  { name: "Planificación de la Producción" },
  { name: "Punto de Venta" },
  { name: "Proyectos" },
  { name: "Recursos Humanos" },
  { name: "Sitio Web" },
  { name: "Suscripciones" },
  { name: "Ventas" },
  { name: "eCommerce" },
];

// Opciones para la cantidad de usuarios
const userRanges = [
  { label: "1 usuario", value: 1 },
  { label: "2 a 5 usuarios", value: 5 },
  { label: "6-10 usuarios", value: 10 },
  { label: "11-20 usuarios", value: 20 },
  { label: "21-50 usuarios", value: 50 },
  { label: "51-100 usuarios", value: 100 },
  { label: "Más de 100 usuarios", value: 150 },
];

// Opciones para la cantidad de órdenes/facturas
const orderRanges = [
  { label: "0 a 50", value: 50 },
  { label: "51 a 100", value: 100 },
  { label: "101 a 200", value: 200 },
  { label: "201 a 350", value: 350 },
  { label: "Más de 350", value: 400 },
];

// Opciones para el tipo de licencia
const licenseOptions = [
  {
    label: "Odoo Estándar (MX$225 por usuario + impuestos)",
    value: "estandar",
    cost: 225,
  },
  {
    label: "Odoo.sh (MX$342 por usuario + impuestos)",
    value: "odoo_sh",
    cost: 342,
  },
];

export default function CotizadorPage() {
  const router = useRouter();

  // Estado para controlar si ya verificamos el login
  const [authChecked, setAuthChecked] = useState(false);

  // Estados del cotizador
  const [users, setUsers] = useState(1);
  const [selectedModules, setSelectedModules] = useState([]);
  const [orders, setOrders] = useState(orderRanges[0].value);
  const [licenseType, setLicenseType] = useState("estandar");
  const [quote, setQuote] = useState(17000);

  // Verificar login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  // Cálculo de costo en tiempo real
  useEffect(() => {
    if (!authChecked) return;
    const moduleCount = selectedModules.length;

    // Base según cantidad de módulos
    let modulePrice = 0;
    if (moduleCount <= 3) {
      modulePrice = 17000;
    } else if (moduleCount >= 4 && moduleCount <= 5) {
      modulePrice = 21000;
    } else if (moduleCount >= 6 && moduleCount <= 8) {
      modulePrice = 25000;
    } else if (moduleCount >= 9) {
      modulePrice = 29000;
    }

    // Extra costo por rango de usuarios: si es mayor a "1 usuario", +2000
    const extraUsersCost = users > 1 ? 2000 : 0;

    // Extra costo por rango de órdenes: si se elige un rango mayor al mínimo, +3500
    const extraOrdersCost = orders > orderRanges[0].value ? 3500 : 0;

    // Costo de licencia por usuario
    const selectedLicense = licenseOptions.find(
      (opt) => opt.value === licenseType
    );
    const licenseCost = selectedLicense ? selectedLicense.cost : 225;

    // Se suma el costo de licencia multiplicado por el número de usuarios
    const total =
      modulePrice +
      users * 50 +
      orders * 0.5 +
      extraUsersCost +
      extraOrdersCost +
      users * licenseCost;

    setQuote(total.toFixed(2));
  }, [authChecked, users, selectedModules, orders, licenseType]);

  if (!authChecked) return null;

  // Función para manejar cambios en los módulos
  const handleModuleChange = (moduleName) => {
    setSelectedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((m) => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  // Obtiene las etiquetas para mostrar en el Resumen
  const selectedUserLabel = selectedUserRange(users);
  const selectedOrderLabel = selectedOrderRange(orders);
  const selectedLicenseLabel =
    licenseOptions.find((opt) => opt.value === licenseType)?.label || "";

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Estimador de Proyecto | Tersoft.mx</title>
        <meta name="description" content="Cotizador Odoo y Sage 300" />
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
            Cotizador Odoo
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Contenedor principal */}
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 5 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Columna Izquierda */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 3, md: 5 },
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
                  Una implementación exitosa requiere del análisis de las
                  necesidades de su negocio, configuración, capacitación de sus
                  usuarios clave, importación de sus datos y la personalización
                  de sus flujos de negocios.
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Tamaño de la empresa (usuarios) */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                    color="text.primary"
                  >
                    Tamaño de tu empresa (en usuarios)
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="user-range-label" color="primary">
                      Usuarios
                    </InputLabel>
                    <Select
                      labelId="user-range-label"
                      value={users}
                      label="Usuarios"
                      onChange={(e) => setUsers(parseInt(e.target.value))}
                      color="primary"
                    >
                      {userRanges.map((range) => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Tipo de licencia */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                    color="text.primary"
                  >
                    Tipo de licencia
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="license-label" color="primary">
                      Selecciona una licencia
                    </InputLabel>
                    <Select
                      labelId="license-label"
                      value={licenseType}
                      label="Selecciona una licencia"
                      onChange={(e) => setLicenseType(e.target.value)}
                      color="primary"
                    >
                      {licenseOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Módulos */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                    color="text.primary"
                  >
                    Selecciona los módulos necesarios
                  </Typography>
                  <Grid container spacing={1}>
                    {odooModules.map((module) => (
                      <Grid item xs={12} sm={6} md={4} key={module.name}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              onChange={() => handleModuleChange(module.name)}
                              checked={selectedModules.includes(module.name)}
                              color="primary"
                            />
                          }
                          label={module.name}
                          sx={{ color: "text.primary" }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Órdenes/Facturas */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                    color="text.primary"
                  >
                    Cantidad de Órdenes/Facturas mensuales
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="orders-range-label" color="primary">
                      Selecciona un rango
                    </InputLabel>
                    <Select
                      labelId="orders-range-label"
                      value={orders}
                      label="Cantidad"
                      onChange={(e) => setOrders(parseInt(e.target.value))}
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
              </Paper>
            </Grid>

            {/* Columna Derecha: Resumen */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid #dee2e6",
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
                <Typography variant="body2" color="text.primary">
                  <strong>Usuarios:</strong> {selectedUserLabel}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  <strong>Licencia:</strong> {selectedLicenseLabel}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  <strong>Módulos:</strong> {selectedModules.length}
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                  <strong>Órdenes/Facturas:</strong> {selectedOrderLabel}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography
                  variant="h5"
                  color="success.main"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  MX${quote}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  *Costo estimado. Puede variar según requisitos específicos.
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                ></Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

/** Helpers: para mostrar las etiquetas de los rangos */
function selectedUserRange(users) {
  return userRanges.find((range) => range.value === users)?.label || "";
}
function selectedOrderRange(orders) {
  return orderRanges.find((range) => range.value === orders)?.label || "";
}
