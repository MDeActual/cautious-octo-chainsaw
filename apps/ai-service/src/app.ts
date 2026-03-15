import cors from 'cors';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { errorHandler, requestLogger } from '@cloudmatrix/observability';

import { healthRouter } from './routes/health';
import { insightsRouter } from './routes/insights';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 20, // AI calls are expensive
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json());
  app.use(requestLogger);

  app.use('/health', healthRouter);
  app.use('/insights', insightsRouter);

  app.use(errorHandler);

  return app;
}
