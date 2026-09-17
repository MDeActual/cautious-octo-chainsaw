import fs from 'node:fs';
import path from 'node:path';
import express, { type Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger } from '@cloudmatrix/logger';
import { loadConfig } from './config.js';
import { healthRouter } from './routes/health.js';
import { aiRouter } from './routes/ai.js';

const entryFile = process.argv[1]
  ? path.resolve(process.cwd(), process.argv[1])
  : path.resolve(process.cwd(), 'dist/index.js');
const envPath = path.resolve(path.dirname(entryFile), '../.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const config = loadConfig();
const logger = createLogger({ service: 'ai-service' });

if (!config.azureOpenAiEndpoint || !config.azureOpenAiApiKey) {
  logger.warn('AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY not set — using mock AI responses');
}

const app: Express = express();
app.use(cors());
app.use(express.json());

app.use('/', healthRouter);
app.use('/ai', aiRouter);

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
