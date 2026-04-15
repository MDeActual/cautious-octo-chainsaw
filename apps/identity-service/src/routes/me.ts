import { Router, type Router as ExpressRouter } from 'express';
import type { UserInfo } from '../types/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const meRouter: ExpressRouter = Router();

/**
 * GET /me — Returns authenticated user information from JWT token
 */
meRouter.get('/me', requireAuth, (req, res) => {
  if (!req.claims) {
    res.status(401).json({ data: null, error: 'Unauthorized' });
    return;
  }

  const userInfo: UserInfo = {
    user_id: req.claims.sub,
    email: req.claims.email,
    role: req.claims.role,
    tenant_id: req.claims.tenant_id,
  };

  res.json({ data: userInfo, error: null });
});
