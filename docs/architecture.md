# Arquitectura del Sistema

## Visión General

Monolito modular: React → Backend API → External Clients.

Frontend nunca toca Zoho directo. Backend media todas las comunicaciones externas.

## Diagrama de Capas

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  React + Vite + TypeScript + Material UI                │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────────────────────┐ │
│  │  Pages  │→ │Services │→ │   Backend API (fetch)   │ │
│  └─────────┘  └─────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND                              │
│  Node.js + Express + TypeScript + Zod + Pino            │
│                                                         │
│  Routes → Controllers → Services → External Clients     │
│                                                         │
│  ┌───────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │Middleware  │→ │Validation│→ │   Logging (Pino)   │   │
│  │CORS/Auth  │  │  (Zod)   │  │                    │   │
│  └───────────┘  └──────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │JSONPlaceholder│  │   Zoho     │  │   Zoho     │
   │    (GET)     │  │  Auth API  │  │  CRM API   │
   └─────────────┘  └─────────────┘  └─────────────┘
```

## Estructura de Directorios

```
src/
├── config/
│   ├── env.ts              # Validación de variables de entorno (Zod)
│   ├── cors.ts             # Configuración CORS
│   └── pino.ts             # Configuración de logging
├── middleware/
│   ├── errorHandler.ts     # Error handler global
│   ├── requestId.ts        # Asignación de requestId
│   ├── requestLogger.ts    # Logging de requests
│   └── validateRequest.ts  # Validación genérica con Zod
├── modules/
│   ├── users/
│   │   ├── users.routes.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.schema.ts
│   └── contacts/
│       ├── contacts.routes.ts
│       ├── contacts.controller.ts
│       ├── contacts.service.ts
│       └── contacts.schema.ts
├── services/
│   ├── normalization.ts    # Phone, Website, Company
│   ├── contactSync.service.ts  # Sync individual + bulk
│   └── simulateError.ts    # Error simulado usernames "C"
├── clients/
│   ├── jsonplaceholder.client.ts
│   ├── zoho.auth.client.ts
│   └── zoho.crm.client.ts
├── types/
│   ├── user.ts
│   ├── contact.ts
│   └── sync.ts
└── app.ts                  # Express app setup
    server.ts               # Server startup
```

## Capas

### Frontend (React)

- **Pages**: Componentes de página
- **Services**: Llamadas fetch al backend
- **UI Components**: Componentes Material UI reutilizables

### Backend

#### Routes

Define endpoints y asocia controllers.

#### Controllers

Reciben req, validan input, llaman services, retornan response.

No contienen lógica de negocio.

#### Services

Lógica de negocio pura.

- **UsersService**: Obtiene y normaliza usuarios
- **ContactsService**: Prepara contactos para sync
- **ContactSyncService**: Sync individual y bulk (único servicio central)

#### External Clients

Abstracción de APIs externas.

- **JSONPlaceholderClient**: GET usuarios
- **ZohoAuthClient**: OAuth2 token refresh
- **ZohoCRMClient**: CRUD contactos en Zoho

## Seguridad

### Flujo de Secretos

```
.env (backend) → config/env.ts → Services/Clients
                         ↓
              NUNCA al navegador
```

### Variables Protegidas

| Variable | Exposición |
|----------|------------|
| ZOHO_CLIENT_SECRET | Solo backend |
| ZOHO_REFRESH_TOKEN | Solo backend |
| ZOHO_ACCESS_TOKEN | Solo backend (cache) |
| ZOHO_CLIENT_ID | Backend (puede exponerse si necesario) |
| CORS_ORIGIN | Backend config |

### CORS

Configurado en backend con variable `CORS_ORIGIN`.

Nunca `origin: "*"`.

### Desarrollo Local — Proxy

Vite sirve en `:5173`, backend en `:3000`.

En desarrollo, Vite proxy redirige `/api/*` al backend:

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

Frontend usa ruta relativa `/api` (sin hostname):

```ts
const API_BASE = '/api';
```

El navegador carga React de `:5173`. Las llamadas a `/api/users` van al Vite dev server, que las proxy a `:3000/api/users`. Sin CORS cross-origin.

CORS en backend se mantiene porque:
1. Es requisito de seguridad de la prueba
2. En producción, si frontend y backend están en dominios distintos, CORS es necesario
3. El proxy de Vite es solo para desarrollo local

## Normalización

### Phone

```
"+1 (555) 123-4567 ext. 8" → "15551234567"
```

Eliminar: `-`, `.`, `()`, `ext.`, espacios.

Resultado: solo dígitos.

### Website

```
"example.com" → "https://example.com"
```

Si no tiene `http://` o `https://`, agregar `https://`.

### Company

Validar `company.name` contra patrones:

- Contiene "Group" → válido
- Contiene "Inc." → válido
- Contiene "LLC" → válido

Resultado: `isValidCompany: boolean`.

## Sincronización

### ContactSyncService

Servicio único para sync individual y bulk.

```typescript
class ContactSyncService {
  async syncOne(contact: Contact): Promise<SyncResult>
  async syncBulk(contacts: Contact[]): Promise<BulkSyncResult>
}
```

### Error Simulado

Si `username` comienza con "C":

- No enviar a Zoho
- Retornar error con mensaje descriptivo

### Bulk Resilience

Cada contacto produce resultado independiente.

Un fallo no detiene los demás.

```
{
  total: 10,
  successful: 8,
  failed: 2,
  results: [...]
}
```

## Observabilidad

### Pino Logger

Logs estructurados JSON.

### Datos por Request

| Campo | Descripción |
|-------|-------------|
| requestId | UUID único por request |
| method | HTTP method |
| url | Request URL |
| status | HTTP status code |
| duration | Tiempo en ms |
| error | Stack trace (si existe) |

### Restricciones

Nunca logear:

- Credenciales
- Authorization headers
- Tokens de acceso

## Testing

| Test | Tipo |
|------|------|
| Normalización phone | Unit |
| Normalización website | Unit |
| Validación company | Unit |
| Error simulado | Unit |
| Sync individual | Integration |
| Sync bulk | Integration |
| Resiliencia bulk | Integration |
| Errores Zoho | Integration |
| Validación inputs | Unit |
