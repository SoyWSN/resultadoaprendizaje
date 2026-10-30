import React, { useState, useEffect } from "react";
import { Button, Card, Icon, Input, Loader } from "semantic-ui-react";
import { useAuth } from "../../hooks/useAuth";
import { getSoapCountryApi } from "../../api/user";

export function Dashboard() {
  const { logout, auth } = useAuth();
  const user = auth?.me;

  // Estado para la API de terceros (Parte 2: Frase motivadora con fetch)
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  // Estado para el Web Service SOAP (Parte 3: Consumo SOAP con Zeep en Django)
  const [countryCode, setCountryCode] = useState("MX");
  const [soapData, setSoapData] = useState(null);
  const [loadingSoap, setLoadingSoap] = useState(false);
  const [soapError, setSoapError] = useState(null);

  // Consumir API de terceros con fetch
  const fetchQuote = async () => {
    setLoadingQuote(true);
    try {
      // Usamos Advice Slip API (gratuita, sin clave, CORS habilitado)
      const res = await fetch("https://api.adviceslip.com/advice?t=" + new Date().getTime());
      const data = await res.json();
      setQuote(data.slip.advice);
    } catch (err) {
      console.error("Error al obtener frase:", err);
      setQuote("El éxito es la suma de pequeños esfuerzos repetidos cada día.");
    } finally {
      setLoadingQuote(false);
    }
  };

  // Consumir Web Service SOAP vía Django
  const fetchSoapCountry = async (code) => {
    setLoadingSoap(true);
    setSoapError(null);
    try {
      const result = await getSoapCountryApi(code || "MX");
      if (result.status === "success") {
        setSoapData(result.data);
      } else {
        setSoapError(result.message || "Error al consultar SOAP");
      }
    } catch (err) {
      setSoapError(err.message || "Error al conectar con el servicio SOAP");
    } finally {
      setLoadingSoap(false);
    }
  };

  useEffect(() => {
    fetchQuote();
    fetchSoapCountry("MX");
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header del Dashboard */}
      <div className="dashboard-container__header">
        <div className="user-info">
          <h1>Dashboard Administrativo</h1>
          <p>
            Bienvenido, <strong>{user?.username || user?.email}</strong> ({user?.email})
            {user?.telefono && ` • Teléfono: ${user.telefono}`}
          </p>
        </div>
        <Button color="red" icon labelPosition="left" onClick={logout}>
          <Icon name="sign-out" />
          Cerrar Sesión
        </Button>
      </div>

      <div className="dashboard-container__grid">
        {/* Widget 1: Web Service Propio (Datos del usuario autenticado vía JWT) */}
        <div className="widget-card">
          <h3>
            <Icon name="user circle" color="blue" />
            Web Service Propio (/auth/me/)
          </h3>
          <p>Datos protegidos obtenidos mediante token JWT:</p>
          <div className="soap-result">
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Es Staff / Admin:</strong> {user?.is_staff ? "Sí" : "No"}</p>
            <p><strong>Cuenta Activa:</strong> {user?.is_active ? "Sí" : "No"}</p>
            {user?.telefono && <p><strong>Teléfono:</strong> {user?.telefono}</p>}
          </div>
        </div>

        {/* Widget 2: API de Terceros (Requisito Parte 2) */}
        <div className="widget-card quote-card">
          <h3>
            <Icon name="quote left" color="green" />
            API de Terceros (Frase del Día)
          </h3>
          <p>Consumo de API externa pública mediante <code>fetch</code>:</p>
          {loadingQuote ? (
            <Loader active inline="centered" content="Cargando frase..." />
          ) : (
            <div className="quote-content">
              "{quote}"
            </div>
          )}
          <Button
            basic
            color="green"
            size="small"
            onClick={fetchQuote}
            disabled={loadingQuote}
            style={{ marginTop: "10px" }}
          >
            <Icon name="refresh" /> Obtener otra frase
          </Button>
        </div>

        {/* Widget 3: Web Service SOAP en Django (Requisito Parte 3) */}
        <div className="widget-card soap-card">
          <h3>
            <Icon name="globe" color="teal" />
            Consumo SOAP en Django (Zeep)
          </h3>
          <p>
            Endpoint Django <code>/api/v1/soap/country/</code> que consume el WSDL público
            <strong> CountryInfoService</strong>:
          </p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <Input
              size="small"
              placeholder="Código ISO (ej. MX, US, ES)"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
              style={{ width: "160px" }}
            />
            <Button
              primary
              size="small"
              onClick={() => fetchSoapCountry(countryCode)}
              disabled={loadingSoap}
            >
              Consultar SOAP
            </Button>
          </div>

          {loadingSoap && <Loader active inline="centered" content="Consultando SOAP..." />}

          {soapError && (
            <div style={{ color: "red", marginTop: "10px" }}>
              <Icon name="warning sign" /> {soapError}
            </div>
          )}

          {soapData && !loadingSoap && (
            <div className="soap-result">
              <p><strong>País:</strong> {soapData.name} ({soapData.iso_code})</p>
              <p><strong>Capital:</strong> {soapData.capital}</p>
              <p><strong>Moneda:</strong> {soapData.currency}</p>
              <p><strong>Prefijo Telefónico:</strong> +{soapData.phone_code}</p>
              {soapData.flag_url && (
                <div>
                  <img
                    src={soapData.flag_url}
                    alt={`Bandera de ${soapData.name}`}
                    className="flag-img"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
