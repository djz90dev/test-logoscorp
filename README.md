# Logoscorp — Zoho CRM Contact Sync

Sistema full-stack que consume usuarios desde JSONPlaceholder, normaliza los datos y permite sincronizarlos individualmente o en lote con Zoho CRM.

## Stack

| Capa | Tecnologías |
|------|------------|
| Frontend | React 19, Vite 8, TypeScript 6, Material UI v9 |
| Backend | Node.js, Express, TypeScript 5, Zod, Pino |
| APIs externas | JSONPlaceholder, Zoho CRM |

## Quick Start

```bash
git clone <repo-url> && cd test-logoscorp
```

```bash
cp .env.example backend/.env
# Editar backend/.env con tus credenciales de Zoho
```

```bash
./start.sh
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Health | http://localhost:3000/health |

Presionar `Ctrl+C` para detener ambos procesos.

## Requisitos previos

- Node.js 18+
- npm
- Cuenta de Zoho con API Console configurada (ver [Obtener Access Token](#obtener-access-token))

## Configuración de variables de entorno

Copiar `.env.example` a `backend/.env` y completar:

```bash
cp .env.example backend/.env
```

### Variables requeridas

| Variable | Descripción | Ejemplo |
|----------|------------|---------|
| `ZOHO_CLIENT_ID` | Client ID de la app en Zoho API Console | `1000.XXXX` |
| `ZOHO_CLIENT_SECRET` | Client Secret de la app | `abcdef1234` |
| `ZOHO_REFRESH_TOKEN` | Refresh Token (se obtiene una vez) | `1000.XXXX` |

### Variables opcionales (ya tienen valor por defecto)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto del backend |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen permitido por CORS |
| `JSONPLACEHOLDER_BASE_URL` | `https://jsonplaceholder.typicode.com` | API de usuarios de prueba |
| `ZOHO_ACCOUNT_SERVER` | `https://accounts.zoho.com` | Servidor OAuth de Zoho |
| `ZOHO_API_BASE_URL` | `https://www.zohoapis.com/crm/v2` | API base de Zoho CRM |

### Seguridad

- `backend/.env` está en `.gitignore` y **nunca se commitea**.
- `ZOHO_CLIENT_SECRET` y `ZOHO_REFRESH_TOKEN` **nunca llegan al navegador**.
- El frontend se comunica exclusivamente con el backend, nunca con Zoho.

## Obtener Access Token

El backend obtiene el Access Token **automáticamente** usando el Refresh Token. No es necesario configurarlo manualmente.

Si es tu primera vez:

1. Registrar app en [Zoho API Console](https://api-console.zoho.com/) (Server-based Applications).
2. Obtener el Refresh Token siguiendo la guía en `postman/README.md`.
3. Colocar `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET` y `ZOHO_REFRESH_TOKEN` en `backend/.env`.

El `ZohoAuthClient` (`backend/src/clients/zoho.auth.client.ts`) renueva el token automáticamente antes de expirar.

## Arquitectura

```
Browser / React (localhost:5173)
        │
        ▼
Vite Dev Server  ──proxy /api──▶  Backend (localhost:3000)
                                        │
                                        ▼
                                  ContactSyncService
                                        │
                          ┌─────────────┼─────────────┐
                           ▼             ▼             ▼
                    JSONPlaceholder  ZohoAuthClient  ZohoCRMClient
                      (GET users)    (OAuth2 token)  (Upsert contacts)
```

### CORS

CORS se configura en el backend con la variable `CORS_ORIGIN`:

```typescript
// backend/src/config/cors.ts
origin: config.CORS_ORIGIN  // nunca "*"
```

En desarrollo local, el proxy de Vite (`vite.config.ts`) redirige `/api/*` al backend, evitando problemas cross-origin. En producción, CORS en backend controla los orígenes permitidos.

### Estructura del proyecto

```
test-logoscorp/
├── backend/
│   ├── src/
│   │   ├── app.ts                    # Express app
│   │   ├── server.ts                 # Startup
│   │   ├── config/                   # env.ts, cors.ts, logger.ts
│   │   ├── middleware/               # errorHandler, requestId, requestLogger, validateRequest
│   │   ├── modules/
│   │   │   ├── contacts/             # routes → controller → schema
│   │   │   └── users/                # routes → controller
│   │   ├── services/
│   │   │   ├── contactSync.service.ts    # Sync central (individual + bulk)
│   │   │   ├── mapUserToZohoContact.ts   # Transformación a formato Zoho
│   │   │   ├── normalization.ts          # Phone, Website, Company
│   │   │   └── simulateError.ts          # Error simulado
│   │   ├── clients/                  # zoho.auth.client.ts, zoho.crm.client.ts, jsonplaceholder.client.ts
│   │   └── shared/types.ts           # Tipos compartidos
│   └── tests/                        # 53 tests
├── frontend/
│   ├── src/
│   │   ├── components/               # UserTable, EditUserDialog, BulkSyncDialog, StatusChip, FeedbackSnackbar
│   │   ├── hooks/                    # useUsers, useSyncUser, useSyncBulk
│   │   ├── pages/UsersPage.tsx       # Página principal
│   │   ├── services/api.ts           # Fetch al backend
│   │   ├── utils/isValidCompany.ts   # Validación de empresa
│   │   └── types/index.ts            # Tipos del frontend
│   └── vitest.config.ts              # Config de tests
├── postman/                          # Collection + guía OAuth
├── docs/                             # Documentación de arquitectura
├── .env.example                      # Template de variables
├── start.sh                          # Script de inicio
└── README.md
```

## Flujo de datos

### Obtención de usuarios

```
GET /api/users
    │
    ▼
JSONPlaceholder (GET /users)
    │
    ▼
normalization.ts
    ├── normalizePhone("1-770-736-8031") → "17707368031"
    ├── normalizeWebsite("hildegard.org") → "https://hildegard.org"
    └── validateCompany({ name: "Romaguera-Crona" }) → false
    │
    ▼
{ data: [ { ...user, normalizedPhone, normalizedWebsite, isValidCompany } ] }
```

### Normalización

| Campo | Regla | Ejemplo |
|-------|-------|---------|
| Phone | Solo dígitos (eliminar `-`, `.`, `()`, espacios) | `1-770-736-8031` → `17707368031` |
| Website | Agregar `https://` si no tiene protocolo | `hildegard.org` → `https://hildegard.org` |
| Company | `isValidCompany: true` si `company.name` contiene `Group`, `Inc.` o `LLC` | `Romaguera-Crona` → `false` |

### Sincronización (Upsert)

La sincronización utiliza **Upsert** de Zoho CRM. El criterio de identificación es el **ID de origen** (`user.id` de JSONPlaceholder), mapeado al campo `Source_Id__c` en Zoho.

```
JSONPlaceholder user.id (ej: 5)
        ↓
mapUserToZohoContact() → Source_Id__c: "5"
        ↓
ZohoCRMClient.upsertContact() → POST /Contacts/upsert
        ↓
si Source_Id__c no existe → CREATE (operation: "created")
si Source_Id__c existe    → UPDATE (operation: "updated")
```

**Endpoint:** `POST ${ZOHO_API_BASE_URL}/Contacts/upsert`

**Payload:**
```json
{
  "data": [{
    "First_Name": "Leanne",
    "Last_Name": "Graham",
    "Email": "Sincere@april.biz",
    "Phone": "17707368031",
    "Account_Name": "Romaguera-Crona",
    "Source_Id__c": "1"
  }]
}
```

### Sincronización individual

```
POST /api/contacts/sync  { user }
    │
    ▼
ContactSyncService.syncOne()
    │
    ├── ¿username empieza con "C"?
    │       └── SÍ → retorna { success: false, code: "SIMULATED_ERROR" }
    │               (NO se envía nada a Zoho)
    │
    └── NO → mapUserToZohoContact(user)
              │  (incluye Source_Id__c: String(user.id))
              ▼
         ZohoCRMClient.upsertContact() → POST /Contacts/upsert
              │
              ├── Éxito → { success: true, contactId, operation: "created"|"updated" }
              ├── DUPLICATE_DATA → { success: false, code: "CONTACT_ALREADY_EXISTS" }
              └── Otro error → { success: false, code: "ZOHO_API_ERROR" }
```

### Sincronización masiva

```
POST /api/contacts/sync-bulk  { users: [...] }
    │
    ▼
ContactSyncService.syncBulk()
    │
    ▼
for (user of users) → syncOne(user)  // cada uno independiente
    │
    ▼
{
  total: N,
  successful: X,
  failed: Y,
  results: [ { userId, success, contactId?, operation?, sourceId?, error? }, ... ]
}
```

**Resiliencia**: un fallo individual NO detiene el procesamiento de los demás contactos.

### Configuración requerida en Zoho CRM

El campo `Source_Id__c` debe existir en el módulo **Contacts** de Zoho CRM como **External ID**:

| Propiedad | Valor |
|-----------|-------|
| Module | Contacts |
| Field Type | Text |
| Label | Source ID |
| API Name | `Source_Id__c` |
| External ID | Sí |

Sin este campo configurado, el upsert no funcionará correctamente.

## Lógica reutilizable

**`ContactSyncService`** (`backend/src/services/contactSync.service.ts`) es el único servicio central de sincronización.

Tanto **"Guardar y Enviar a CRM"** (sync individual) como **"Sincronizar Seleccionados"** (bulk) usan la misma función `syncOne()`.

No hay lógica duplicada. No hay rutas paralelas.

## Manejo de errores

| Escenario | Comportamiento |
|-----------|---------------|
| Username con "C" | Error simulado. No se llama a Zoho. Retorna `SIMULATED_ERROR`. |
| Source_Id__c duplicado por otro campo | Zoho retorna `DUPLICATE_DATA`. Se retorna `CONTACT_ALREADY_EXISTS` como conflicto. |
| Error de Zoho | Se retorna `ZOHO_API_ERROR` con el body del error. |
| Fallo en bulk | Cada contacto produce su propio resultado. Un fallo no afecta a los demás. |
| Validación de input | Zod rechaza el request. Retorna `VALIDATION_ERROR` con detalles por campo. |
| Error inesperado | Error handler global. Retorna `INTERNAL_ERROR`. |

## Observabilidad

- **Pino**: logs estructurados JSON.
- **requestId**: UUID único por request (`X-Request-Id` header).
- **requestLogger**: method, url, status, duration.
- **Seguridad**: nunca se logean credenciales ni Authorization headers.

## Testing

```bash
# Backend — 59 tests
cd backend && npm test

# Frontend — 27 tests
cd frontend && npm test
```

### Cobertura de tests

| Suite | Tests | Archivo |
|-------|-------|---------|
| Normalización phone | 9 | `backend/tests/normalization.test.ts` |
| Normalización website | 6 | `backend/tests/website.test.ts` |
| Validación company | 6 | `backend/tests/company.test.ts` |
| Error simulado | 6 | `backend/tests/simulateError.test.ts` |
| Sync individual + bulk (upsert) | 14 | `backend/tests/contactSync.test.ts` |
| Map user → Zoho (Source_Id__c) | 12 | `backend/tests/mapUserToZohoContact.test.ts` |
| Validación inputs | 6 | `backend/tests/validation.test.ts` |
| isValidCompany (frontend) | 6 | `frontend/src/utils/isValidCompany.test.ts` |
| UserTable (frontend) | 10 | `frontend/src/components/UserTable.test.tsx` |
| EditUserDialog (frontend) | 6 | `frontend/src/components/EditUserDialog.test.tsx` |
| StatusChip (frontend) | 5 | `frontend/src/components/StatusChip.test.tsx` |

## Comandos disponibles

### Backend (`backend/`)

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Desarrollo con hot-reload (tsx watch) |
| `npm run build` | Compilar TypeScript |
| `npm start` | Ejecutar build compilado |
| `npm test` | Ejecutar tests (vitest run) |
| `npm run test:watch` | Tests en modo watch |
| `npm run typecheck` | Verificar tipos sin compilar |
| `npm run lint` | Lint (eslint, si está configurado) |

### Frontend (`frontend/`)

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Desarrollo con hot-reload (Vite) |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm test` | Ejecutar tests (vitest run) |
| `npm run test:watch` | Tests en modo watch |
| `npm run typecheck` | Verificar tipos sin compilar |
| `npm run lint` | Lint (oxlint) |

## Seguridad

| Principio | Implementación |
|-----------|---------------|
| Secrets solo en backend | `.env` en `backend/`, nunca en frontend ni en Git |
| CORS sin `origin: "*"` | `CORS_ORIGIN` configurado en backend |
| Frontend no toca Zoho | Comunicación exclusivamente a través del backend |
| Logs sin secretos | Pino nunca registra credenciales ni Authorization headers |
| Validación de input | Zod valida todos los request bodies |

### Archivos protegidos

```
backend/.env              ← NUNCA commitear (está en .gitignore)
ZOHO_CLIENT_SECRET        ← Solo backend, nunca en navegador
ZOHO_REFRESH_TOKEN        ← Solo backend, nunca en navegador
```

## Troubleshooting

| Problema | Solución |
|----------|---------|
| `backend/.env not found` | Ejecutar `cp .env.example backend/.env` y completar credenciales |
| Backend no inicia | Verificar que `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET` y `ZOHO_REFRESH_TOKEN` estén en `backend/.env` |
| CORS error en navegador | Verificar `CORS_ORIGIN` en `backend/.env` coincida con la URL del frontend |
| Zoho retorna 401 | El Refresh Token puede haber expirado. Regenerar en Zoho API Console |
| Frontend no conecta al backend | Verificar que el backend esté corriendo en `:3000` y el proxy de Vite esté activo |

## Decisiones técnicas

- **Monolito modular**: separación clara por capas sin infraestructura innecesaria.
- **ContactSyncService centralizado**: única fuente de verdad para sync individual y bulk.
- **Vite proxy en desarrollo**: evita problemas CORS sin configuración extra en el navegador.
- **Zod para validación**: schema-driven, tipos inferidos automáticamente.
- **Pino**: logging estructurado de alto performance.
- **MUI v9**: UI consistente con system props migradas a `sx`.
- **Error simulado**: usernames con "C" fallan intencionalmente (requerimiento de prueba).

## Entrega

- `./start.sh` — levanta el proyecto completo con un solo comando.
- `postman/collection.json` — 10 requests para probar todos los escenarios.
- `postman/README.md` — guía para obtener/configurar credenciales de Zoho.
- `docs/architecture.md` — documentación detallada de la arquitectura.
