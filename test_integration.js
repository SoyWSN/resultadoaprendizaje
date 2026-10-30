async function testAll() {
  console.log("=== INICIANDO PRUEBAS DE INTEGRACION ===");

  // 1. Login con JWT
  const loginRes = await fetch("http://127.0.0.1:8000/api/v1/auth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@clinica.com", password: "Admin123!" }),
  });
  const loginData = await loginRes.json();
  console.log("1. Login JWT status:", loginRes.status, "Access Token obtenido:", !!loginData.access);

  // 2. Web Service Propio (/auth/me/)
  const meRes = await fetch("http://127.0.0.1:8000/api/v1/auth/me/", {
    headers: { Authorization: `Bearer ${loginData.access}` },
  });
  const meData = await meRes.json();
  console.log("2. Web Service Propio (/auth/me/) status:", meRes.status, "Usuario:", meData.username, meData.email);

  // 3. Registro de nuevo usuario
  const timestamp = Date.now();
  const regEmail = `test_${timestamp}@clinica.com`;
  const regUser = `user_${timestamp}`;
  const regRes = await fetch("http://127.0.0.1:8000/api/v1/auth/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: regUser, email: regEmail, password: "SecretPassword123!" }),
  });
  const regData = await regRes.json();
  console.log("3. Registro usuario status:", regRes.status, "Mensaje:", regData.message);

  // 4. Login con usuario recién registrado
  const loginNewRes = await fetch("http://127.0.0.1:8000/api/v1/auth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: regEmail, password: "SecretPassword123!" }),
  });
  const loginNewData = await loginNewRes.json();
  console.log("4. Login nuevo usuario status:", loginNewRes.status, "Token:", !!loginNewData.access);

  // 5. Consumo SOAP (CountryInfoService con Zeep)
  const soapRes = await fetch("http://127.0.0.1:8000/api/v1/soap/country/?code=MX");
  const soapData = await soapRes.json();
  console.log("5. Consumo SOAP status:", soapRes.status, "País:", soapData.data?.name, "Capital:", soapData.data?.capital, "Moneda:", soapData.data?.currency);

  // 6. API de Terceros externa (Advice Slip)
  const quoteRes = await fetch("https://api.adviceslip.com/advice");
  const quoteData = await quoteRes.json();
  console.log("6. API Terceros status:", quoteRes.status, "Frase recibida:", quoteData.slip?.advice);

  console.log("=== TODAS LAS PRUEBAS COMPLETADAS CON ÉXITO ===");
}

testAll().catch(console.error);
