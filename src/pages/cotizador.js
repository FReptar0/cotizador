import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
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

// Lista de módulos (sin precios individuales)
const odooModules = [
  { name: "CRM" },
  { name: "Ventas" },
  { name: "Compras" },
  { name: "Inventario" },
  { name: "Contabilidad" },
  { name: "Facturación" },
  { name: "Manufactura" },
  { name: "Proyectos" },
  { name: "Recursos Humanos" },
  { name: "Sitio Web" },
  { name: "eCommerce" },
  { name: "Punto de Venta" },
  { name: "Marketing" },
  { name: "Email Marketing" },
  { name: "Helpdesk" },
  { name: "Suscripciones" },
  { name: "Mantenimiento" },
  { name: "Gestión de Almacenes" },
  { name: "Eventos" },
  { name: "Field Service" },
  { name: "Gestión de Gastos" },
  { name: "Calidad" },
  { name: "Planificación de la Producción" },
];

const userRanges = [
  { label: "1-5 usuarios", value: 5 },
  { label: "6-10 usuarios", value: 10 },
  { label: "11-20 usuarios", value: 20 },
  { label: "21-50 usuarios", value: 50 },
  { label: "51-100 usuarios", value: 100 },
  { label: "Más de 100 usuarios", value: 150 },
];

export default function CotizadorPage() {
  const router = useRouter();

  // 1) Estado para controlar si ya verificamos el login
  const [authChecked, setAuthChecked] = useState(false);

  // 2) Estados del cotizador
  const [users, setUsers] = useState(5);
  const [selectedModules, setSelectedModules] = useState([]);
  const [orders, setOrders] = useState(0);
  const [quote, setQuote] = useState(17000); // Precio base inicial

  // 3) useEffect para checar login SIEMPRE, sin condicionales que alteren el orden de hooks
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      // Redirigimos sin renderizar nada del cotizador
      router.replace("/login");
    } else {
      // Marcamos que ya validamos y está logueado
      setAuthChecked(true);
    }
  }, [router]);

  // 4) useEffect para calcular el costo, pero solo si ya está authChecked
  useEffect(() => {
    if (!authChecked) return; // Si no está verificado el login, no calculamos
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

    const total = modulePrice + users * 50 + orders * 0.5;
    setQuote(total.toFixed(2));
  }, [authChecked, users, selectedModules, orders]);

  // 5) Si no está verificado el login, no renderizamos nada (evitamos "parpadeo")
  if (!authChecked) {
    return null;
  }

  // 6) Ahora sí renderizamos el cotizador
  const handleModuleChange = (moduleName) => {
    setSelectedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((m) => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Estimador de Proyecto | Tersoft.mx</title>
        <meta
          name="description"
          content="Estimador de costos empresarial para Odoo y Sage 300"
        />
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

      {/* Bloque del costo del proyecto fuera del container principal */}
      <Box
        sx={{ bgcolor: "#f8f9fa", borderBottom: "1px solid #dee2e6", py: 2 }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="text.primary"
              sx={{ mr: 2 }}
            >
              Costo del proyecto:
            </Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              MX${quote}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Contenedor principal del formulario */}
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          py: 5,
          position: "relative",
        }}
      >
        <Container maxWidth="md">
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
              usuarios clave, importación de sus datos y la personalización de
              sus flujos de negocios.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Sección: Tamaño de la empresa */}
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

            {/* Sección: Órdenes/Facturas */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ mb: 1 }}
                color="text.primary"
              >
                Cantidad de Órdenes/Facturas mensuales
              </Typography>
              <TextField
                type="number"
                label="Cantidad"
                value={orders}
                onChange={(e) => setOrders(parseInt(e.target.value))}
                fullWidth
                inputProps={{ min: 0 }}
                color="primary"
              />
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
