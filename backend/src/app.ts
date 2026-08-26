import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import usersRouter from './modules/users/users.routes.js';
import contactsRouter from './modules/contacts/contacts.routes.js';
import { JSONPlaceholderClient } from './clients/jsonplaceholder.client.js';
import { ZohoAuthClient } from './clients/zoho.auth.client.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', async (_req, res) => {
  const services: Record<string, string> = {};

  try {
    const jphClient = new JSONPlaceholderClient();
    await jphClient.getUsers();
    services.jsonplaceholder = 'connected';
  } catch {
    services.jsonplaceholder = 'disconnected';
  }

  try {
    const authClient = new ZohoAuthClient();
    await authClient.getAccessToken();
    services.zoho = 'authenticated';
  } catch {
    services.zoho = 'unauthorized';
  }

  const isReady = Object.values(services).every(
    (s) => s === 'connected' || s === 'authenticated'
  );

  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'not ready',
    services,
  });
});

app.use('/api/users', usersRouter);
app.use('/api/contacts', contactsRouter);

app.use(errorHandler);

export default app;
