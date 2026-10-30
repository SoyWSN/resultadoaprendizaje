import os
import django
from datetime import datetime, timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinica.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import authenticate
from users.models import User
import jwt

client = APIClient()

print("--- 1. PROBANDO LOGIN Y OBTENCION DE TOKEN JWT ---")
login_response = client.post('/api/v1/auth/token/', {
    'email': 'admin@clinica.com',
    'password': 'AdminPassword123!'
}, format='json')

assert login_response.status_code == 200, f"Error en login: {login_response.data}"
tokens = login_response.data
access_token = tokens['access']
refresh_token = tokens['refresh']
print("Token obtenido con exito:")
print("Access token:", access_token[:30] + "...")

# 2. Verificar tiempo de vida ACCESS_TOKEN_LIFETIME
decoded = jwt.decode(access_token, options={"verify_signature": False})
lifetime_seconds = decoded['exp'] - decoded['iat']
print(f"Duracion del token en payload (exp - iat): {lifetime_seconds} segundos ({lifetime_seconds / 60} minutos)")
assert lifetime_seconds == 3600, f"Se esperaba 3600 segundos (60 mins), se obtuvo {lifetime_seconds}"

# 3. Consultar datos personales (/api/v1/auth/me/)
print("\n--- 2. PROBANDO ENDPOINT DATOS PERSONALES (/api/v1/auth/me/) ---")
client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
me_response = client.get('/api/v1/auth/me/')
assert me_response.status_code == 200, f"Error en /api/v1/auth/me/: {me_response.data}"
me_data = me_response.data
print("Respuesta de /api/v1/auth/me/:", me_data)
assert 'password' not in me_data, "FALLA DE SEGURIDAD: La contrasena sigue apareciendo en /api/v1/auth/me/!"
assert 'telefono' in me_data, "ERROR: El campo extra 'telefono' no aparece en la respuesta!"
print("Correcto: 'password' NO aparece y 'telefono' SI aparece.")

# 4. Crear un nuevo usuario a traves del CRUD (/api/v1/users/)
print("\n--- 3. CREANDO UN USUARIO VIA CRUD (/api/v1/users/) ---")
# Limpieza por si el usuario ya existia de ejecuciones previas del test
User.objects.filter(email='garcia@clinica.com').delete()
User.objects.filter(username='doctor_garcia').delete()

new_user_payload = {
    'username': 'doctor_garcia',
    'email': 'garcia@clinica.com',
    'first_name': 'Carlos',
    'last_name': 'Garcia',
    'password': 'PasswordGarcia123!',
    'telefono': '555-987-6543',
    'is_active': True,
    'is_staff': False
}
create_response = client.post('/api/v1/users/', new_user_payload, format='json')
assert create_response.status_code == 201, f"Error al crear usuario: {create_response.data}"
created_data = create_response.data
print("Usuario creado:", created_data)
assert 'password' not in created_data, "FALLA DE SEGURIDAD: La contrasena aparece en respuesta de creacion!"
user_id = created_data['id']

# Obtener usuario de la BD
user_db = User.objects.get(id=user_id)
original_password_hash = user_db.password
print("Hash original del usuario guardado en BD:", original_password_hash[:25] + "...")

# 5. Probar actualizacion parcial SIN enviar contrasena (Prueba de seguridad del manual)
print("\n--- 4. ACTUALIZANDO USUARIO SIN CONTRASENA (VERIFICACION DE FIX DE SEGURIDAD) ---")
patch_payload = {
    'telefono': '555-000-1111',
    'first_name': 'Carlos Alberto'
}
patch_response = client.patch(f'/api/v1/users/{user_id}/', patch_payload, format='json')
assert patch_response.status_code == 200, f"Error en PATCH: {patch_response.data}"
print("Respuesta PATCH:", patch_response.data)
assert 'password' not in patch_response.data, "FALLA: La contrasena aparece en respuesta de PATCH!"

# Verificar hash en la base de datos tras la actualizacion
user_db.refresh_from_db()
print("Hash tras actualizacion sin contrasena:", user_db.password[:25] + "...")
admin_user = User.objects.get(email='admin@clinica.com')

assert user_db.password == original_password_hash, "FALLA: La contrasena del usuario cambio a pesar de no enviarla!"
assert user_db.password != admin_user.password, "FALLA GRAVE: La contrasena del usuario se sobreescribio con la contrasena del admin!"
print("Correcto: La contrasena del usuario se mantuvo intacta y NO se cambio por la del admin.")

# Verificar que el usuario aun puede hacer login con su contrasena original
login_user = client.post('/api/v1/auth/token/', {
    'email': 'garcia@clinica.com',
    'password': 'PasswordGarcia123!'
}, format='json')
assert login_user.status_code == 200, "Error: El usuario no pudo autenticarse con su contrasena original tras el PATCH!"
print("Correcto: El usuario puede autenticarse con su contrasena original.")

# 6. Probar Swagger Schema
print("\n--- 5. VERIFICANDO SWAGGER OPENAPI SCHEMA ---")
swagger_response = client.get('/swagger/?format=openapi')
assert swagger_response.status_code == 200, f"Error al consultar Swagger: {swagger_response.status_code}"
schema_data = swagger_response.data
print("Titulo de Swagger:", schema_data.get('info', {}).get('title'))
assert schema_data.get('info', {}).get('title') == "Clinica API", "El titulo de Swagger no coincide!"

print("\n>>> TODAS LAS PRUEBAS DE SEGURIDAD Y REQUISITOS HAN PASADO CON EXITO! <<<")
