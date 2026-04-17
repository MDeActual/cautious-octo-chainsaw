import express, { type Express } from 'express';
import { createLogger } from '@cloudmatrix/logger';
import { loadConfig } from './config.js';
import { healthRouter } from './routes/health.js';
import { eventsRouter } from './routes/events.js';
import { actionsRouter } from './routes/actions.js';

const config = loadConfig();
const logger = createLogger({ service: 'automation-service' });

const app: Express = express();
app.use(express.json());

app.use('/', healthRouter);
app.use('/events', eventsRouter);
app.use('/', actionsRouter);

app.use((_req, res) => {
  res.status(404).json({ data: null, error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message });
  res.status(500).json({ data: null, error: 'Internal server error' });
});

app.listen(config.port, () => {
  logger.info(`automation-service listening on port ${config.port}`);
});

export { app };
