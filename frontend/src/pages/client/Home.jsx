import React from "react";
import { Link } from "react-router-dom";
import { Button, Container, Header, Segment } from "semantic-ui-react";
import { useAuth } from "../../hooks/useAuth";

export function Home() {
  const { auth } = useAuth();

  return (
    <Container style={{ paddingTop: "80px", textAlign: "center" }}>
      <Segment padded="very" raised style={{ maxWidth: "600px", margin: "0 auto", borderRadius: "16px" }}>
        <Header as="h1" color="blue" style={{ fontSize: "32px", marginBottom: "15px" }}>
          Sistema Integral Django + React
        </Header>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "30px" }}>
          Práctica RA2: Autenticación con JWT, Context API, Consumo de API Externa y Web Services SOAP con Zeep.
        </p>

        {auth ? (
          <div>
            <p style={{ fontWeight: "bold" }}>Sesión activa como: {auth.me?.email}</p>
            <Button as={Link} to="/dashboard" primary size="large">
              Ir al Dashboard
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
            <Button as={Link} to="/login" primary size="large">
              Iniciar Sesión
            </Button>
            <Button as={Link} to="/register" secondary size="large">
              Registrarse
            </Button>
          </div>
        )}
      </Segment>
    </Container>
  );
}
