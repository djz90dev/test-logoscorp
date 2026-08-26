# Guía Postman - Zoho OAuth2

## Obtener Access Token Manualmente

### Prerequisitos

1. Cuenta Zoho (accounts.zoho.com)
2. Aplicación registrada en Zoho API Console
3. Client ID
4. Client Secret
5. Refresh Token (obtenido previamente)

### Paso 1: Registrar Aplicación

1. Ir a https://api-console.zoho.com/
2. Click "Add Client" → "Server-based Applications"
3. Completar:
   - Client Name: "Contact Sync App"
   - Homepage URL: "http://localhost:3000"
   - Authorized Redirect URIs: "http://localhost:3000/callback"
4. Guardar Client ID y Client Secret

### Paso 2: Obtener Refresh Token (Primera vez)

1. Abrir navegador con esta URL (reemplazar `{CLIENT_ID}`):

```
https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id={CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/callback
```

2. Autorizar la aplicación
3. Copiar el `code` del redirect URL

### Paso 3: Intercambiar Code por Refresh Token

En Postman:

```
POST https://accounts.zoho.com/oauth/v2/token
```

Body (x-www-form-urlencoded):

| Key | Value |
|-----|-------|
| grant_type | authorization_code |
| client_id | {CLIENT_ID} |
| client_secret | {CLIENT_SECRET} |
| code | {CODE} |
| redirect_uri | http://localhost:3000/callback |

Response:

```json
{
  "access_token": "1000.xxxxx.xxxxx",
  "refresh_token": "1000.xxxxx.xxxxx",
  "token_type": "Bearer",
  "expires_in": 3600,
  "api_domain": "https://www.zohoapis.com",
  "domain": "www.zohoapis.com"
}
```

**GUARDAR refresh_token de forma segura.**

### Paso 4: Obtener Access Token con Refresh Token

En Postman:

```
POST https://accounts.zoho.com/oauth/v2/token
```

Body (x-www-form-urlencoded):

| Key | Value |
|-----|-------|
| grant_type | refresh_token |
| client_id | {CLIENT_ID} |
| client_secret | {CLIENT_SECRET} |
| refresh_token | {REFRESH_TOKEN} |

Response:

```json
{
  "access_token": "1000.xxxxx.xxxxx",
  "token_type": "Bearer",
  "expires_in": 3600,
  "api_domain": "https://www.zohoapis.com",
  "domain": "www.zohoapis.com"
}
```

### Paso 5: Usar Access Token

En Postman, crear request a Zoho CRM:

```
POST https://www.zohoapis.com/crm/v2/Contacts
```

Headers:

| Key | Value |
|-----|-------|
| Authorization | Bearer {ACCESS_TOKEN} |
| Content-Type | application/json |

Body:

```json
{
  "data": [
    {
      "First_Name": "Test",
      "Last_Name": "Contact",
      "Email": "test@example.com",
      "Phone": "1234567890"
    }
  ]
}
```

---

## Endpoints de Referencia

### Zoho Accounts (Auth)

| Entorno | URL |
|---------|-----|
| US | https://accounts.zoho.com |
| EU | https://accounts.zoho.eu |
| Australia | https://accounts.zoho.com.au |

### Zoho CRM API

| Entorno | URL |
|---------|-----|
| US | https://www.zohoapis.com/crm/v2 |
| EU | https://www.zohoapis.eu/crm/v2 |
| Australia | https://www.zohoapis.com.au/crm/v2 |

---

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| invalid_client | Client ID/Secret incorrecto | Verificar credenciales |
| invalid_grant | Refresh Token inválido/expirado | Regenerar Refresh Token |
| invalid_code | Code expirado o ya usado | Generar nuevo code |
| scope_mismatch | Scope incorrecto | Usar ZohoCRM.modules.ALL |

---

## Scope Requerido

```
ZohoCRM.modules.ALL
```

Permite acceso completo a módulos de CRM.

---

## Postman Collection

### Variables

Crear variables de entorno en Postman:

| Variable | Value |
|----------|-------|
| client_id | {YOUR_CLIENT_ID} |
| client_secret | {YOUR_CLIENT_SECRET} |
| refresh_token | {YOUR_REFRESH_TOKEN} |
| access_token | {Obtener con refresh} |
| account_server | https://accounts.zoho.com |
| api_base_url | https://www.zohoapis.com/crm/v2 |

### Requests

#### 1. Get Access Token

```
POST {{account_server}}/oauth/v2/token
Body:
  grant_type: refresh_token
  client_id: {{client_id}}
  client_secret: {{client_secret}}
  refresh_token: {{refresh_token}}
```

#### 2. Create Contact

```
POST {{api_base_url}}/Contacts
Headers:
  Authorization: Bearer {{access_token}}
Body:
  {
    "data": [{
      "First_Name": "Test",
      "Last_Name": "Contact",
      "Email": "test@example.com"
    }]
  }
```

#### 3. Get Contacts

```
GET {{api_base_url}}/Contacts
Headers:
  Authorization: Bearer {{access_token}}
```

---

## Seguridad en Postman

### No exponer credenciales

- Usar variables de entorno
- No compartir collections con credenciales
- No usar variables globales para secretos

### Production

En producción:

- Access Token se genera automáticamente via backend
- Refresh Token nunca se expone
- Client Secret nunca se expone
