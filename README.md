# RA2: Django + React con Autenticación y APIs

Proyecto Full Stack integral que combina un backend en **Django REST Framework** con autenticación **JWT**, consumo de servicios **SOAP** vía **Zeep**, y un frontend en **React.js (Vite)** con **Semantic UI**, **SASS**, **React Router v6**, **Formik**, **Yup** y **React-Toastify**.

Desarrollado siguiendo el manual *Manual de Desarrollo Full Stack con Django y ReactJS* (páginas 13 a 35) y los requerimientos del resultado de aprendizaje de las Unidades 2 y 3.

---

## 🚀 Arquitectura del Proyecto

```text
ResultadoDeAprendizaje/
├── backend/                  # API REST en Django
│   ├── clinica/              # Configuración general y URLs raíz
│   ├── users/                # Modelo de usuario personalizado, serializers, vistas y endpoints
│   ├── manage.py
│   └── requirements.txt      # Dependencias de Python (DRF, SimpleJWT, Zeep, CORS, etc.)
├── frontend/                 # Aplicación SPA en React + Vite
│   ├── src/
│   │   ├── api/              # Servicios de comunicación con el backend (user.js, token.js)
│   │   ├── context/          # Contexto global de autenticación (AuthContext.jsx)
│   │   ├── hooks/            # Custom hooks (useAuth.jsx, useUser.jsx)
│   │   ├── layouts/          # Layouts por rol/estado (AdminLayout, ClientLayout, CommonLayout)
│   │   ├── pages/            # Vistas (Dashboard, Home, Login, Register, Error404)
│   │   ├── routes/           # Sistema modular de rutas con react-router-dom v6
│   │   ├── App.jsx           # Componente raíz con Provider y ToastContainer
│   │   ├── App.scss          # Estilos personalizados y sobrescritura de Semantic UI
│   │   └── main.jsx
│   ├── .env                  # Variables de entorno de Vite
│   └── package.json
└── test_integration.js       # Script de verificación integral automatizado
```

---

## 🛠️ Requisitos e Instalación

### 1. Backend (Django)

1. Abrir terminal en la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Crear y activar el entorno virtual:
   ```bash
   python -m venv venv
   # En Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # En Linux/Mac:
   source venv/bin/activate
   ```
3. Instalar las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Aplicar las migraciones a la base de datos:
   ```bash
   python manage.py migrate
   ```
5. Iniciar el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```
   El backend estará disponible en `http://127.0.0.1:8000/`.

### 2. Frontend (React)

1. En una nueva terminal, entrar a la carpeta `frontend`:
   ```bash
   cd frontend
   ```
2. Instalar dependencias de Node:
   ```bash
   npm install
   ```
3. Iniciar el servidor Vite:
   ```bash
   npm run dev
   ```
   El frontend estará accesible en `http://127.0.0.1:5173/`.

---

## 🔑 Credenciales de Prueba

- **Email:** `admin@clinica.com`
- **Contraseña:** `Admin123!`

*(También es posible crear nuevos usuarios directamente desde la pantalla de **Registro** en `/register`).*

---

## 📋 Endpoints Principales del Backend

| Método | Endpoint | Descripción | Autenticación |
|---|---|---|---|
| `POST` | `/api/v1/auth/token/` | Obtención de tokens JWT (`access` y `refresh`) | Pública |
| `POST` | `/api/v1/auth/token/refresh/` | Refresco de token JWT | Pública |
| `POST` | `/api/v1/auth/register/` | Registro de nuevos usuarios | Pública |
| `GET` | `/api/v1/auth/me/` | Datos del usuario actualmente autenticado | Requiere `Bearer <token>` |
| `GET` | `/api/v1/soap/country/?code=MX` | Consumo SOAP en vivo con Zeep (CountryInfoService) | Pública |
| `GET` | `/swagger/` | Documentación interactiva Swagger UI | Pública |
| `GET` | `/redoc/` | Documentación ReDoc | Pública |

---

## 🌟 Características Implementadas

### Parte 1: Frontend en React (Manual págs. 13 a 35)
- **Vite + React 18 + SASS:** Entorno moderno con soporte para Semantic UI y SASS.
- **Rutas Modulares:** Configuración desacoplada en `routes.admin.jsx`, `routes.client.jsx` y `routes.common.jsx`.
- **Layouts Dinámicos:** `AdminLayout` protege las rutas privadas validando el estado `auth`; si no hay sesión, renderiza el Login.
- **Formularios con Formik + Yup:** Validación estricta de correo, contraseña (mínimo 8 caracteres, mayúscula, número y símbolo especial) y coincidencia de confirmación.
- **Notificaciones Toast:** Feedback visual con `react-toastify`.
- **Persistencia de Sesión:** `AuthContext` + `useAuth` almacenando el token en `localStorage` y precargando los datos del usuario mediante `/api/v1/auth/me/`.

### Parte 2: Integración de API de Terceros
- Sección en el **Dashboard** que consume la API externa gratuita de **Advice Slip** mediante `fetch()`, permitiendo actualizar frases motivacionales en tiempo real.

### Parte 3: Web Services Propios y SOAP
- **Web Service Propio:** Endpoint protegido `/api/v1/auth/me/` con datos del usuario logueado en formato JSON.
- **Consumo SOAP:** Endpoint en Django `/api/v1/soap/country/` que utiliza la biblioteca `zeep` para consultar el servicio WSDL `CountryInfoService` (obteniendo capital, moneda, prefijo y bandera). El Dashboard incluye un widget interactivo para probarlo con cualquier código de país (MX, US, ES, CA, etc.).
