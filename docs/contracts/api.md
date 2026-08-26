# Contratos API

Base URL: `http://localhost:3000/api`

## Health

### GET /health

Health check del servicio.

**Response: 200**

```json
{
  "status": "ok",
  "timestamp": "2026-08-26T12:00:00.000Z"
}
```

### GET /readiness

Verifica conectividad con servicios dependientes.

**Response 200:**

```json
{
  "status": "ready",
  "services": {
    "jsonplaceholder": "connected",
    "zoho": "authenticated"
  }
}
```

**Response 503:**

```json
{
  "status": "not ready",
  "services": {
    "jsonplaceholder": "connected",
    "zoho": "unauthorized"
  }
}
```

---

## Users

### GET /users

Obtiene usuarios desde JSONPlaceholder, normalizados.

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Leanne Graham",
      "username": "Bret",
      "email": "Sincere@april.biz",
      "phone": "1-770-736-803164",
      "website": "hildegard.org",
      "company": {
        "name": "Romaguera-Crona",
        "catchPhrase": "Multi-layered client-server neural-net",
        "bs": "harness real-time e-markets"
      },
      "normalizedPhone": "1770736803164",
      "normalizedWebsite": "https://hildegard.org",
      "isValidCompany": false
    }
  ]
}
```

**Response 500:**

```json
{
  "error": {
    "message": "Failed to fetch users",
    "code": "EXTERNAL_API_ERROR"
  }
}
```

---

## Contacts Sync

### POST /contacts/sync

Sincroniza un contacto individual con Zoho CRM.

**Request:**

```json
{
  "user": {
    "id": 1,
    "name": "Leanne Graham",
    "username": "Bret",
    "email": "Sincere@april.biz",
    "phone": "1-770-736-803164",
    "website": "hildegard.org",
    "company": {
      "name": "Romaguera-Crona"
    }
  }
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "contactId": "1234567890",
    "message": "Contact synced successfully"
  }
}
```

**Response 400 (username starts with "C"):**

```json
{
  "success": false,
  "error": {
    "message": "Simulated error: username starts with C",
    "code": "SIMULATED_ERROR"
  }
}
```

**Response 422 (validation error):**

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Response 500 (Zoho error):**

```json
{
  "success": false,
  "error": {
    "message": "Zoho CRM API error",
    "code": "ZOHO_API_ERROR"
  }
}
```

### POST /contacts/sync-bulk

Sincroniza múltiples contactos. Fallos individuales no detienen el proceso.

**Request:**

```json
{
  "users": [
    {
      "id": 1,
      "name": "Leanne Graham",
      "username": "Bret",
      "email": "Sincere@april.biz",
      "phone": "1-770-736-803164",
      "website": "hildegard.org",
      "company": {
        "name": "Romaguera-Crona"
      }
    },
    {
      "id": 2,
      "name": "Ervin Howell",
      "username": "Clementine",
      "email": "Shanna@melissa.tv",
      "phone": "010-692-6593 x09125",
      "website": "anastasia.net",
      "company": {
        "name": "Deckow-Crist"
      }
    }
  ]
}
```

**Response 200:**

```json
{
  "total": 2,
  "successful": 1,
  "failed": 1,
  "results": [
    {
      "userId": 1,
      "success": true,
      "contactId": "1234567890"
    },
    {
      "userId": 2,
      "success": false,
      "error": {
        "message": "Simulated error: username starts with C",
        "code": "SIMULATED_ERROR"
      }
    }
  ]
}
```

---

## Errores Globales

### Headers comunes

```
X-Request-Id: uuid
Content-Type: application/json
```

### Error Response Schema

```json
{
  "error": {
    "message": "string",
    "code": "string",
    "details": []
  }
}
```

### Error Codes

| Code | Descripción |
|------|-------------|
| EXTERNAL_API_ERROR | Error consumiendo API externa |
| VALIDATION_ERROR | Input inválido |
| SIMULATED_ERROR | Error simulado (username "C") |
| ZOHO_API_ERROR | Error en Zoho CRM API |
| ZOHO_AUTH_ERROR | Error de autenticación Zoho |
| INTERNAL_ERROR | Error interno del servidor |
