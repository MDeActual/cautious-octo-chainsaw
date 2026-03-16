import { errorHandler, requestLogger } from '@cloudmatrix/observability';
import cors from 'cors';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';


import { graphRouter } from './routes/graph';
import { healthRouter } from './routes/health';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: false })); // Internal service only
  app.use(
    rateLimit({
      windowMs: parseInt(process.env['GRAPH_RATE_LIMIT_WINDOW_MS'] ?? '60000', 10),
      max: parseInt(process.env['GRAPH_RATE_LIMIT_PER_TENANT'] ?? '100', 10),
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json());
  app.use(requestLogger);

  app.use('/health', healthRouter);
  app.use('/graph', graphRouter);

  app.use(errorHandler);

  return app;
}
