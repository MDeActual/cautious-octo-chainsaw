import express, { type Express } from 'express';
import { createLogger } from '@cloudmatrix/logger';
import { loadConfig } from './config.js';
import { healthRouter } from './routes/health.js';
import { summariesRouter } from './routes/summaries.js';
import { summaryRouter } from './routes/summary.js';

const config = loadConfig();
const logger = createLogger({ service: 'ai-service' });

const app: Express = express();
app.use(express.json());

app.use('/', healthRouter);
app.use('/summaries', summariesRouter);
app.use('/summary', summaryRouter);

app.use((_req, res) => {
  res.status(404).json({ data: null, error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message });
  res.status(500).json({ data: null, error: 'Internal server error' });
});

app.listen(config.port, () => {
  logger.info(`ai-service listening on port ${config.port}`);
});

export { app };
