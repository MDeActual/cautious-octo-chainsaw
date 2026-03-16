import { errorHandler, requestLogger } from '@cloudmatrix/observability';
import cors from 'cors';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';


import { healthRouter } from './routes/health';
import { tenantsRouter } from './routes/tenants';
import { usersRouter } from './routes/users';

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
      credentials: true,
    }),
  );

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Body parsing
  app.use(express.json());

  // Request logging
  app.use(requestLogger);

  // Routes
  app.use('/health', healthRouter);
  app.use('/tenants', tenantsRouter);
  app.use('/users', usersRouter);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
