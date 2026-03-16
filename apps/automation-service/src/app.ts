import { errorHandler, requestLogger } from '@cloudmatrix/observability';
import cors from 'cors';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';


import { eventsRouter } from './routes/events';
import { healthRouter } from './routes/health';
import { rulesRouter } from './routes/rules';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: false })); // Internal service
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json());
  app.use(requestLogger);

  app.use('/health', healthRouter);
  app.use('/rules', rulesRouter);
  app.use('/events', eventsRouter);

  app.use(errorHandler);

  return app;
}
