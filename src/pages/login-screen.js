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
import PersonIcon from "@mui/icons-material/Person";

const theme = createTheme({
  palette: {
    primary: { main: "#337ab7", contrastText: "#ffffff" },
    secondary: { main: "#343b40" },
    background: { default: "#ffffff" },
    text: { primary: "#212528" },
    success: { main: "#388e3c" },
  },
});

export default function LoginScreen() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/cotizador");
    } else if (
      typeof window !== "undefined" &&
      localStorage.getItem("guestUser") === "true"
    ) {
      router.replace("/cotizador");
    }
  }, [status, router]);

  const handleGuest = () => {
    // Simular sesión de invitado
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("guestUser", "true");
    router.replace("/cotizador");
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Iniciar Sesión | Tersoft.mx</title>
        <link rel="icon" href="/Tersoft.webp" />
        <meta name="description" content="Página de Login para Cotizador" />
      </Head>
      {/* No Navbar ni Footer aquí, solo el contenido de login */}
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
              <>
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
                    mb: 2,
                  }}
                >
                  Continuar con Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleGuest}
                  startIcon={
                    <Box
                      component="span"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="8"
                          r="4"
                          stroke="#555"
                          strokeWidth="2"
                        />
                        <path
                          d="M4 20c0-4 4-6 8-6s8 2 8 6"
                          stroke="#555"
                          strokeWidth="2"
                        />
                      </svg>
                    </Box>
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
                  Acceder como invitado
                </Button>
              </>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
