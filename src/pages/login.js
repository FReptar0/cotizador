import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Avatar,
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SpeedIcon from "@mui/icons-material/Speed";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import HandshakeIcon from "@mui/icons-material/Handshake";

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: { main: "#337ab7", contrastText: "#ffffff" },
    secondary: { main: "#343b40" },
    background: { default: "#f5f5f5", paper: "#ffffff" },
    text: { primary: "#212528" },
  },
});

export default function LandingLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/cotizador");
    }
  }, [status, router]);

  const handleGoogle = () => signIn("google");

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Cotizador Tersoft | Plataforma de Alcance de Proyectos</title>
        <link rel="icon" href="/Tersoft.webp" />
        <meta
          name="description"
          content="Cotizador desarrollado por Tersoft MX para evaluar alcance, tiempos y costos de proyectos ERP."
        />
      </Head>

      <Box sx={{ bgcolor: "background.default", color: "text.primary" }}>
        {/* HERO */}
        <Box
          sx={{
            height: 500,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            backgroundImage: "url('/odoo-hero.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            color: "#fff",
            px: 2,
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
              }}
            >
              Cotiza tu mismo tu proyecto de Odoo
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                mb: 1,
                textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
              }}
            >
              Desarrollado por Tersoft MX para estimar alcance, tiempos y
              costos.
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                mb: 4,
                textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
              }}
            >
              Empodera tu negocio con información clara y profesional.
            </Typography>
            {/* Botón personalizado */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogle}
              startIcon={
                <Box
                  component="img"
                  src="/google-logo.svg"
                  alt="Google"
                  sx={{ width: 24, height: 24 }}
                />
              }
              sx={{
                textTransform: "none",
                justifyContent: "center",
                fontWeight: "bold",
                borderRadius: 2,
                border: "1px solid #ddd",
                color: "#555",
                backgroundColor: "#fff",
                "&:hover": {
                  backgroundColor: "#f7f7f7",
                  borderColor: "#ccc",
                },
                px: 2,
                py: 1.5,
                fontSize: 16,
                maxWidth: 300,
                mx: "auto",
              }}
            >
              Quiero cotizar ahora
            </Button>
          </Container>
        </Box>

        {/* BENEFICIOS */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={4} justifyContent="center">
            {[
              {
                icon: <SpeedIcon color="primary" />,
                title: "Rápido",
                desc: "Recibe cotizaciones en segundos.",
              },
              {
                icon: <AttachMoneyIcon color="primary" />,
                title: "Preciso",
                desc: "Estimaciones confiables y detalladas.",
              },
              {
                icon: <SecurityIcon color="primary" />,
                title: "Seguro",
                desc: "Tus datos resguardados con privacidad.",
              },
              {
                icon: <PeopleIcon color="primary" />,
                title: "Colaborativo",
                desc: "Comparte resultados con tu equipo.",
              },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Box textAlign="center">
                  {item.icon}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography>{item.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Divider />

        {/* NOSOTROS */}
        <Box sx={{ py: 8, bgcolor: "background.paper", textAlign: "center" }}>
          <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
              ¿Quiénes somos?
            </Typography>
            <Typography sx={{ mb: 2 }}>
              <strong>Tersoft MX</strong> es partner oficial de Odoo con más de
              10 años de colaboración. Además somos expertos en Sage 300 y
              soluciones ERP en la nube.
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Con más de <strong>20 años de experiencia</strong>, hemos apoyado
              a cientos de empresas a optimizar sus procesos y maximizar su ROI.
            </Typography>
            <Typography sx={{ mb: 4 }}>
              Visita nuestro sitio:{" "}
              <a
                href="https://tersoft.mx"
                target="_blank"
                rel="noopener noreferrer"
              >
                tersoft.mx
              </a>
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <BusinessIcon fontSize="large" color="primary" />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Integración ERP
                </Typography>
                <Typography>
                  Conecta módulos y flujos de trabajo sin fisuras.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <HandshakeIcon fontSize="large" color="primary" />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Soporte Certificado
                </Typography>
                <Typography>
                  Consultores certificados Odoo y Sage 300 a tu servicio.
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* FOOTER */}
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            bgcolor: "secondary.main",
            color: "#fff",
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} Tersoft MX. Todos los derechos
            reservados.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
