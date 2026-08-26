# Zoho CRM Contact Sync

Sistema full-stack que consume usuarios desde JSONPlaceholder, normaliza los datos y permite sincronizarlos individualmente o en lote con Zoho CRM.

## Requisitos

- Node.js 18+

## Inicio Rápido

```bash
./start.sh
```

El script:

1. Verifica Node.js
2. Verifica `backend/.env`
3. Instala dependencias si faltan
4. Inicia backend y frontend

## Configuración

Crear `backend/.env`:

```
ZOHO_CLIENT_ID=tu_client_id
ZOHO_CLIENT_SECRET=tu_client_secret
ZOHO_REFRESH_TOKEN=tu_refresh_token
```

## URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health check | http://localhost:3000/health |

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /ready | Readiness check |
| GET | /api/users | Lista usuarios normalizados |
| POST | /api/contacts/sync | Sincronización individual |
| POST | /api/contacts/sync-bulk | Sincronización masiva |

## Stack

**Frontend:** React, Vite, TypeScript, Material UI v9

**Backend:** Node.js, Express, TypeScript, Zod, Pino

**APIs:** JSONPlaceholder, Zoho CRM

## Arquitectura

```
React → Vite Proxy → Backend API → External Clients
```

- Frontend nunca se comunica directamente con Zoho
- Backend media todas las comunicaciones externas
- CORS configurado en backend (requisito de seguridad)

## Desarrollo

```bash
# Iniciar todo
./start.sh

# Solo backend
cd backend && npm run dev

# Solo frontend
cd frontend && npm run dev
```

## Testing

```bash
cd backend && npm test   # 40 tests
cd frontend && npm test  # 19 tests
```

## Seguridad

- Secrets solo en backend (nunca en frontend)
- CORS configurado con `CORS_ORIGIN`
- Nunca `origin: "*"`
- Pino redacta credenciales en logs
