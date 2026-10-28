import { Router, type Router as ExpressRouter } from 'express';
import type { UserInfo } from '../types/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const meRouter: ExpressRouter = Router();
meRouter.get('/me', requireAuth, (req, res) => {
  const principal = req.principal;
  if (!principal) {
    res.status(401).json({ data: null, error: 'Unauthorized' });
    return;
  }
  const userInfo: UserInfo = { user_id: principal.oid, tenant_id: principal.tid };
  res.json({ data: userInfo, error: null });
});
