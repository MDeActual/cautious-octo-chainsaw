import express, { type Express } from 'express';
import cors from 'cors';
import { createTokenValidator, loadAuthConfig, type TokenValidator } from '@cloudmatrix/auth-utils';
import { healthRouter } from './routes/health.js';
import { assessmentsRouter } from './routes/assessments.js';
import { complianceRouter } from './routes/compliance.js';
import { leadsRouter } from './routes/leads.js';
import { requirePrincipal, requireTenantConsistency } from './auth.js';

export function createApp(validate: TokenValidator = createTokenValidator(loadAuthConfig())): Express {
  const app: Express = express();
  app.use(cors());
  app.use('/', healthRouter);
  app.use(requirePrincipal(validate));
  app.use(express.json({ limit: '100kb' }));
  app.use(requireTenantConsistency);
  app.use('/assessments', assessmentsRouter);
  app.use('/compliance', complianceRouter);
  app.use('/leads', leadsRouter);
  app.use((_req, res) => { res.status(404).json({ data: null, error: 'Not found' }); });
  app.use((_err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ data: null, error: 'Internal server error' });
  });
  return app;
}
