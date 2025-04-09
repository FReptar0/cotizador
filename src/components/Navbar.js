import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Navbar = ({ onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    handleMenuClose();
  };

  const handleCita = () => {
    window.open(
      "https://calendly.com/tersoft/primera-sesion-para-conocer-necesidades-de-su-empresa",
      "_blank"
    );
  };

  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar sx={{ bgcolor: "primary.main" }}>
        <img
          src="/Tersoft.webp"
          alt="Tersoft Logo"
          style={{ height: 40, marginRight: 16 }}
        />
        <Typography variant="h6" sx={{ flexGrow: 1, color: "#ffffff" }}>
          Cotizador para proyectos Odoo | Tersoft
        </Typography>

        {/* Botón para agendar una cita */}
        <Button
          variant="text"
          sx={{ color: "#ffffff", mr: 2 }}
          onClick={handleCita}
        >
          Agende una cita
        </Button>

        <IconButton color="inherit" onClick={handleMenuOpen}>
          <AccountCircleIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          MenuProps={{
            disablePortal: true,
            disableScrollLock: true,
            PaperProps: {
              sx: {
                boxShadow: "none",
                border: "none",
                backgroundColor: "transparent",
              },
            },
          }}
        >
          <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
