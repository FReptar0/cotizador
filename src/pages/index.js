import Head from "next/head";
import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Configuración del tema (personaliza los colores según la identidad de tersoft.mx)
const theme = createTheme({
  palette: {
    primary: {
      main: "#0052cc", // Ejemplo: azul corporativo
      contrastText: "#fff",
    },
    secondary: {
      main: "#edf2f8", // Ejemplo: gris claro
    },
  },
});

const odooModules = [
  { name: "CRM", price: 100 },
  { name: "Ventas", price: 110 },
  { name: "Compras", price: 120 },
  { name: "Inventario", price: 90 },
  { name: "Contabilidad", price: 120 },
  { name: "Facturación", price: 100 },
  { name: "Manufactura", price: 150 },
  { name: "Proyectos", price: 130 },
  { name: "Recursos Humanos", price: 140 },
  { name: "Sitio Web", price: 80 },
  { name: "eCommerce", price: 110 },
  { name: "Punto de Venta", price: 100 },
  { name: "Marketing", price: 90 },
  { name: "Email Marketing", price: 85 },
  { name: "Helpdesk", price: 70 },
  { name: "Suscripciones", price: 95 },
  { name: "Mantenimiento", price: 60 },
  { name: "Gestión de Almacenes", price: 100 },
  { name: "Eventos", price: 80 },
  { name: "Field Service", price: 150 },
  { name: "Gestión de Gastos", price: 110 },
  { name: "Calidad", price: 120 },
  { name: "Planificación de la Producción", price: 160 },
];

export default function Home() {
  const [users, setUsers] = useState(1);
  const [selectedModules, setSelectedModules] = useState([]);
  const [orders, setOrders] = useState(0);
  const [quote, setQuote] = useState(null);

  const handleModuleChange = (moduleName) => {
    setSelectedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((m) => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  const calculateQuote = () => {
    // Ejemplo de lógica de cotización
    let total = users * 50; // precio base por usuario
    selectedModules.forEach((mod) => {
      const module = odooModules.find((m) => m.name === mod);
      if (module) total += module.price;
    });
    total += orders * 0.5; // costo adicional por cada orden/factura
    setQuote(total.toFixed(2));
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Cotizador de Odoo & Sage 300 | Tersoft.mx</title>
        <meta
          name="description"
          content="Cotizador en tiempo real para módulos de Odoo"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" component="h1" color="primary">
              Cotizador de Precios
            </Typography>
            <Typography variant="subtitle1">
              Obtén tu cotización en tiempo real para la implementación de Odoo y Sage 300
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Sección de Usuarios */}
          <Box mb={3}>
            <Typography variant="h6" color="primary" gutterBottom>
              Número de Usuarios
            </Typography>
            <TextField
              type="number"
              label="Usuarios"
              value={users}
              onChange={(e) => setUsers(parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 1 }}
              sx={{ mt: 1 }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Sección de Módulos */}
          <Box mb={3}>
            <Typography variant="h6" color="primary" gutterBottom>
              Módulos Disponibles
            </Typography>
            <FormGroup>
              {odooModules.map((module) => (
                <FormControlLabel
                  key={module.name}
                  control={
                    <Checkbox
                      onChange={() => handleModuleChange(module.name)}
                      checked={selectedModules.includes(module.name)}
                    />
                  }
                  label={`${module.name} ($${module.price})`}
                />
              ))}
            </FormGroup>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Sección de Órdenes/Facturas */}
          <Box mb={3}>
            <Typography variant="h6" color="primary" gutterBottom>
              Cantidad de Órdenes/Facturas
            </Typography>
            <TextField
              type="number"
              label="Órdenes/Facturas"
              value={orders}
              onChange={(e) => setOrders(parseInt(e.target.value))}
              fullWidth
              inputProps={{ min: 0 }}
              sx={{ mt: 1 }}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={calculateQuote}
          >
            Calcular Cotización
          </Button>

          {quote !== null && (
            <Box mt={3} textAlign="center">
              <Typography variant="h5" color="secondary">
                Tu Cotización: ${quote}
              </Typography>
            </Box>
          )}
        </Paper>
        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Tersoft.mx. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
