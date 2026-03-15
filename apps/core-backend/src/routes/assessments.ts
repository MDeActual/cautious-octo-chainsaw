import { Router } from 'express';

import { requireTenantAccess, requireRole } from '@cloudmatrix/auth-utils';
import { UserRole } from '@cloudmatrix/shared-types';

export const assessmentsRouter: Router = Router();

assessmentsRouter.use(requireTenantAccess);

assessmentsRouter.get('/', requireRole(UserRole.Admin, UserRole.Analyst), (_req, res) => {
  // TODO: Implement assessment listing
  res.json({ data: [], error: null, meta: { total: 0 } });
});

assessmentsRouter.get('/:id', requireRole(UserRole.Admin, UserRole.Analyst), (_req, res) => {
  // TODO: Implement assessment retrieval
  res.json({ data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } });
});

assessmentsRouter.post(
  '/',
  requireRole(UserRole.Admin, UserRole.Analyst),
  (_req, res) => {
    // TODO: Implement assessment creation - triggers Graph Proxy calls
    res.status(202).json({ data: { message: 'Assessment queued' }, error: null });
  },
);
