// pages/login.js
import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import { Inter } from "next/font/google";
import {
  Container,
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  Stack,
} from "@mui/material";
import {
  Bolt as BoltIcon,
  FactCheck as FactCheckIcon,
  Tune as TuneIcon,
  SupportAgent as SupportAgentIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Savings as SavingsIcon,
  Shield as ShieldIcon,
  Devices as DevicesIcon,
  AccountTree as AccountTreeIcon,
  Verified as VerifiedIcon,
  RocketLaunch as RocketLaunchIcon,
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowForward as ArrowForwardIcon,
  NorthEast as NorthEastIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// Paleta de marca
const BRAND = "#337ab7";
const INK = "#0c1f31";
const SURFACE = "#f6f8fa";
const BORDER = "#e4e9ee";

// Ancho del Container "lg" de MUI, para alinear el hero con el resto de la página
const CONTENT_EDGE = "max(40px, calc((100vw - 1200px) / 2 + 24px))";

const theme = createTheme({
  palette: {
    primary: { main: BRAND, dark: "#245a89", light: "#5b9bd5", contrastText: "#ffffff" },
    secondary: { main: "#343b40" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#111c26", secondary: "#5b6b7b" },
    divider: BORDER,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: `${inter.style.fontFamily}, system-ui, -apple-system, "Segoe UI", sans-serif`,
    h1: { fontWeight: 800, letterSpacing: "-0.032em", lineHeight: 1.06 },
    h2: { fontWeight: 800, letterSpacing: "-0.028em", lineHeight: 1.15 },
    h3: { fontWeight: 700, letterSpacing: "-0.022em", lineHeight: 1.2 },
    h4: { fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 },
    h5: { fontWeight: 700, letterSpacing: "-0.015em" },
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
    subtitle1: { lineHeight: 1.65 },
    body1: { lineHeight: 1.72 },
    body2: { lineHeight: 1.68 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10 } },
    },
  },
});

const FEATURES = [
  { Icon: BoltIcon, title: "Rápido", desc: "Recibe cotizaciones en segundos." },
  {
    Icon: FactCheckIcon,
    title: "Preciso",
    desc: "Estimaciones confiables y detalladas.",
  },
  {
    Icon: TuneIcon,
    title: "Personalizable",
    desc: "Adapta la cotización a las necesidades de tu empresa.",
  },
  {
    Icon: SupportAgentIcon,
    title: "Soporte experto",
    desc: "Acompañamiento de consultores certificados.",
  },
  {
    Icon: PictureAsPdfIcon,
    title: "Descarga inmediata",
    desc: "Obtén tu propuesta en PDF al instante.",
  },
  {
    Icon: SavingsIcon,
    title: "Sin costo",
    desc: "Cotiza gratis y sin compromiso.",
  },
  {
    Icon: ShieldIcon,
    title: "Privacidad total",
    desc: "Tus datos no se comparten con terceros.",
  },
  {
    Icon: DevicesIcon,
    title: "Accesible",
    desc: "Disponible 24/7 desde cualquier dispositivo.",
  },
];

const SERVICIOS = [
  {
    Icon: AccountTreeIcon,
    title: "Integración ERP",
    desc: "Implementamos y adaptamos Odoo a tus procesos.",
  },
  {
    Icon: VerifiedIcon,
    title: "Consultoría Certificada",
    desc: "Equipo oficial Odoo y Sage 300 a tu servicio.",
  },
  {
    Icon: SupportAgentIcon,
    title: "Soporte 24/7",
    desc: "Atención continua para mantener tu negocio activo.",
  },
  {
    Icon: RocketLaunchIcon,
    title: "Entrega Ágil",
    desc: "Metodología ágil para despliegues rápidos y eficientes.",
  },
  {
    Icon: TrendingUpIcon,
    title: "ROI Garantizado",
    desc: "Estrategias enfocadas en maximizar tu inversión.",
  },
  {
    Icon: GroupsIcon,
    title: "Comunidad Activa",
    desc: "Más de 500 usuarios satisfechos en México.",
  },
];

const METRICAS = [
  { valor: "+100", label: "proyectos entregados" },
  { valor: "30", label: "consultores certificados" },
  { valor: "24/7", label: "soporte disponible" },
];

const FAQS = [
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
];

// Etiqueta pequeña que encabeza cada sección
function Eyebrow({ children, light = false }) {
  return (
    <Typography
      component="p"
      sx={{
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: light ? "rgba(255,255,255,0.72)" : BRAND,
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  );
}

export default function LandingLoginPage() {
  const { status } = useSession();
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

      <Box
        className={inter.className}
        sx={{ bgcolor: "background.default", color: "text.primary" }}
      >
        {/* ───────────────────────── HEADER ───────────────────────── */}
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1100,
            bgcolor: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              height: { xs: 64, md: 74 },
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              component="img"
              src="/Tersoft.webp"
              alt="Tersoft"
              sx={{ height: { xs: 34, md: 42 }, width: "auto" }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: 14.5, md: 16 },
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Cotizador Odoo
              </Typography>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  display: { xs: "none", sm: "block" },
                }}
              >
                por Tersoft MX
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              href="https://tersoft.mx"
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<NorthEastIcon sx={{ fontSize: 16 }} />}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                color: "text.secondary",
                fontWeight: 600,
                "&:hover": { color: "text.primary", bgcolor: "transparent" },
              }}
            >
              tersoft.mx
            </Button>
            <Button
              variant="contained"
              onClick={handleGoogle}
              sx={{ px: { xs: 2, md: 2.75 }, py: 1, fontSize: { xs: 14, md: 15 } }}
            >
              Cotizar ahora
            </Button>
          </Container>
        </Box>

        {/* ───────────────────────── HERO ───────────────────────── */}
        <Box
          component="section"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.02fr 1fr" },
            alignItems: "stretch",
          }}
        >
          {/* Imagen — arriba en móvil, a la derecha en escritorio */}
          <Box
            sx={{
              order: { xs: 1, md: 2 },
              position: "relative",
              minHeight: { xs: 240, sm: 320, md: "auto" },
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src="/odoo-hero.jpeg"
              alt="Consultores de Tersoft en sesión de trabajo con un cliente"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: { xs: "62% 30%", md: "70% center" },
              }}
            />
            {/* Fundido hacia el panel de texto, para que la unión no se vea cortada */}
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                inset: 0,
                background: {
                  xs: `linear-gradient(to bottom, rgba(12,31,49,0.28) 0%, rgba(12,31,49,0) 45%)`,
                  md: `linear-gradient(to right, ${INK} 0%, rgba(12,31,49,0) 18%)`,
                },
              }}
            />
          </Box>

          {/* Contenido */}
          <Box
            sx={{
              order: { xs: 2, md: 1 },
              background: `linear-gradient(155deg, #0b1d2e 0%, #143b5e 62%, #1a5183 100%)`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              py: { xs: 6, sm: 7, md: 11 },
              pl: { xs: 3, sm: 5, md: 7, lg: CONTENT_EDGE },
              pr: { xs: 3, sm: 5, md: 7 },
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 600 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  display: "inline-flex",
                  px: 1.75,
                  py: 0.75,
                  mb: 3,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: "#4ade80",
                  }}
                />
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  Partner oficial de Odoo · +10 años de trayectoria
                </Typography>
              </Stack>

              <Typography
                variant="h1"
                sx={{ fontSize: { xs: 36, sm: 46, md: 52, lg: 58 }, mb: 2.5 }}
              >
                Cotiza tú mismo tu proyecto de Odoo
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: 16.5, md: 18 },
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.82)",
                  mb: 4,
                  maxWidth: 500,
                }}
              >
                Desarrollado por Tersoft MX para estimar alcance, tiempos y
                costos.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.75}
                sx={{ mb: 3 }}
              >
                <Button
                  onClick={handleGoogle}
                  startIcon={
                    <Box
                      component="img"
                      src="/google-logo.svg"
                      alt=""
                      sx={{ width: 20, height: 20 }}
                    />
                  }
                  sx={{
                    bgcolor: "#fff",
                    color: "#1f2a37",
                    px: 3,
                    py: 1.5,
                    fontSize: 15.5,
                    fontWeight: 700,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
                    "&:hover": { bgcolor: "#f2f5f8" },
                  }}
                >
                  Quiero cotizar ahora
                </Button>
                <Button
                  onClick={handleGuest}
                  startIcon={<PeopleIcon sx={{ fontSize: 20 }} />}
                  sx={{
                    color: "#fff",
                    px: 3,
                    py: 1.5,
                    fontSize: 15.5,
                    fontWeight: 600,
                    border: "1px solid rgba(255,255,255,0.34)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.09)",
                      borderColor: "rgba(255,255,255,0.55)",
                    },
                  }}
                >
                  Entrar como invitado
                </Button>
              </Stack>

              <Typography
                sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.72)", mb: 5 }}
              >
                Sin costo y sin compromiso. Tu propuesta en PDF al instante.
              </Typography>

              <Stack
                direction="row"
                sx={{
                  pt: 3.5,
                  borderTop: "1px solid rgba(255,255,255,0.14)",
                  gap: { xs: 3, sm: 5 },
                  flexWrap: "wrap",
                }}
              >
                {METRICAS.map((m) => (
                  <Box key={m.label}>
                    <Typography
                      sx={{
                        fontSize: { xs: 24, md: 28 },
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                      }}
                    >
                      {m.valor}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.62)",
                        mt: 0.25,
                      }}
                    >
                      {m.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* ─────────────── CARACTERÍSTICAS DEL COTIZADOR ─────────────── */}
        <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: 720, mb: { xs: 5, md: 7 } }}>
              <Eyebrow>El cotizador</Eyebrow>
              <Typography variant="h2" sx={{ fontSize: { xs: 30, md: 40 }, mb: 2 }}>
                Características principales del cotizador
              </Typography>
              <Typography sx={{ fontSize: 17, color: "text.secondary" }}>
                Todo lo que necesitas para dimensionar tu proyecto de Odoo y
                salir con una propuesta en la mano.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: { xs: 2, md: 2.5 },
              }}
            >
              {FEATURES.map(({ Icon, title, desc }) => (
                <Box
                  key={title}
                  sx={{
                    p: 3,
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "#fff",
                    transition:
                      "border-color .18s ease, box-shadow .18s ease, transform .18s ease",
                    "&:hover": {
                      borderColor: "rgba(51,122,183,0.42)",
                      boxShadow: "0 10px 30px rgba(16,42,67,0.08)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(51,122,183,0.10)",
                      mb: 2.25,
                    }}
                  >
                    <Icon sx={{ fontSize: 23, color: BRAND }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontSize: 17, mb: 0.75 }}>
                    {title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 14.5, color: "text.secondary", lineHeight: 1.6 }}
                  >
                    {desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ─────────────── CÓMO USAR EL COTIZADOR (VIDEO) ─────────────── */}
        <Box
          component="section"
          sx={{
            py: { xs: 8, md: 12 },
            bgcolor: SURFACE,
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center", maxWidth: 660, mx: "auto", mb: { xs: 4, md: 6 } }}>
              <Eyebrow>Guía rápida</Eyebrow>
              <Typography variant="h2" sx={{ fontSize: { xs: 30, md: 40 }, mb: 2 }}>
                Cómo usar el cotizador de Tersoft
              </Typography>
              <Typography sx={{ fontSize: 17, color: "text.secondary" }}>
                En este breve video te mostramos cómo navegar por el cotizador,
                elegir módulos y descargar tu propuesta en PDF en solo unos
                clics.
              </Typography>
            </Box>

            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                mx: "auto",
                maxWidth: 880,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 24px 60px rgba(16,42,67,0.12)",
              }}
            >
              <Box sx={{ position: "relative", pt: "56.25%" /* 16:9 */ }}>
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
                    display: "block",
                  }}
                />
              </Box>
            </Card>
          </Container>
        </Box>

        {/* ───────────────────────── QUIÉNES SOMOS ───────────────────────── */}
        <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: { xs: 4, md: 8 },
                alignItems: "start",
                mb: { xs: 6, md: 9 },
              }}
            >
              <Box>
                <Eyebrow>Tersoft MX</Eyebrow>
                <Typography
                  variant="h2"
                  sx={{ fontSize: { xs: 30, md: 40 }, mb: { xs: 3, md: 4 } }}
                >
                  ¿Quiénes somos?
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    "Partner oficial de Odoo",
                    "Expertos en Sage 300",
                    "Soluciones ERP a la medida",
                  ].map((c) => (
                    <Stack
                      key={c}
                      direction="row"
                      spacing={1.25}
                      alignItems="center"
                    >
                      <CheckCircleIcon sx={{ fontSize: 19, color: BRAND }} />
                      <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                        {c}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 16.5, color: "text.secondary", mb: 2.5 }}>
                  En <strong style={{ color: "#111c26" }}>Tersoft MX</strong>{" "}
                  somos partner oficial de Odoo con más de 10 años de
                  trayectoria, y expertos en Sage 300 y soluciones ERP a la
                  medida.
                </Typography>
                <Typography sx={{ fontSize: 16.5, color: "text.secondary", mb: 2.5 }}>
                  Hemos entregado más de{" "}
                  <strong style={{ color: "#111c26" }}>100 proyectos</strong>{" "}
                  exitosos, contamos con un equipo de{" "}
                  <strong style={{ color: "#111c26" }}>
                    30 consultores certificados
                  </strong>{" "}
                  y brindamos soporte{" "}
                  <strong style={{ color: "#111c26" }}>24/7</strong> para que tu
                  operación nunca se detenga.
                </Typography>
                <Typography sx={{ fontSize: 16.5, color: "text.secondary", mb: 3.5 }}>
                  Nuestra misión es impulsar la transformación digital de las
                  empresas, optimizar procesos y maximizar el retorno de
                  inversión (ROI).
                </Typography>
                <Button
                  href="https://tersoft.mx"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  endIcon={<NorthEastIcon sx={{ fontSize: 17 }} />}
                  sx={{
                    px: 2.5,
                    py: 1.15,
                    fontSize: 15,
                    borderColor: "divider",
                    color: "text.primary",
                    "&:hover": {
                      borderColor: BRAND,
                      bgcolor: "rgba(51,122,183,0.05)",
                    },
                  }}
                >
                  Visita tersoft.mx
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: { xs: 3, md: 4 },
              }}
            >
              {SERVICIOS.map(({ Icon, title, desc }) => (
                <Box
                  key={title}
                  sx={{
                    pt: 3,
                    borderTop: "2px solid",
                    borderColor: "rgba(51,122,183,0.22)",
                  }}
                >
                  <Icon sx={{ fontSize: 26, color: BRAND, mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontSize: 17.5, mb: 0.75 }}>
                    {title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 15, color: "text.secondary", lineHeight: 1.65 }}
                  >
                    {desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ───────────────────── PREGUNTAS FRECUENTES ───────────────────── */}
        <Box
          component="section"
          sx={{
            py: { xs: 8, md: 12 },
            bgcolor: SURFACE,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
              <Eyebrow>Dudas</Eyebrow>
              <Typography variant="h2" sx={{ fontSize: { xs: 30, md: 40 } }}>
                Preguntas Frecuentes
              </Typography>
            </Box>

            <Box>
              {FAQS.map((item) => (
                <Accordion
                  key={item.q}
                  disableGutters
                  elevation={0}
                  square={false}
                  sx={{
                    mb: 1.5,
                    borderRadius: "12px !important",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "#fff",
                    overflow: "hidden",
                    "&:before": { display: "none" },
                    "&.Mui-expanded": { borderColor: "rgba(51,122,183,0.38)" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: BRAND }} />}
                    sx={{
                      px: { xs: 2.25, md: 3 },
                      py: 1,
                      "& .MuiAccordionSummary-content": { my: 1.75 },
                    }}
                  >
                    <Typography sx={{ fontSize: 16.5, fontWeight: 600, pr: 2 }}>
                      {item.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: { xs: 2.25, md: 3 }, pt: 0, pb: 3 }}>
                    <Typography
                      sx={{ fontSize: 15.5, color: "text.secondary", lineHeight: 1.7 }}
                    >
                      {item.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ───────────────────────── CTA FINAL ───────────────────────── */}
        <Box
          component="section"
          sx={{
            py: { xs: 8, md: 11 },
            background: `linear-gradient(135deg, #0b1d2e 0%, #143b5e 60%, #1a5183 100%)`,
            color: "#fff",
            textAlign: "center",
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h2"
              sx={{ fontSize: { xs: 28, md: 38 }, mb: 2 }}
            >
              Empodera tu negocio con información clara y profesional
            </Typography>
            <Typography
              sx={{
                fontSize: 17,
                color: "rgba(255,255,255,0.78)",
                mb: 4.5,
                maxWidth: 560,
                mx: "auto",
              }}
            >
              Arma tu cotización de Odoo en minutos y descarga la propuesta en
              PDF. Sin costo y sin compromiso.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.75}
              justifyContent="center"
            >
              <Button
                onClick={handleGoogle}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#fff",
                  color: "#1f2a37",
                  px: 3.5,
                  py: 1.6,
                  fontSize: 16,
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#f2f5f8" },
                }}
              >
                Quiero cotizar ahora
              </Button>
              <Button
                onClick={handleGuest}
                startIcon={<PeopleIcon />}
                sx={{
                  color: "#fff",
                  px: 3.5,
                  py: 1.6,
                  fontSize: 16,
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.34)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.09)",
                    borderColor: "rgba(255,255,255,0.55)",
                  },
                }}
              >
                Entrar como invitado
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* ───────────────────────── FOOTER ───────────────────────── */}
        <Box component="footer" sx={{ bgcolor: "#0a1723", color: "#fff" }}>
          <Container maxWidth="lg" sx={{ py: { xs: 5, md: 6 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography sx={{ fontSize: 17, fontWeight: 700, mb: 0.5 }}>
                  Tersoft MX
                </Typography>
                <Typography
                  sx={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}
                >
                  Partner oficial de Odoo · Expertos en Sage 300 y ERP a la
                  medida.
                </Typography>
              </Box>
              <Button
                href="https://tersoft.mx"
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<NorthEastIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: "#fff",
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.24)",
                  px: 2.25,
                  py: 0.9,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.45)",
                  },
                }}
              >
                tersoft.mx
              </Button>
            </Stack>

            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)" }}
              >
                © {new Date().getFullYear()} Tersoft MX. Todos los derechos
                reservados.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
