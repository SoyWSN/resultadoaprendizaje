import React from "react";
import { Link } from "react-router-dom";
import { Button, Container, Header } from "semantic-ui-react";

export function Error404() {
  return (
    <Container style={{ paddingTop: "100px", textAlign: "center" }}>
      <Header as="h1" color="grey" style={{ fontSize: "60px" }}>
        404
      </Header>
      <Header as="h3">Página no encontrada</Header>
      <p>La ruta a la que intentas acceder no existe.</p>
      <Button as={Link} to="/" primary>
        Volver al Inicio
      </Button>
    </Container>
  );
}

export default Error404;
