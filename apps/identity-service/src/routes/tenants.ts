import { Router } from 'express';

import { requireTenantAccess, requireRole } from '@cloudmatrix/auth-utils';
import { UserRole } from '@cloudmatrix/shared-types';

export const tenantsRouter: Router = Router();

tenantsRouter.use(requireTenantAccess);

tenantsRouter.get('/', requireRole(UserRole.Admin, UserRole.Analyst), (_req, res) => {
  // TODO: Implement tenant listing
  res.json({ data: [], error: null, meta: { total: 0 } });
});

tenantsRouter.get('/:id', requireRole(UserRole.Admin, UserRole.Analyst), (_req, res) => {
  // TODO: Implement tenant retrieval
  res.json({ data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } });
});

tenantsRouter.post('/', requireRole(UserRole.Admin), (_req, res) => {
  // TODO: Implement tenant creation
  res.status(201).json({ data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } });
});
