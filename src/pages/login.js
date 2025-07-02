// pages/login.js
import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
} from "@mui/material";
import {
  Speed as SpeedIcon,
  AttachMoney as AttachMoneyIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Handshake as HandshakeIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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

  // Botón de invitado: crea una sesión fake en localStorage y redirige
  const handleGuest = () => {
    // Guardar bandera de invitado
    if (typeof window !== "undefined") {
      localStorage.setItem("isGuest", "true");
    }
    router.replace("/cotizador");
  };

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
              Cotiza tú mismo tu proyecto de Odoo
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
            <Container
              maxWidth="md"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
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
                  mb: 2, // Espacio entre botones
                  display: "block",
                }}
              >
                Quiero cotizar ahora
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGuest}
                startIcon={
                  <PeopleIcon sx={{ color: "#337ab7", fontSize: 24 }} />
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
                  mt: 0, // sin margen superior extra
                  display: "block",
                }}
              >
                Quiero cotizar ahora (Invitado)
              </Button>
            </Container>
          </Container>
        </Box>

        {/* CARACTERÍSTICAS DEL COTIZADOR - 2 FILAS DE 4 COLUMNAS */}
        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Typography
            variant="h4"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: 700 }}
          >
            Características principales del cotizador
          </Typography>

          <Grid
            container
            sx={{
              mt: 4,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)", // 4 columnas fijas en md+
              },
              gap: 6, // igual a spacing={6}
              justifyItems: "center",
            }}
          >
            {[
              {
                icon: (
                  <SpeedIcon
                    sx={{
                      color: "#ff5a5f",
                      fontSize: 48,
                      bgcolor: "#ffeaea",
                      borderRadius: 2,
                      p: 1.5,
                      mb: 2,
                    }}
                  />
                ),
                title: "Rápido",
                desc: "Recibe cotizaciones en segundos.",
              },
              {
                icon: (
                  <AttachMoneyIcon
                    sx={{
                      color: "#4f8cff",
                      fontSize: 48,
                      bgcolor: "#eaf1ff",
                      borderRadius: 2,
                      p: 1.5,
                      mb: 2,
                    }}
                  />
                ),
                title: "Preciso",
                desc: "Estimaciones confiables y detalladas.",
              },
              {
                icon: (
                  <BusinessIcon
                    sx={{
                      color: "#fdcb6e",
                      fontSize: 48,
                      bgcolor: "#fff7e6",
                      borderRadius: 2,
                      p: 1.5,
                      mb: 2,
                    }}
                  />
                ),
                title: "Personalizable",
                desc: "Adapta la cotización a las necesidades de tu empresa.",
              },
              {
                icon: (
                  <HandshakeIcon
                    sx={{
                      color: "#00b0ff",
                      fontSize: 48,
                      bgcolor: "#e6f7ff",
                      borderRadius: 2,
                      p: 1.5,
                      mb: 2,
                    }}
                  />
                ),
                title: "Soporte experto",
                desc: "Acompañamiento de consultores certificados.",
              },
              {
                icon: (
                  <SpeedIcon
                    sx={{
                      color: "#6c5ce7",
                      fontSize: 48,
                      bgcolor: "#f0eaff",
                      borderRadius: 2,
                      p: 1.5,
                      mb: 2,
                    }}
                  />
                ),
                title: "Descarga inmediata",
                desc: "Obtén tu propuesta en PDF al instante.",
              },
              {
                icon: (
                  <AttachMoneyIcon
                    sx={{
                      color: "#00b894",
                      fontSize: 48,
                      bgcolor: "#eafff6",
                      borderRadius: 2,
                      p: 1.5,
                      mb: 2,
                    }}
                  />
                ),
                title: "Sin costo",
                desc: "Cotiza gratis y sin compromiso.",
              },
              {
                icon: (
                  <SecurityIcon
                    sx={{
                      color: "#fd79a8",
                      fontSize: 48,
                      bgcolor: "#ffeaf6",
                      borderRadius: 2,
                      p: 1.5,
                      mb: 2,
                    }}
                  />
                ),
                title: "Privacidad total",
                desc: "Tus datos no se comparten con terceros.",
              },
              {
                icon: (
                  <PeopleIcon
                    sx={{
                      color: "#0984e3",
                      fontSize: 48,
                      bgcolor: "#eaf4ff",
                      borderRadius: 2,
                      p: 1.5,
                      mb: 2,
                    }}
                  />
                ),
                title: "Accesible",
                desc: "Disponible 24/7 desde cualquier dispositivo.",
              },
            ].map((item, idx) => (
              <Box key={idx} textAlign="center">
                {item.icon}
                <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Container>

        {/* CÓMO USAR EL COTIZADOR - VIDEO */}
        {/* CÓMO USAR EL COTIZADOR - VIDEO */}
        <Box
          component="section"
          sx={{
            py: 10,
            bgcolor: "background.paper",
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "#000000", // título en negro
              }}
            >
              Cómo usar el cotizador de Tersoft
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{
                mb: 4,
                color: "text.secondary",
                maxWidth: 600,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              En este breve video te mostramos cómo navegar por el cotizador,
              elegir módulos y descargar tu propuesta en PDF en solo unos clics.
            </Typography>

            <Card
              elevation={3}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                mx: "auto",
                maxWidth: 800,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  pt: "56.25%" /* 16:9 */,
                }}
              >
                <iframe
                  src="https://www.youtube.com/embed/1aj7u1fogns"
                  title="Cómo usar el cotizador Tersoft"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </Box>
            </Card>
          </Container>
        </Box>

        <Divider />

        {/* NOSOTROS */}
        <Box sx={{ py: 8, bgcolor: "background.paper", textAlign: "center" }}>
          <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
              ¿Quiénes somos?
            </Typography>
            <Typography sx={{ mb: 2 }}>
              En <strong>Tersoft MX</strong> somos partner oficial de Odoo con
              más de 10 años de trayectoria, y expertos en Sage 300 y soluciones
              ERP a la medida.
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Hemos entregado más de <strong>100 proyectos</strong> exitosos,
              contamos con un equipo de{" "}
              <strong>30 consultores certificados</strong> y brindamos soporte{" "}
              <strong>24/7</strong> para que tu operación nunca se detenga.
            </Typography>
            <Typography sx={{ mb: 2 }}>
              Nuestra misión es impulsar la transformación digital de las
              empresas, optimizar procesos y maximizar el retorno de inversión
              (ROI).
            </Typography>
            <Typography sx={{ mb: 4 }}>
              Visita nuestro sitio oficial:{" "}
              <a
                href="https://tersoft.mx"
                target="_blank"
                rel="noopener noreferrer"
              >
                tersoft.mx
              </a>
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              {[
                {
                  icon: <BusinessIcon color="primary" fontSize="large" />,
                  title: "Integración ERP",
                  desc: "Implementamos y adaptamos Odoo a tus procesos.",
                },
                {
                  icon: <HandshakeIcon color="primary" fontSize="large" />,
                  title: "Consultoría Certificada",
                  desc: "Equipo oficial Odoo y Sage 300 a tu servicio.",
                },
                {
                  icon: <SecurityIcon color="primary" fontSize="large" />,
                  title: "Soporte 24/7",
                  desc: "Atención continua para mantener tu negocio activo.",
                },
                {
                  icon: <SpeedIcon color="primary" fontSize="large" />,
                  title: "Entrega Ágil",
                  desc: "Metodología ágil para despliegues rápidos y eficientes.",
                },
                {
                  icon: <AttachMoneyIcon color="primary" fontSize="large" />,
                  title: "ROI Garantizado",
                  desc: "Estrategias enfocadas en maximizar tu inversión.",
                },
                {
                  icon: <PeopleIcon color="primary" fontSize="large" />,
                  title: "Comunidad Activa",
                  desc: "Más de 500 usuarios satisfechos en México.",
                },
              ].map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  {item.icon}
                  <Typography variant="h6" sx={{ mt: 1, mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">{item.desc}</Typography>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* PREGUNTAS FRECUENTES */}
        <Box sx={{ py: 8, bgcolor: "#f9f9fb" }}>
          <Container maxWidth="md">
            <Typography variant="h4" gutterBottom textAlign="center">
              Preguntas Frecuentes
            </Typography>
            <Box sx={{ mt: 4 }}>
              {[
                {
                  q: "¿Qué es Odoo y para qué sirve?",
                  a: "Odoo es un sistema ERP (Enterprise Resource Planning) modular que permite gestionar todas las áreas de una empresa en una sola plataforma: ventas, compras, inventario, contabilidad, recursos humanos y más.",
                },
                {
                  q: "¿Cuánto tiempo tarda la implementación?",
                  a: "No hay un estimado fijo; el tiempo de implementación siempre dependerá de la complejidad de las operaciones de su negocio, de sus necesidades y de los módulos seleccionados.",
                },
                {
                  q: "¿Puedo agregar más módulos después de la implementación inicial?",
                  a: "Sí, Odoo es completamente escalable. Puedes agregar nuevos módulos y funcionalidades en cualquier momento según crezcan tus necesidades.",
                },
                {
                  q: "¿Qué incluye el soporte post-implementación?",
                  a: "Incluye atención a dudas, solución de incidencias, ajustes menores y acompañamiento durante los primeros 15 días después de la puesta en marcha.",
                },
                {
                  q: "¿Cómo se realiza la capacitación a los usuarios?",
                  a: "Ofrecemos sesiones teórico-prácticas en línea, materiales de apoyo y manuales personalizados para tu empresa.",
                },
                {
                  q: "¿Qué formas de pago aceptan?",
                  a: "El pago se realiza por transferencia bancaria. No solicitamos anticipo para la consultoría; solo pagas al finalizar la implementación.",
                },
                {
                  q: "¿Mis datos estarán seguros en Odoo?",
                  a: "Sí, Odoo cuenta con altos estándares de seguridad y respaldos automáticos. Además, Tersoft implementa buenas prácticas para proteger tu información.",
                },
                {
                  q: "¿Puedo migrar información de mi sistema actual a Odoo?",
                  a: "Sí, realizamos migración de datos desde sistemas previos (Excel, otros ERPs, etc.) para que no pierdas tu historial.",
                },
                {
                  q: "¿Qué pasa si necesito una funcionalidad especial?",
                  a: "Desarrollamos personalizaciones a la medida para adaptar Odoo a los procesos específicos de tu empresa.",
                },
                {
                  q: "¿Qué sucede si tengo dudas durante el proceso?",
                  a: "Tendrás un consultor asignado y canales de comunicación directa para resolver cualquier inquietud en todo momento.",
                },
              ].map((item, idx) => (
                <Accordion
                  key={idx}
                  sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}
                >
                  <AccordionSummary
                    expandIcon={
                      <span style={{ fontWeight: 700, fontSize: 22 }}>+</span>
                    }
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">{item.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
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
