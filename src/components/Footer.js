import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: "#000000",
        color: "#ffffff",
        textAlign: "center",
        py: 2,
      }}
    >
      <Typography variant="body2">Tersoft © 2023</Typography>
    </Box>
  );
};

export default Footer;
