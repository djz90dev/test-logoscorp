# Integración Zoho CRM

## OAuth2

### Concepto

OAuth2 es un protocolo de autorización que permite a una aplicación acceder a recursos de un usuario sin exponer credenciales.

### Flujo

```
Backend (nuestro servidor)
    │
    ├─→ Zoho Accounts (Auth Server)
    │       │
    │       ├─ Client ID + Client Secret + Refresh Token
    │       │
    │       └─→ Access Token (válido ~1 hora)
    │
    └─→ Zoho CRM API (Resource Server)
            │
            ├─ Authorization: Bearer {access_token}
            │
            └─→ CRUD Contactos
```

### Tokens

| Token | Duración | Uso |
|-------|----------|-----|
| Refresh Token | Permanente | Obtener nuevos Access Tokens |
| Access Token | ~1 hora | Autenticar requests a Zoho CRM |

### Flujo de Token Refresh

```
1. Backend detecta token expirado o por expirar
2. POST → Zoho Accounts
   - grant_type=refresh_token
   - client_id
   - client_secret
   - refresh_token
3. Zoho retorna nuevo access_token
4. Backend cachea nuevo token
5. Reintenta request original
```

---

## Variables de Entorno

### ZOHO_CLIENT_ID

Identificador único de la aplicación en Zoho.

```
ZOHO_CLIENT_ID=1000.XXXXXXXXXXXXXXXXXX
```

- Obligatoria
- Puede exponerse al frontend si es necesario
- Se obtiene al registrar la app en Zoho API Console

### ZOHO_CLIENT_SECRET

Secreto de la aplicación.

```
ZOHO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- Obligatoria
- **NUNCA** exponer al frontend
- **NUNCA** registrar en logs
- Se obtiene al registrar la app en Zoho API Console

### ZOHO_REFRESH_TOKEN

Token de actualización permanente.

```
ZOHO_REFRESH_TOKEN=1000.xxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxx
```

- Obligatoria
- **NUNCA** exponer al frontend
- **NUNCA** registrar en logs
- Se obtiene una vez mediante flujo OAuth manual

### ZOHO_ACCOUNT_SERVER

Servidor de cuentas Zoho para OAuth.

```
# US
ZOHO_ACCOUNT_SERVER=https://accounts.zoho.com

# EU
ZOHO_ACCOUNT_SERVER=https://accounts.zoho.eu

# Australia
ZOHO_ACCOUNT_SERVER=https://accounts.zoho.com.au
```

- Obligatoria
- Varía por región de Zoho

### ZOHO_API_BASE_URL

Base URL de la API de Zoho CRM.

```
# US
ZOHO_API_BASE_URL=https://www.zohoapis.com/crm/v2

# EU
ZOHO_API_BASE_URL=https://www.zohoapis.eu/crm/v2

# Australia
ZOHO_API_BASE_URL=https://www.zohoapis.com.au/crm/v2
```

- Obligatoria
- Debe coincidir con la región de ZOHO_ACCOUNT_SERVER

### ZOHO_ACCESS_TOKEN

Token de acceso cacheado.

```
ZOHO_ACCESS_TOKEN=1000.xxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxx
```

- Opcional (se genera automáticamente)
- Se cachea en memoria
- Se renueva automáticamente vía refresh token
- **NUNCA** exponer al frontend

---

## Backend → Zoho

### Flujo Completo

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────→│   Backend    │────→│  Zoho CRM    │
│   (React)    │     │   (Express)  │     │     API      │
└──────────────┘     └──────────────┘     └──────────────┘
                           │                     ▲
                           │                     │
                           └─────────────────────┘
                          ContactSyncService
                              │
                              ▼
                    ┌──────────────────┐
                    │ ZohoAuthClient   │
                    │                  │
                    │ 1. Check token   │
                    │ 2. Refresh if    │
                    │    needed        │
                    │ 3. Return token  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ ZohoCRMClient    │
                    │                  │
                    │ POST /contacts   │
                    │ Authorization:   │
                    │ Bearer {token}   │
                    └──────────────────┘
```

### Pasos

1. Frontend envía `POST /contacts/sync` con usuario
2. ContactSyncService valida reglas de negocio
3. ContactSyncService llama a ZohoAuthClient para obtener token
4. ZohoAuthClient verifica token cacheado
5. Si expirado → refresh → nuevo token
6. ZohoCRMClient envía contacto a Zoho CRM
7. ZohoCRMClient retorna respuesta
8. ContactSyncService retorna resultado al controller
9. Controller retorna respuesta al frontend

---

## ZohoAuthClient

### Responsabilidades

- Obtener Access Token válido
- Usar Refresh Token para renovar
- Cache en memoria
- Manejar errores de autenticación
- Nunca exponer credenciales

### Interface

```typescript
interface ZohoAuthClient {
  getAccessToken(): Promise<string>;
}
```

### Flujo Interno

```
getAccessToken()
    │
    ├─ Token cacheado existe y no expirado?
    │       │
    │       ├─ SÍ → retornar token
    │       │
    │       └─ NO → refreshAccessToken()
    │               │
    │               ├─ POST {ZOHO_ACCOUNT_SERVER}/oauth/v2/token
    │               │   - grant_type=refresh_token
    │               │   - client_id={ZOHO_CLIENT_ID}
    │               │   - client_secret={ZOHO_CLIENT_SECRET}
    │               │   - refresh_token={ZOHO_REFRESH_TOKEN}
    │               │
    │               ├─ 200 OK → cachear token → retornar
    │               │
    │               └─ Error → ZOHO_AUTH_ERROR
```

### Errores

| Error | Causa | Manejo |
|-------|-------|--------|
| invalid_client | Client ID/Secret incorrecto | Log error, retornar ZOHO_AUTH_ERROR |
| invalid_grant | Refresh Token inválido/expirado | Log error, retornar ZOHO_AUTH_ERROR |
| Network error | Timeout/conexión | Retry 1 vez, luego ZOHO_AUTH_ERROR |

---

## ZohoCRMClient

### Responsabilidades

- Comunicación HTTP con Zoho CRM
- Crear contactos
- Manejar timeouts
- Manejar errores HTTP
- Transformar respuesta

### Interface

```typescript
interface ZohoCRMClient {
  createContact(contact: ZohoContact): Promise<ZohoContactResponse>;
}
```

### Configuración

```typescript
const config = {
  baseUrl: ZOHO_API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
};
```

### Request

```
POST {ZOHO_API_BASE_URL}/Contacts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "data": [
    {
      "First_Name": "Leanne",
      "Last_Name": "Graham",
      "Email": "Sincere@april.biz",
      "Phone": "1770736803164",
      "Website": "https://hildegard.org",
      "Company": "Romaguera-Crona"
    }
  ]
}
```

### Response

```json
{
  "data": [
    {
      "code": 0,
      "message": "record added",
      "details": {
        "id": "1234567890"
      },
      "status": "success"
    }
  ]
}
```

### Errores

| HTTP Status | Código | Descripción | Manejo |
|-------------|--------|-------------|--------|
| 200 | 0 | Success | Retornar resultado |
| 200 | 1 | Data QC Error | Retornar error |
| 400 | - | Bad Request | Retornar ZOHO_API_ERROR |
| 401 | - | Unauthorized | Refresh token, reintentar 1 vez |
| 403 | - | Forbidden | Retornar ZOHO_API_ERROR |
| 404 | - | Not Found | Retornar ZOHO_API_ERROR |
| 429 | - | Rate Limit | Esperar, reintentar 1 vez |
| 500 | - | Server Error | Retry 1 vez, luego ZOHO_API_ERROR |
| Timeout | - | Timeout | Retry 1 vez, luego ZOHO_API_ERROR |

### Transformación

Modelo interno → Modelo Zoho:

```typescript
function toZohoContact(user: Contact): ZohoContact {
  return {
    First_Name: user.name.split(' ')[0],
    Last_Name: user.name.split(' ').slice(1).join(' '),
    Email: user.email,
    Phone: user.normalizedPhone,
    Website: user.normalizedWebsite,
    Company: user.company.name,
  };
}
```

---

## ContactSyncService

### Responsabilidades

- Único servicio de sincronización
- Recibir modelo interno
- Validar reglas de negocio
- Ejecutar error simulado
- Transformar datos para Zoho
- Usar ZohoCRMClient
- Retornar resultado

### Interface

```typescript
interface ContactSyncService {
  syncOne(contact: Contact): Promise<SyncResult>;
  syncBulk(contacts: Contact[]): Promise<BulkSyncResult>;
}
```

### Flujo syncOne

```
syncOne(contact)
    │
    ├─ 1. Validar contacto
    │       ├─ ¿isValidCompany? → No, retornar error
    │       └─ ¿username empieza con "C"? → Error simulado
    │
    ├─ 2. Transformar a modelo Zoho
    │       └─ toZohoContact(contact)
    │
    ├─ 3. Obtener Access Token
    │       └─ zohoAuthClient.getAccessToken()
    │
    ├─ 4. Crear contacto en Zoho
    │       └─ zohoCRMClient.createContact(zohoContact)
    │
    └─ 5. Retornar resultado
            ├─ Success → { success: true, contactId: "..." }
            └─ Error → { success: false, error: {...} }
```

### Flujo syncBulk

```
syncBulk(contacts)
    │
    ├─ results = []
    │
    └─ Para cada contact (NO se detiene por error):
            │
            ├─ resultado = await syncOne(contact)
            │
            └─ results.push(resultado)
    │
    └─ Retornar:
            {
              total: contacts.length,
              successful: results.filter(r => r.success).length,
              failed: results.filter(r => !r.success).length,
              results: results
            }
```

### Error Simulado

```typescript
function shouldSimulateError(username: string): boolean {
  return username.toUpperCase().startsWith('C');
}
```

Si `shouldSimulateError(user.username)` es true:

- NO llamar a ZohoCRMClient
- Retornar:

```json
{
  "success": false,
  "error": {
    "message": "Simulated error: username starts with C",
    "code": "SIMULATED_ERROR"
  }
}
```

---

## Seguridad

### Reglas

| Regla | Implementación |
|-------|----------------|
| No exponer secretos al navegador | Solo backend accede a .env |
| No registrar secretos en logs | Pino filter antes de log |
| No registrar Authorization headers | Middleware omite header en logs |
| No colocar credenciales en Git | .env en .gitignore |
| No colocar credenciales en código | Variables de entorno |

### .env (ejemplo)

```bash
# NUNCA colocar valores reales en documentación
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REFRESH_TOKEN=your_refresh_token_here
ZOHO_ACCOUNT_SERVER=https://accounts.zoho.com
ZOHO_API_BASE_URL=https://www.zohoapis.com/crm/v2
```

### .gitignore

```
.env
.env.local
.env.*.local
```

### Logging

```typescript
// NUNCA hacer esto:
logger.info({ authorization: req.headers.authorization });

// HACER esto:
logger.info({ method: req.method, url: req.url, status: res.statusCode });
```

### Pino Redaction

```typescript
const logger = pino({
  redact: ['req.headers.authorization', '*.password', '*.secret', '*.token'],
});
```
