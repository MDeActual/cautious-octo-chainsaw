import { Router } from 'express';

import { requireTenantAccess } from '@cloudmatrix/auth-utils';

export const graphRouter: Router = Router();

graphRouter.use(requireTenantAccess);

graphRouter.get('/secure-score/:tenantId', (_req, res) => {
  // TODO: Implement Microsoft Secure Score retrieval via Graph API
  res.json({ data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } });
});

graphRouter.get('/users/:tenantId', (_req, res) => {
  // TODO: Implement user listing from Graph API
  res.json({ data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } });
});

graphRouter.get('/conditional-access/:tenantId', (_req, res) => {
  // TODO: Implement conditional access policies retrieval
  res.json({ data: null, error: { code: 'NOT_IMPLEMENTED', message: 'Coming soon' } });
});
