import cors from 'cors';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { errorHandler, requestLogger } from '@cloudmatrix/observability';

import { healthRouter } from './routes/health';
import { assessmentsRouter } from './routes/assessments';
import { complianceRouter } from './routes/compliance';

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
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json());
  app.use(requestLogger);

  app.use('/health', healthRouter);
  app.use('/assessments', assessmentsRouter);
  app.use('/compliance', complianceRouter);

  app.use(errorHandler);

  return app;
}
