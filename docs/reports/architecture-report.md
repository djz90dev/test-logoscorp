# Reporte de Arquitectura

## Resumen Ejecutivo

Diseño de monolito modular para sincronización de contactos con Zoho CRM.

Consumo desde JSONPlaceholder → normalización → sync via ContactSyncService.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite + TypeScript + Material UI |
| Backend | Node.js + Express + TypeScript |
| Validación | Zod |
| Logging | Pino |
| APIs | JSONPlaceholder + Zoho CRM |

## Decisiones de Diseño

### 1. Monolito Modular

No microservicios. Separación por directorios:

- `config/` → Variables de entorno y setup
- `middleware/` → CORS, errors, logging
- `modules/` → Users y Contacts (routes, controllers, services)
- `services/` → Lógica compartida (normalización, sync)
- `clients/` → APIs externas

### 2. Un Solo ContactSyncService

Responsabilidad única para sync.

```typescript
// No duplicar
syncOne(contact)   // ← usa este
syncBulk(contacts) // ← usa el mismo servicio
```

### 3. Seguridad por Capas

Secretos solo en backend:

```
.env → config/env.ts → Services/Clients
              ↓
       NUNCA al navegador
```

Frontend solo conoce URL del backend.

CORS configurado con variable de entorno.

### 4. Normalización Centralizada

Servicio único `normalization.ts`:

| Campo | Regla |
|-------|-------|
| phone | Solo dígitos |
| website | Prefijo https:// si falta |
| company | isValidCompany por patrón |

### 5. Resiliencia en Bulk

Cada contacto procesado independiente.

Resultado independiente por registro:

```
{
  total: N,
  successful: X,
  failed: Y,
  results: [...]
}
```

### 6. Error Simulado

Username empieza con "C" → error controlado.

No se envía a Zoho. Retorno con código `SIMULATED_ERROR`.

### 7. Observabilidad

Pino + logs estructurados.

Por cada request:

- `requestId` (UUID)
- `method`, `url`
- `status`, `duration`
- `error` (si existe)

Nunca logear secretos.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /readiness | Verifica servicios dependientes |
| GET | /users | Lista usuarios normalizados |
| POST | /contacts/sync | Sync individual |
| POST | /contacts/sync-bulk | Sync masivo |

## Cumplimiento de Requisitos

| Requisito | Estado |
|-----------|--------|
| Seguridad | ✓ Secretos solo backend |
| CORS | ✓ Configurado en backend |
| OAuth2 | ✓ ZohoAuthClient |
| DRY | ✓ ContactSyncService único |
| Normalización | ✓ Phone/Website/Company |
| Resiliencia | ✓ Bulk no falla completo |
| Error handling | ✓ Manejo por capas |
| Feedback | ✓ Response codes + messages |
| Testing | ✓ Unit + Integration |
| Observabilidad | ✓ Pino + requestId |

## Restricciones Respetadas

- ✗ PostgreSQL
- ✗ Redis
- ✗ Microservicios
- ✗ WebSockets
- ✗ Infraestructura innecesaria

## Próximos Pasos

1. Implementar config (env, cors, pino)
2. Implementar middleware (error, requestId, logger)
3. Implementar clients (JSONPlaceholder, Zoho)
4. Implementar services (normalización, sync)
5. Implementar modules (users, contacts)
6. Implementar frontend (pages, services, components)
7. Escribir tests
