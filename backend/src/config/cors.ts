import cors from 'cors';
import { config } from './env.js';

export const corsOptions: cors.CorsOptions = {
  origin: config.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400,
};
