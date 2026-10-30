const API_URL = import.meta.env.VITE_BASE_API_URL;

export async function loginApi(formData) {
  try {
    const url = `${API_URL}/api/v1/auth/token/`;
    console.log("url", url);
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    const response = await fetch(url, params);
    if (response.status !== 200) {
      throw new Error("Usuario o contraseña incorrecta");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function registerApi(formData) {
  try {
    const url = `${API_URL}/api/v1/auth/register/`;
    console.log("url", url);
    const params = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    const response = await fetch(url, params);
    if (response.status !== 201) {
      const errData = await response.json().catch(() => null);
      if (errData && errData.email) {
        throw new Error(`Email: ${errData.email.join(" ")}`);
      }
      if (errData && errData.username) {
        throw new Error(`Username: ${errData.username.join(" ")}`);
      }
      if (errData && errData.password) {
        throw new Error(`Contraseña: ${errData.password.join(" ")}`);
      }
      throw new Error("No se puede crear el usuario");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getMeApi(token) {
  try {
    const url = `${API_URL}/api/v1/auth/me/`;
    const params = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await fetch(url, params);
    if (response.status !== 200) {
      throw new Error("Error al obtener los datos del usuario");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getSoapCountryApi(countryCode = "MX") {
  try {
    const url = `${API_URL}/api/v1/soap/country/?code=${countryCode}`;
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}
