// components/ResponsiveAppBar.js
import * as React from "react";
import { signOut } from "next-auth/react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const pages = [
  { label: "Cotizador", href: "/cotizador" },
  { label: "Diagnóstico Inteligente", href: "/diagnostico-inteligente" },
  {
    label: "Agende una cita",
    action: () =>
      window.open(
        "https://calendly.com/tersoft/primera-sesion-para-conocer-necesidades-de-su-empresa",
        "_blank"
      ),
  },
];
const settings = [
  {
    label: "Cerrar sesión",
    action: async () => {
      localStorage.removeItem("isLoggedIn");
      await signOut({ callbackUrl: "/login" });
    },
  },
];

export default function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  const handleOpenUserMenu = (e) => setAnchorElUser(e.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  return (
    <AppBar position="fixed" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* ───────── DESKTOP: Logo + Texto ───────── */}
          <Box
            component="img"
            src="/Tersoft.webp"
            alt="Tersoft Logo"
            sx={{
              display: { xs: "none", md: "flex" },
              height: 40,
              mr: 2,
              cursor: "pointer",
            }}
            onClick={() =>
              window.open("https://www.tersoft.mx/que-es-odoo", "_blank")
            }
          />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/cotizador"
            sx={{
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              color: "inherit",
              textDecoration: "none",
              flexGrow: 1,
            }}
          >
            Cotizador para proyectos Odoo | Tersoft
          </Typography>

          {/* ───────── MOBILE: Botón Hamburguesa ───────── */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="abrir menú"
              aria-controls="menu-appbar-nav"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar-nav"
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.label}
                  onClick={() => {
                    handleCloseNavMenu();
                    page.href
                      ? (window.location.href = page.href)
                      : page.action();
                  }}
                >
                  <Typography textAlign="center">{page.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* ───────── MOBILE: Logo Centrado ───────── */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src="/Tersoft.webp"
              alt="Tersoft Logo"
              sx={{ height: 40 }}
            />
          </Box>

          {/* ───────── DESKTOP: Botones de Página ───────── */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                onClick={() =>
                  page.href ? (window.location.href = page.href) : page.action()
                }
                sx={{ color: "white", mx: 1 }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* ───────── Avatar / Menú de Usuario ───────── */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Cuenta">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <AccountCircleIcon sx={{ color: "white", fontSize: 32 }} />
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar-user"
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{ mt: "45px" }}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.label}
                  onClick={() => {
                    handleCloseUserMenu();
                    setting.action();
                  }}
                >
                  <Typography textAlign="center">{setting.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
      {/* Placeholder para empujar contenido bajo el AppBar */}
    </AppBar>
  );
}
