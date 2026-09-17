import fs from 'node:fs';
import path from 'node:path';
import express, { type Express } from 'express';
import dotenv from 'dotenv';
import { createLogger } from '@cloudmatrix/logger';
import { loadConfig } from './config.js';
import { healthRouter } from './routes/health.js';
import { meRouter } from './routes/me.js';

const entryFile = process.argv[1]
  ? path.isAbsolute(process.argv[1])
    ? process.argv[1]
    : path.resolve(process.cwd(), process.argv[1])
  : path.resolve(process.cwd(), 'dist/server.js');
const envPath = path.resolve(path.dirname(entryFile), '../.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const config = loadConfig();
const logger = createLogger({ service: 'identity-service' });

const app: Express = express();
app.use(express.json());

// Routes
app.use('/', healthRouter);
app.use('/', meRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ data: null, error: 'Not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({ data: null, error: 'Internal server error' });
});

app.listen(config.port, () => {
  logger.info(`identity-service listening on port ${config.port}`);
});

export { app };
