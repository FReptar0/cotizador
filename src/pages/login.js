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
  Divider,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#337ab7", contrastText: "#ffffff" },
    secondary: { main: "#343b40" },
    background: { default: "#ffffff" },
    text: { primary: "#212528" },
    success: { main: "#388e3c" },
  },
});

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Si ya está autenticado, redirige a cotizador
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/cotizador");
    }
  }, [status, router]);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Iniciar Sesión | Tersoft.mx</title>
        <link rel="icon" href="/Tersoft.webp" />
        <meta name="description" content="Página de Login para Cotizador" />
      </Head>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{ p: { xs: 3, md: 5 }, borderRadius: 2, textAlign: "center" }}
          >
            {/* Logo Tersoft */}
            <Box sx={{ mb: 2 }}>
              <img
                src="/Tersoft.webp"
                alt="Tersoft Logo"
                style={{ height: 256, objectFit: "contain" }}
              />
            </Box>

            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              color="text.primary"
            >
              Inicia sesión con Google
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {status === "loading" ? (
              <Typography>Cargando sesión...</Typography>
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => signIn("google")}
              >
                Iniciar sesión con Google
              </Button>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
