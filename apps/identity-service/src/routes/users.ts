
import { requireTenantAccess, requireRole } from '@cloudmatrix/auth-utils';
import { UserRole } from '@cloudmatrix/shared-types';
import { Router } from 'express';

export const usersRouter: Router = Router();

usersRouter.use(requireTenantAccess);

usersRouter.get('/me', (_req, res) => {
  // TODO: Implement current user retrieval
  res.status(501).json({ data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } });
});

usersRouter.get('/', requireRole(UserRole.Admin), (_req, res) => {
  // TODO: Implement user listing
  res.json({ data: [], error: null, meta: { total: 0 } });
});
