// pages/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Typography } from "@mui/material";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  return (
    <Container>
      <Typography variant="h6">Redirigiendo a login...</Typography>
    </Container>
  );
}
