import app from './app.js';
import { config } from './config/env.js';
import { logger } from './config/logger.js';

const server = app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  server.close(() => {
    process.exit(0);
  });
});
