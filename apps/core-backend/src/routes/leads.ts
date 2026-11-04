import { Router, type Router as ExpressRouter } from 'express';
import { requireTenantConsistency } from '../auth.js';

export const leadsRouter: ExpressRouter = Router();
leadsRouter.use('/:tenantId', requireTenantConsistency);
// Retired rather than exposing mock collection, guessed compliance, or inferred sales intent.
leadsRouter.use((_req, res) => {
  res.status(410).json({ data: null,
    error: 'Legacy simulated endpoint retired. Use /assessment-evidence for verified read-only results.',
    code: 'LEGACY_ENDPOINT_RETIRED' });
});
