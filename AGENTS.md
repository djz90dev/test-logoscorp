# AGENTS.md

# Proyecto

Testing LogosCorp Zoho CRM Full-Stack

El sistema consume usuarios desde JSONPlaceholder, normaliza los datos y permite sincronizarlos individualmente o en lote con Zoho CRM.

# Objetivos Técnicos

La aplicación debe mostrar lo siguiente:

- seguridad

- manejo correcto de secretos

- solución arquitectónica para CORS

- separación de responsabilidades

- lógica reutilizable

- normalización de datos

- resiliencia

- manejo controlado de errores

- feedback al usuario

- testing

- observabilidad

- documentación profesional

# Stack

## Frontend

- React

- Vite

- Typescript

- Material UI

## Backend

- Nodejs

- Express

- Typescript

- Zod

- Pino

## API

- JSONPlaceholder

- Zoho CRM

# Arquitectura

Utilizar un monolito modular.

Frontend:

React

→ Backend API

Backend:

Routes

→ Controllers

→ Services

→ External Clients

El frontend nunca debe comunicarse directamente con Zoho.

El backend es responsable de comunicarse con las APIs externas.

# Seguridad

Nunca exponer al navegador:

- ZOHO_CLIENT_ID si no es estrictamente necesario

- ZOHO_CLIENT_SECRET

- ZOHO_REFRESH_TOKEN

- ZOHO_ACCESS_TOKEN

Nunca colocar credenciales reales en el código.

Nunca colocar credenciales reales en documentación.

Nunca colocar credenciales reales en Git.

Nunca registrar credenciales en logs.

Nunca registrar Authorization headers.

# CORS

CORS debe configurarse en backend.

No utilizar:

origin: "*"

Utilizar:

CORS_ORIGIN

# JSONPlaceholder

Fuente:

https://jsonplaceholder.typicode.com/users

# Normalización

## Phone

Eliminar:

- guiones

- puntos

- paréntesis

- extensiones

El resultado debe contener solamente dígitos.

## Website

Si no contiene:

http://

o:

https://

agregar:

https://

## Company

Una empresa es válida cuando company.name contiene:

- Group

- Inc.

- LLC

El modelo normalizado debe indicar:

isValidCompany

# Sincronización

Debe existir un único servicio central:

ContactSyncService

Este servicio debe ser utilizado para:

- sincronización individual

- sincronización masiva

No duplicar lógica.

# Error simulado

Si username comienza con:

C

la sincronización debe fallar intencionalmente.

No se debe enviar ese contacto a Zoho.

# Bulk

Una sincronización masiva no debe detenerse porque falle un registro.

Cada registro debe producir un resultado independiente.

El resultado debe incluir:

- total

- successful

- failed

- results

# Observabilidad

Utilizar:

- Pino

- logs estructurados

- requestId

- duración de requests

- status HTTP

- errores

Nunca registrar secretos.

# Testing

Probar:

- normalización de teléfono

- normalización de website

- validación de empresa

- error simulado

- sincronización individual

- sincronización masiva

- resiliencia del bulk

- errores de Zoho

- validación de inputs

# UI

Utilizar Material UI.

No utilizar:

alert()

Utilizar:

Snackbar

Alert

Dialog

CircularProgress

Skeleton

# Restricciones

No agregar:

- PostgreSQL

- Redis

- microservicios

- WebSockets

- infraestructura innecesaria

El proyecto debe mantenerse simple y proporcional a la prueba técnica.