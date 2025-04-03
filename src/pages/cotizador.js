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

// Lista de módulos (ordenados alfabéticamente y con los nuevos agregados)
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

export default function CotizadorPage() {
  const router = useRouter();

  // Estado para controlar si ya verificamos el login
  const [authChecked, setAuthChecked] = useState(false);

  // Estados del cotizador
  const [users, setUsers] = useState(1);
  const [selectedModules, setSelectedModules] = useState([]);
  const [orders, setOrders] = useState(orderRanges[0].value);
  const [quote, setQuote] = useState(17000); // Precio base inicial
  // Estado para el modelo de estimación de horas: "max" o "sum"
  const [hoursModel, setHoursModel] = useState("max");
  const [estimatedHours, setEstimatedHours] = useState(25);

  // Estados para los datos del cliente
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Estado para el menú del usuario en la navbar
  const [anchorEl, setAnchorEl] = useState(null);

  // Verificar login
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.replace("/login");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  // Cálculo del costo
  useEffect(() => {
    if (!authChecked) return;
    const moduleCount = selectedModules.length;
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
    const extraUsersCost = users > 1 ? 2000 : 0;
    const extraOrdersCost = orders > orderRanges[0].value ? 3500 : 0;
    const total =
      modulePrice +
      users * 50 +
      orders * 0.5 +
      extraUsersCost +
      extraOrdersCost;
    setQuote(total.toFixed(2));
  }, [authChecked, users, selectedModules, orders]);

  // Cálculo de horas estimadas
  useEffect(() => {
    if (!authChecked) return;
    let hours;
    if (hoursModel === "max") {
      hours = calculateHoursMax(selectedModules.length, users, orders);
    } else {
      hours = calculateHoursSum(selectedModules.length, users, orders);
    }
    setEstimatedHours(hours);
  }, [authChecked, users, selectedModules, orders, hoursModel]);

  if (!authChecked) return null;

  // Función para manejar cambios en los módulos
  const handleModuleChange = (moduleName) => {
    setSelectedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((m) => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  // Funciones para el menú del usuario en la navbar
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

  // Helpers para mostrar etiquetas en el resumen
  const selectedUserLabel = selectedUserRange(users);
  const selectedOrderLabel = selectedOrderRange(orders);

  // Funciones de validación
  const validateEmail = (email) => {
    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!regex.test(email)) {
      return "Por favor ingresa un email válido";
    }
    return "";
  };

  const validatePhone = (phone) => {
    // Permite opcionalmente el símbolo + y entre 7 a 15 dígitos
    const regex = /^\+?\d{7,15}$/;
    if (!regex.test(phone)) {
      return "Por favor ingresa un número de teléfono válido";
    }
    return "";
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Cotizador de Proyecto | Tersoft.mx</title>
        <meta name="description" content="Cotizador Odoo y Sage 300" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navbar con icono de usuario */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ bgcolor: "primary.main" }}>
          <img
            src="/Tersoft.webp"
            alt="Tersoft Logo"
            style={{ height: 40, marginRight: 16 }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#ffffff" }}>
            Cotizador para proyectos Odoo
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
            MenuProps={{
              disableScrollLock: true,
            }}
          >
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Contenedor principal */}
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 5 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} wrap="nowrap" sx={{ minWidth: "900px" }}>
            {/* Columna Izquierda (Formulario) */}
            <Grid item sx={{ width: "60%" }}>
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

                {/* Datos del Cliente */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                    color="text.primary"
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
                    label="Email"
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
                  <FormControl fullWidth variant="outlined">
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

                {/* Sección: Módulos */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                    color="text.primary"
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
                                width: "33%",
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
                                  alignItems: "center",
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
                                sx={{ width: "33%" }}
                              />
                            ))}
                        </Box>
                      ))}
                    </tbody>
                  </Box>
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
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="orders-range-label" color="primary">
                      Selecciona un rango
                    </InputLabel>
                    <Select
                      labelId="orders-range-label"
                      value={orders}
                      onChange={(e) => setOrders(parseInt(e.target.value))}
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
              </Paper>
            </Grid>

            {/* Columna Derecha (Resumen) */}
            <Grid item sx={{ width: "40%" }}>
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
                <Typography variant="body2" color="text.primary">
                  <strong>Usuarios:</strong> {selectedUserRange(users)}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  <strong>Módulos:</strong> {selectedModules.length}
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                  <strong>Órdenes/Facturas:</strong>{" "}
                  {selectedOrderRange(orders)}
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
                <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                  <strong>Horas estimadas:</strong> {estimatedHours} horas
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{}}>
                  *Costo estimado. Puede variar según requisitos específicos.
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  *Horas estimadas. Pueden variar según requisitos específicos.
                </Typography>

                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel id="hours-model-label" color="primary">
                    Modelo de Horas
                  </InputLabel>
                  <Select
                    labelId="hours-model-label"
                    value={hoursModel}
                    label="Modelo de Horas"
                    onChange={(e) => setHoursModel(e.target.value)}
                    color="primary"
                  >
                    <MenuItem value="max">Máximo entre factores</MenuItem>
                    <MenuItem value="sum">Suma de incrementos</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button variant="contained" color="primary" fullWidth>
                    Enviar cotización
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

/** Helpers: para obtener la etiqueta de los rangos seleccionados */
function selectedUserRange(users) {
  return userRanges.find((range) => range.value === users)?.label || "";
}
function selectedOrderRange(orders) {
  return orderRanges.find((range) => range.value === orders)?.label || "";
}

/** Modelo 1: Tomar el máximo entre los 3 factores */
function calculateHoursMax(modulesCount, users, orders) {
  let hoursModules = 25;
  if (modulesCount === 0) hoursModules = 25;
  else if (modulesCount >= 1 && modulesCount <= 2) hoursModules = 30;
  else if (modulesCount >= 3 && modulesCount <= 4) hoursModules = 45;
  else if (modulesCount >= 5 && modulesCount <= 6) hoursModules = 60;
  else if (modulesCount >= 7 && modulesCount <= 8) hoursModules = 80;
  else if (modulesCount >= 9) hoursModules = 100;

  let hoursUsers = 25;
  if (users === 1) hoursUsers = 25;
  else if (users >= 2 && users <= 5) hoursUsers = 30;
  else if (users >= 6 && users <= 10) hoursUsers = 45;
  else if (users >= 11 && users <= 20) hoursUsers = 60;
  else if (users >= 21 && users <= 50) hoursUsers = 80;
  else if (users >= 51) hoursUsers = 100;

  let hoursOrders = 25;
  if (orders <= 50) hoursOrders = 25;
  else if (orders > 50 && orders <= 100) hoursOrders = 30;
  else if (orders > 100 && orders <= 200) hoursOrders = 45;
  else if (orders > 200 && orders <= 350) hoursOrders = 60;
  else if (orders > 350) hoursOrders = 100;

  return Math.max(hoursModules, hoursUsers, hoursOrders);
}

/** Modelo 2: Sumar incrementos */
function calculateHoursSum(modulesCount, users, orders) {
  let hours = 25; // base
  if (modulesCount >= 1 && modulesCount <= 2) hours += 5;
  else if (modulesCount >= 3 && modulesCount <= 4) hours += 20;
  else if (modulesCount >= 5 && modulesCount <= 6) hours += 35;
  else if (modulesCount >= 7 && modulesCount <= 8) hours += 55;
  else if (modulesCount >= 9) hours += 75;
  if (users > 1) hours += 10;
  if (orders > 50 && orders <= 100) hours += 10;
  else if (orders > 100 && orders <= 200) hours += 20;
  else if (orders > 200 && orders <= 350) hours += 35;
  else if (orders > 350) hours += 50;
  return hours;
}

/** Función para dividir un array en "chunks" de tamaño fijo */
function chunkArray(array, size) {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
}
