import express, { type Express } from 'express';
import cors from 'cors';
import { createLogger } from '@cloudmatrix/logger';
import { loadConfig } from './config.js';
import { healthRouter } from './routes/health.js';
import { assessmentsRouter } from './routes/assessments.js';
import { complianceRouter } from './routes/compliance.js';
import { leadsRouter } from './routes/leads.js';
import { copilotReadinessRouter } from './routes/copilot-readiness.js';
import { cspReportRouter } from './routes/csp-report.js';

const config = loadConfig();
const logger = createLogger({ service: 'core-backend' });

const app: Express = express();
app.use(cors());
app.use(express.json());

app.use('/', healthRouter);
app.use('/assessments', assessmentsRouter);
app.use('/compliance', complianceRouter);
app.use('/leads', leadsRouter);
app.use('/copilot-readiness', copilotReadinessRouter);
app.use('/csp/monthly-report', cspReportRouter);

app.use((_req, res) => {
  res.status(404).json({ data: null, error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message });
  res.status(500).json({ data: null, error: 'Internal server error' });
});

app.listen(config.port, () => {
  logger.info(`core-backend listening on port ${config.port}`);
});

export { app };
