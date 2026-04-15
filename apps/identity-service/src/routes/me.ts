import { Router, type Router as ExpressRouter } from 'express';
import type { UserInfo } from '../types/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const meRouter: ExpressRouter = Router();

/**
 * GET /me — Returns authenticated user information from JWT token
 */
meRouter.get('/me', requireAuth, (req, res) => {
  const claims = req.claims;

  // Validate that all required claims are present
  if (!claims || !claims.sub || !claims.email || !claims.role || !claims.tenant_id) {
    res.status(401).json({ data: null, error: 'Unauthorized: missing required claims' });
    return;
  }

  const userInfo: UserInfo = {
    user_id: claims.sub,
    email: claims.email,
    role: claims.role,
    tenant_id: claims.tenant_id,
  };

  res.json({ data: userInfo, error: null });
});
