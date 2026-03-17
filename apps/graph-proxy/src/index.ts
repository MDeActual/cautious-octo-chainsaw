import express, { type Express } from 'express';
import cors from 'cors';
import { createLogger } from '@cloudmatrix/logger';
import { loadConfig } from './config.js';
import { healthRouter } from './routes/health.js';
import { createGraphRouter } from './routes/secureScore.js';
import { createTenantRateLimiter } from './middleware/rate-limit.middleware.js';

const config = loadConfig();
const logger = createLogger({ service: 'graph-proxy' });

// Choose real GraphService or MockGraphService based on environment
async function createService() {
  if (config.graphClientId) {
    const { GraphService } = await import('./services/graph.service.js');
    logger.info('Using real GraphService');
    return new GraphService();
  }
  const { MockGraphService } = await import('./services/mock-graph.service.js');
  logger.info('Using MockGraphService (no GRAPH_CLIENT_ID set)');
  return new MockGraphService();
}

const app: Express = express();
app.use(cors());
app.use(express.json());

createService().then((graphService) => {
  const rateLimiter = createTenantRateLimiter();

  app.use('/', healthRouter);
  app.use('/graph', rateLimiter, createGraphRouter(graphService));

  app.use((_req, res) => {
    res.status(404).json({ data: null, error: 'Not found' });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error', { message: err.message });
    res.status(500).json({ data: null, error: 'Internal server error' });
  });

  app.listen(config.port, () => {
    logger.info(`graph-proxy listening on port ${config.port}`);
  });
}).catch((err: unknown) => {
  logger.error('Failed to initialize graph service', { error: String(err) });
  process.exit(1);
});
