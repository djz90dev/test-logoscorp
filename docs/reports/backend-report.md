# Reporte Backend

## Resumen

Backend implementado con Node.js + Express + TypeScript + Zod + Pino.

Monolito modular con separación de responsabilidades.

## Estructura

```
backend/src/
├── config/
│   ├── env.ts              # Validación de variables (Zod)
│   ├── cors.ts             # Configuración CORS
│   └── logger.ts           # Pino logger
├── middleware/
│   ├── errorHandler.ts     # Error handler centralizado
│   ├── requestId.ts        # Asignación de requestId
│   ├── requestLogger.ts    # Logging de requests
│   └── validateRequest.ts  # Validación con Zod
├── modules/
│   ├── users/
│   │   ├── users.routes.ts
│   │   └── users.controller.ts
│   └── contacts/
│       ├── contacts.routes.ts
│       ├── contacts.controller.ts
│       └── contacts.schema.ts
├── clients/
│   ├── jsonplaceholder.client.ts
│   ├── zoho.auth.client.ts
│   └── zoho.crm.client.ts
├── services/
│   ├── normalization.ts
│   ├── contactSync.service.ts
│   └── simulateError.ts
├── shared/
│   └── types.ts
├── app.ts
└── server.ts
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /ready | Readiness check |
| GET | /api/users | Lista usuarios normalizados |
| POST | /api/contacts/sync | Sync individual |
| POST | /api/contacts/sync-bulk | Sync masivo |

## Configuración

### Variables de Entorno

| Variable | Requerida | Default |
|----------|-----------|---------|
| PORT | No | 3000 |
| CORS_ORIGIN | No | http://localhost:5173 |
| JSONPLACEHOLDER_BASE_URL | No | https://jsonplaceholder.typicode.com |
| ZOHO_CLIENT_ID | **Sí** | - |
| ZOHO_CLIENT_SECRET | **Sí** | - |
| ZOHO_REFRESH_TOKEN | **Sí** | - |
| ZOHO_ACCOUNT_SERVER | No | https://accounts.zoho.com |
| ZOHO_API_BASE_URL | No | https://www.zohoapis.com/crm/v2 |
| ZOHO_ACCESS_TOKEN | No | - |

### Validación

Zod valida todas las variables al iniciar.

Si falta una requerida → `process.exit(1)`.

## Seguridad

### CORS

- Configurado con `CORS_ORIGIN`
- Nunca `origin: "*"`
- Credentials: true

### Secretos

- Variables en `.env`
- `.env` en `.gitignore`
- Pino redact: `authorization`, `password`, `secret`, `token`
- Nunca logear Authorization header

### Error Handler

- No devuelve stack traces en producción
- Errores 500 → "Internal server error"
- Errores 4xx → mensaje descriptivo

## Normalización

### Phone

```
"+1 (555) 123-4567 ext. 8" → "155512345678"
```

### Website

```
"example.com" → "https://example.com"
```

### Company

Válida si `company.name` contiene: Group, Inc., LLC

## ContactSyncService

Único servicio central para sync.

```typescript
syncOne(user, accessToken) → SyncResult
syncBulk(users, accessToken) → BulkSyncResult
```

### Error Simulado

Username empieza con "C" → `SIMULATED_ERROR`.

No llama a Zoho.

### Bulk Resilience

Cada usuario procesado independiente.

Fallo no detiene los demás.

## Observabilidad

### Pino Logger

Logs estructurados JSON.

### Datos por Request

- `requestId` (UUID)
- `method`, `url`
- `status`, `duration`
- `error` (si existe)

### Redaction

```
req.headers.authorization
*.password
*.secret
*.token
```

## Tests

```
✓ normalization.test.ts (9 tests)
✓ website.test.ts (6 tests)
✓ company.test.ts (6 tests)
✓ simulateError.test.ts (6 tests)
✓ contactSync.test.ts (7 tests)
✓ validation.test.ts (6 tests)

Total: 40 tests passing
```

### Cobertura

| Test | Tipo |
|------|------|
| Phone normalization | Unit |
| Website normalization | Unit |
| Company validation | Unit |
| Simulated error | Unit |
| Individual sync | Integration |
| Bulk sync | Integration |
| Bulk resilience | Integration |
| Zoho errors | Integration |
| Input validation | Unit |

## Scripts

| Script | Comando |
|--------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Test | `npm test` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |

## Cumplimiento

| Requisito | Estado |
|-----------|--------|
| Seguridad | ✓ Secretos solo backend |
| CORS | ✓ Configurado en backend |
| DRY | ✓ ContactSyncService único |
| Normalización | ✓ Phone/Website/Company |
| Resiliencia | ✓ Bulk no falla completo |
| Error handling | ✓ Middleware centralizado |
| Observabilidad | ✓ Pino + requestId |
| Validation | ✓ Zod schemas |
| Testing | ✓ 40 tests passing |
