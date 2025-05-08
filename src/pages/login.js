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
              Inicia sesión
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {status === "loading" ? (
              <Typography>Cargando sesión...</Typography>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => signIn("google")}
                startIcon={
                  <Box
                    component="img"
                    src="/google-logo.svg"
                    alt="G"
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
                }}
              >
                Continuar con Google
              </Button>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
