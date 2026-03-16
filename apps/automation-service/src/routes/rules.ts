
import { requireTenantAccess, requireRole } from '@cloudmatrix/auth-utils';
import { UserRole } from '@cloudmatrix/shared-types';
import { Router } from 'express';

export const rulesRouter: Router = Router();

rulesRouter.use(requireTenantAccess);

rulesRouter.get('/', requireRole(UserRole.Admin), (_req, res) => {
  // TODO: Implement automation rule listing
  res.json({ data: [], error: null, meta: { total: 0 } });
});

rulesRouter.post('/', requireRole(UserRole.Admin), (_req, res) => {
  // TODO: Implement automation rule creation
  res.status(501).json({ data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } });
});
