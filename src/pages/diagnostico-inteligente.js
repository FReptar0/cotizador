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
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import jsPDF from "jspdf";

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
        condiciones: `💰 Costo: $X USD + IVA\n📆 Entrega: 90 días hábiles\n💳 Pago: 50% inicio / 50% entrega\n🏢 Pagos: Consultoría a TERSOFT / Licencias a Odoo`,
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

    const addSection = (title, content, y) => {
      doc.setFontSize(12);
      doc.text(title, 20, y);
      doc.setFontSize(11);
      doc.text(doc.splitTextToSize(content, 170), 20, y + 8);
      return y + 8 + doc.getTextDimensions(content).h + 10;
    };

    let y = 30;
    y = addSection("1. Procesos Actuales Identificados", resultado.procesos, y);
    y = addSection("2. Objetivos del Proyecto", resultado.objetivos, y);
    y = addSection("3. Alcance del Proyecto", resultado.alcance, y);
    y = addSection("4. Fuera del Alcance", resultado.fueraAlcance, y);
    y = addSection("5. Entregables del Proyecto", resultado.entregables, y);
    y = addSection("6. Método de Implementación", resultado.metodo, y);
    y = addSection("7. Condiciones Comerciales", resultado.condiciones, y);

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
            <Typography variant="body1" color="text.primary" sx={{ mb: 3 }}>
              Responde algunas preguntas sobre tu negocio. Usaremos esta
              información para definir el alcance ideal de tu implementación
              Odoo.
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <TextField
              label="Nombre de la empresa"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
            <TextField
              label="¿A qué se dedica tu empresa? (Giro del negocio)"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              value={giro}
              onChange={(e) => setGiro(e.target.value)}
            />
            <TextField
              label="¿Cuántas personas trabajan en tu empresa?"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
              type="number"
              value={empleados}
              onChange={(e) => setEmpleados(e.target.value)}
            />
            <TextField
              label="¿Cómo gestionan actualmente sus procesos administrativos o financieros?"
              fullWidth
              multiline
              minRows={3}
              variant="outlined"
              sx={{ mb: 2 }}
              value={procesos}
              onChange={(e) => setProcesos(e.target.value)}
            />
            <TextField
              label="¿Qué problemas o limitaciones enfrentan hoy en día?"
              fullWidth
              multiline
              minRows={3}
              variant="outlined"
              sx={{ mb: 2 }}
              value={problemas}
              onChange={(e) => setProblemas(e.target.value)}
            />
            <TextField
              label="¿Qué te gustaría lograr al implementar un sistema como Odoo?"
              fullWidth
              multiline
              minRows={3}
              variant="outlined"
              sx={{ mb: 2 }}
              value={objetivos}
              onChange={(e) => setObjetivos(e.target.value)}
            />
            <TextField
              label="¿Cómo captan y atienden a sus clientes?"
              fullWidth
              multiline
              minRows={2}
              variant="outlined"
              sx={{ mb: 2 }}
              value={clientes}
              onChange={(e) => setClientes(e.target.value)}
            />
            <TextField
              label="¿Qué productos o servicios ofrecen y cómo los venden?"
              fullWidth
              multiline
              minRows={2}
              variant="outlined"
              sx={{ mb: 2 }}
              value={productos}
              onChange={(e) => setProductos(e.target.value)}
            />
            <TextField
              label="¿Cómo llevan el control de sus ventas y facturación?"
              fullWidth
              multiline
              minRows={2}
              variant="outlined"
              sx={{ mb: 2 }}
              value={ventas}
              onChange={(e) => setVentas(e.target.value)}
            />
            <TextField
              label="¿Cómo gestionan la entrega de productos o servicios (logística)?"
              fullWidth
              multiline
              minRows={2}
              variant="outlined"
              sx={{ mb: 2 }}
              value={logistica}
              onChange={(e) => setLogistica(e.target.value)}
            />
            <TextField
              label="¿Cuentan con personal de tecnología o alguien que administre sistemas actualmente?"
              fullWidth
              multiline
              minRows={2}
              variant="outlined"
              sx={{ mb: 3 }}
              value={equipoTI}
              onChange={(e) => setEquipoTI(e.target.value)}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerarDiagnostico}
              disabled={loading}
            >
              {loading
                ? "Generando propuesta..."
                : "GENERAR PROPUESTA DE ALCANCE"}
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
                    ([key, val]) => `${key.toUpperCase()}\n${val}\n\n`
                  )}
                </Typography>
                <Button variant="outlined" onClick={generarPDF}>
                  Descargar propuesta en PDF
                </Button>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
